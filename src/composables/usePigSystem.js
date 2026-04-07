import { computed } from 'vue'

// 돼지 상태 10단계 정의
const PIG_LEVELS = [
  {
    level: 10,
    maxRatio: 70,
    emoji: '🐷',
    face: '😄',
    label: '완벽한 재정 관리',
    color: '#FFD700',
    bgColor: '#FFFDE7',
    borderColor: '#FFD700',
    message: '완벽해요! 황금 돼지가 되었어요! 오늘도 훌륭한 절약이에요 ✨',
  },
  {
    level: 9,
    maxRatio: 80,
    emoji: '🐷',
    face: '😊',
    label: '우수한 상태',
    color: '#66BB6A',
    bgColor: '#E8F5E9',
    borderColor: '#66BB6A',
    message: '아주 잘하고 있어요! 돼지가 건강하게 빛나고 있어요 😊',
  },
  {
    level: 8,
    maxRatio: 90,
    emoji: '🐷',
    face: '🙂',
    label: '좋은 상태',
    color: '#26A69A',
    bgColor: '#E0F2F1',
    borderColor: '#26A69A',
    message: '좋아요! 목표에 거의 다 왔어요 🙂',
  },
  {
    level: 7,
    maxRatio: 100,
    emoji: '🐷',
    face: '😐',
    label: '평범한 상태',
    color: '#78909C',
    bgColor: '#ECEFF1',
    borderColor: '#78909C',
    message: '평범한 상태예요. 조금만 더 아끼면 좋겠어요 😐',
  },
  {
    level: 6,
    maxRatio: 120,
    emoji: '🐷',
    face: '😕',
    label: '주의 필요',
    color: '#FFA726',
    bgColor: '#FFF3E0',
    borderColor: '#FFA726',
    message: '주의가 필요해요! 지출이 목표를 넘었어요 😕',
  },
  {
    level: 5,
    maxRatio: 150,
    emoji: '🐷',
    face: '😟',
    label: '경고',
    color: '#FF7043',
    bgColor: '#FBE9E7',
    borderColor: '#FF7043',
    message: '경고! 지출이 많이 늘었어요. 돼지가 힘들어해요 😟',
  },
  {
    level: 4,
    maxRatio: 180,
    emoji: '🐷',
    face: '😰',
    label: '위험',
    color: '#EF5350',
    bgColor: '#FFEBEE',
    borderColor: '#EF5350',
    message: '위험해요! 오늘 지출을 줄여야 해요 😰',
  },
  {
    level: 3,
    maxRatio: 200,
    emoji: '🐷',
    face: '🤒',
    label: '심각',
    color: '#E53935',
    bgColor: '#FFCDD2',
    borderColor: '#E53935',
    message: '심각해요! 돼지가 아파요. 지금 당장 지출을 멈춰요 🤒',
  },
  {
    level: 2,
    maxRatio: 250,
    emoji: '🐷',
    face: '🤢',
    label: '매우 위험',
    color: '#B71C1C',
    bgColor: '#FFCDD2',
    borderColor: '#B71C1C',
    message: '매우 위험! 돼지가 쓰러지기 직전이에요 🤢',
  },
  {
    level: 1,
    maxRatio: Infinity,
    emoji: '🐷',
    face: '💀',
    label: '위기 상황',
    color: '#212121',
    bgColor: '#F5F5F5',
    borderColor: '#212121',
    message: '위기 상황! 돼지가 위험에 처했어요. 소비를 즉시 중단해요 💀',
  },
]

// 집 업그레이드 단계
const HOUSE_LEVELS = [
  { level: 1, name: '흙바닥', emoji: '🪨', description: '아직 집이 없어요...' },
  { level: 2, name: '오두막', emoji: '🛖', description: '작은 오두막이 생겼어요!' },
  { level: 3, name: '집', emoji: '🏠', description: '편안한 집이 생겼어요!' },
  { level: 4, name: '빌라', emoji: '🏢', description: '멋진 빌라로 이사했어요!' },
  {
    level: 5,
    name: '대저택',
    emoji: '🏰',
    description: '꿈의 대저택에 살고 있어요!',
  },
]

export function usePigSystem() {
  /**
   * 지출 비율로 돼지 레벨 계산
   * @param {number} todayExpense - 오늘 지출액
   * @param {number} dailyBudget - 일일 권장 지출액
   * @returns {object} 돼지 상태 정보
   */
  function getPigState(todayExpense, dailyBudget) {
    if (dailyBudget <= 0) {
      return PIG_LEVELS[6] // 기본: 위험 단계
    }

    const ratio = (todayExpense / dailyBudget) * 100

    const state = PIG_LEVELS.find((p) => ratio <= p.maxRatio) || PIG_LEVELS[9]
    return { ...state, ratio: Math.round(ratio) }
  }

  /**
   * 레벨 번호로 돼지 상태 직접 가져오기
   */
  function getPigStateByLevel(level) {
    return PIG_LEVELS.find((p) => p.level === level) || PIG_LEVELS[6]
  }

  /**
   * 집 레벨 정보 가져오기
   */
  function getHouseInfo(level) {
    return HOUSE_LEVELS.find((h) => h.level === level) || HOUSE_LEVELS[0]
  }

  /**
   * 월간 평균 비율로 다음 달 집 레벨 계산
   * @param {number} avgRatio - 월 평균 지출 비율
   * @param {number} currentHouseLevel - 현재 집 레벨
   */
  function calcNextHouseLevel(avgRatio, currentHouseLevel) {
    if (avgRatio <= 100 && currentHouseLevel < 5) {
      return currentHouseLevel + 1
    }
    if (avgRatio > 150 && currentHouseLevel > 1) {
      return currentHouseLevel - 1
    }
    return currentHouseLevel
  }

  /**
   * 숫자를 원화 형식으로 포맷
   */
  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  /**
   * 날짜 포맷 (YYYY-MM-DD → MM월 DD일)
   */
  function formatDate(dateStr) {
    const [, month, day] = dateStr.split('-')
    return `${parseInt(month)}월 ${parseInt(day)}일`
  }

  return {
    PIG_LEVELS,
    HOUSE_LEVELS,
    getPigState,
    getPigStateByLevel,
    getHouseInfo,
    calcNextHouseLevel,
    formatCurrency,
    formatDate,
  }
}
