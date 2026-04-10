<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore.js';
import { usePigSystem } from '../composables/usePigSystem.js';
import PigPixelArt from '../components/PigPixelArt.vue';
import PigBackground from '../components/PigBackground.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { PIG_LEVELS, HOUSE_LEVELS } = usePigSystem();
const topAnchor = ref(null);
const bottomAnchor = ref(null);

const pigLevels = computed(() => [...PIG_LEVELS].sort((a, b) => b.level - a.level));
const houseLevels = computed(() => [...HOUSE_LEVELS].sort((a, b) => a.level - b.level));
const isFromLogin = computed(() => route.query.source === 'login');

function getPigRangeLabel(index) {
  const current = pigLevels.value[index];
  const previous = pigLevels.value[index - 1];

  if (!current) return '';
  if (current.maxRatio === Infinity) {
    return previous ? `${previous.maxRatio}%+` : '전체 구간';
  }
  if (!previous) {
    return `0~${current.maxRatio}%`;
  }
  return `${previous.maxRatio}~${current.maxRatio}%`;
}

function goNext() {
  if (window.history.length > 1 && !isFromLogin.value) {
    router.back();
    return;
  }

  // 온보딩(Setup -> Guide) 완료 후 홈으로 이동
  router.push('/');
}

function scrollToTop() {
  topAnchor.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function scrollToBottom() {
  bottomAnchor.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
}
</script>

<template>
  <div class="guide-page">
    <div ref="topAnchor" class="scroll-anchor" aria-hidden="true"></div>
    <section class="guide-hero">
      <div>
        <p class="eyebrow">APP GUIDE</p>
        <h1 class="page-title">돼지와 집 변화 가이드</h1>
        <p class="page-desc">
          하루 지출 비율에 따라 돼지 표정이 변하고, 한 달 소비 흐름에 따라
          집이 단계별로 성장하거나 내려가요.
        </p>
      </div>
      <button class="close-btn" @click="goNext">
        {{ isFromLogin ? '시작하기' : '닫기' }}
      </button>
    </section>

    <section class="guide-section">
      <div class="section-head">
        <h2>돼지 상태 10단계</h2>
        <p>하루 예산을 얼마나 잘 지켰는지에 따라 오늘의 돼지가 달라져요.</p>
      </div>

      <div class="pig-grid">
        <article
          v-for="(pig, index) in pigLevels"
          :key="pig.level"
          class="pig-card"
          :style="{
            '--card-bg': pig.bgColor,
            '--card-border': pig.borderColor,
            '--card-accent': pig.color,
          }"
        >
          <div class="pig-visual">
            <PigPixelArt :level="pig.level" class="pig-art" />
          </div>
          <div class="pig-copy">
            <div class="pig-topline">
              <span class="pig-level">Lv.{{ pig.level }}</span>
              <span class="pig-range">
                {{ getPigRangeLabel(index) }}
              </span>
            </div>
            <strong class="pig-label">{{ pig.label }}</strong>
            <p class="pig-message">{{ pig.message }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="guide-section">
      <div class="section-head">
        <h2>집 성장 5단계</h2>
        <p>월 평균 소비를 안정적으로 관리하면 집도 점점 좋아져요.</p>
      </div>

      <div class="house-list">
        <article
          v-for="house in houseLevels"
          :key="house.level"
          class="house-card"
        >
          <div class="house-preview">
            <PigBackground :house-level="house.level" class="house-bg" />
            <div class="house-overlay">
              <span class="house-level">STEP {{ house.level }}</span>
              <span class="house-emoji">{{ house.emoji }}</span>
            </div>
          </div>
          <div class="house-copy">
            <strong>{{ house.name }}</strong>
            <p>{{ house.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <div class="scroll-fab-group">
      <button
        class="scroll-fab"
        type="button"
        aria-label="맨 위로 이동"
        @click="scrollToTop"
      >
        UP
      </button>
      <button
        class="scroll-fab"
        type="button"
        aria-label="맨 아래로 이동"
        @click="scrollToBottom"
      >
        DN
      </button>
    </div>
    <div ref="bottomAnchor" class="scroll-anchor" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.guide-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.scroll-anchor {
  width: 100%;
  height: 1px;
}

.guide-hero,
.guide-section {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 20px;
}

.guide-hero {
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--primary);
}

.page-title {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 900;
}

.page-desc {
  margin: 0.55rem 0 0;
  font-size: 0.86rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 560px;
}

.close-btn {
  flex-shrink: 0;
  border: none;
  border-radius: 14px;
  padding: 0.8rem 1rem;
  background: var(--primary);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.guide-section {
  padding: 1.1rem;
}

.section-head {
  margin-bottom: 0.9rem;
}

.section-head h2 {
  margin: 0;
  font-size: 1rem;
}

.section-head p {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.pig-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.pig-card {
  background: var(--card-bg);
  border: 1.5px solid var(--card-border);
  border-radius: 18px;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pig-visual {
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 14px;
}

.pig-art {
  width: 78px;
  height: auto;
}

.pig-copy {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.pig-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.pig-level {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: var(--card-accent);
  color: #fff;
  padding: 0.2rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.pig-range {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--card-accent);
}

.pig-label {
  font-size: 0.92rem;
}

.pig-message {
  margin: 0;
  font-size: 0.76rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.house-list {
  display: grid;
  gap: 0.85rem;
}

.house-card {
  border: 1.5px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  background: #fffaf6;
}

.house-preview {
  position: relative;
  height: 140px;
  background: linear-gradient(180deg, #fff7ea 0%, #ffe1d4 100%);
}

.house-bg {
  position: absolute;
  inset: 0;
}

.house-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.9rem;
}

.house-level {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  padding: 0.25rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #795548;
}

.house-emoji {
  align-self: flex-end;
  font-size: 2rem;
}

.house-copy {
  padding: 0.9rem 1rem 1rem;
}

.house-copy strong {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.house-copy p {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.scroll-fab-group {
  position: fixed;
  right: max(1rem, calc((100vw - 480px) / 2 + 1rem));
  bottom: 6.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  z-index: 20;
}

.scroll-fab {
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 14px;
  background: var(--primary);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
  cursor: pointer;
}

@media (max-width: 640px) {
  .guide-hero {
    flex-direction: column;
  }

  .close-btn {
    width: 100%;
  }

  .pig-grid {
    grid-template-columns: 1fr;
  }

  .scroll-fab-group {
    right: 1rem;
    bottom: 5.5rem;
  }
}
</style>
