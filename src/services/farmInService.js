import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

const toStr = (v) => String(v);

async function replaceProfileById(profileId, mergedFields) {
  const baseRes = await axios.get(`${API_BASE}/profile/${profileId}`);
  const base = baseRes.data ?? {};
  const next = {
    ...base,
    ...mergedFields,
    id: base.id ?? profileId,
  };
  await axios.delete(`${API_BASE}/profile/${profileId}`);
  const createdRes = await axios.post(`${API_BASE}/profile`, next);
  return createdRes.data;
}

async function tryFetchFarmInAll() {
  try {
    const res = await axios.get(`${API_BASE}/farmIn`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) return null;
    throw error;
  }
}

export async function fetchFarmInAll() {
  const rows = await tryFetchFarmInAll();
  return Array.isArray(rows) ? rows : [];
}

export async function fetchFarmIdsByUser(userId) {
  const uid = toStr(userId);
  const rows = await tryFetchFarmInAll();
  if (rows) {
    return Array.from(
      new Set(
        rows
          .filter((row) => toStr(row.userId) === uid)
          .map((row) => toStr(row.targetFarm)),
      ),
    );
  }

  // fallback: legacy source from profile.farm
  const profileRes = await axios.get(`${API_BASE}/profile`);
  const profiles = Array.isArray(profileRes.data) ? profileRes.data : [];
  const me = profiles.find((p) => toStr(p.id) === uid);
  const farms = Array.isArray(me?.farm) ? me.farm.map(toStr) : [];
  return Array.from(new Set(farms));
}

export async function fetchFarmMemberCounts() {
  const rows = await tryFetchFarmInAll();
  if (rows) {
    const counts = {};
    rows.forEach((row) => {
      const farmId = toStr(row.targetFarm);
      counts[farmId] = (counts[farmId] ?? 0) + 1;
    });
    return counts;
  }

  // fallback: count from profile.farm
  const profileRes = await axios.get(`${API_BASE}/profile`);
  const profiles = Array.isArray(profileRes.data) ? profileRes.data : [];
  const counts = {};
  profiles.forEach((user) => {
    const farms = Array.isArray(user.farm) ? user.farm.map(toStr) : [];
    farms.forEach((farmId) => {
      counts[farmId] = (counts[farmId] ?? 0) + 1;
    });
  });
  return counts;
}

export async function fetchUserIdsByFarm(targetFarm) {
  const farmId = toStr(targetFarm);
  const rows = await tryFetchFarmInAll();
  if (rows) {
    return Array.from(
      new Set(
        rows
          .filter((row) => toStr(row.targetFarm) === farmId)
          .map((row) => toStr(row.userId)),
      ),
    );
  }

  // fallback: legacy source from profile.farm
  const profileRes = await axios.get(`${API_BASE}/profile`);
  const profiles = Array.isArray(profileRes.data) ? profileRes.data : [];
  return profiles
    .filter((user) => Array.isArray(user.farm) && user.farm.map(toStr).includes(farmId))
    .map((user) => toStr(user.id));
}

export async function joinFarmIn(targetFarm, userId) {
  const farmId = toStr(targetFarm);
  const uid = toStr(userId);
  const rows = await tryFetchFarmInAll();
  if (rows) {
    const exists = rows.some(
      (row) => toStr(row.targetFarm) === farmId && toStr(row.userId) === uid,
    );
    if (exists) return null;

    const res = await axios.post(`${API_BASE}/farmIn`, {
      targetFarm: farmId,
      userId: uid,
    });
    return res.data;
  }

  // fallback: legacy write to profile.farm
  const profileRes = await axios.get(`${API_BASE}/profile/${uid}`);
  const profile = profileRes.data ?? {};
  const nextFarm = Array.from(
    new Set([...(Array.isArray(profile.farm) ? profile.farm.map(toStr) : []), farmId]),
  );
  await replaceProfileById(uid, { farm: nextFarm });
  return null;
}

export async function leaveFarmIn(targetFarm, userId) {
  const farmId = toStr(targetFarm);
  const uid = toStr(userId);
  const rows = await tryFetchFarmInAll();
  if (rows) {
    const targets = rows.filter(
      (row) => toStr(row.targetFarm) === farmId && toStr(row.userId) === uid,
    );
    await Promise.all(
      targets.map((row) => axios.delete(`${API_BASE}/farmIn/${row.id}`)),
    );
    return;
  }

  // fallback: legacy write to profile.farm
  const profileRes = await axios.get(`${API_BASE}/profile/${uid}`);
  const profile = profileRes.data ?? {};
  const nextFarm = (Array.isArray(profile.farm) ? profile.farm.map(toStr) : []).filter(
    (id) => id !== farmId,
  );
  await replaceProfileById(uid, { farm: nextFarm });
}
