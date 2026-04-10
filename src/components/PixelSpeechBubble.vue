<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  /** 표시할 전체 텍스트 */
  text: { type: String, required: true },
  /** 말풍선 꼬리 방향: 'left' | 'right' */
  tail: { type: String, default: 'left' },
  /** 한 글자 타이핑 간격 (ms) */
  speed: { type: Number, default: 45 },
})

const emit = defineEmits(['close'])

const displayed = ref('')
let timer = null

function startTyping() {
  displayed.value = ''
  let i = 0
  clearInterval(timer)
  timer = setInterval(() => {
    if (i < props.text.length) {
      displayed.value += props.text[i]
      i++
    } else {
      clearInterval(timer)
    }
  }, props.speed)
}

watch(() => props.text, startTyping, { immediate: true })

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="bubble-wrap" :class="'tail-' + tail">
    <div class="bubble">
      <button class="close-btn" type="button" @click="emit('close')">✕</button>
      <p class="bubble-text">{{ displayed }}<span class="cursor">█</span></p>
    </div>
    <div class="tail-pixel" />
  </div>
</template>

<style scoped>
.bubble-wrap {
  position: absolute;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: auto;
}

/* 말풍선 본체 */
.bubble {
  position: relative;
  background: rgba(26, 26, 46, 0.82);
  color: #e8f4e8;
  font-family: 'DungGeunMo', 'Galmuri11', 'Courier New', monospace;
  font-size: 0.65rem;
  line-height: 1.5;
  padding: 8px 10px 6px;
  min-width: 110px;
  max-width: 155px;

  /* 픽셀 테두리 — box-shadow로 계단 표현 */
  box-shadow:
    /* 상단 */
    4px 0px 0 0 #e8f4e8,
    -4px 0px 0 0 #e8f4e8,
    0px -4px 0 0 #e8f4e8,
    0px 4px 0 0 #e8f4e8,
    /* 모서리 컷 */
    4px -4px 0 0 #e8f4e8,
    -4px -4px 0 0 #e8f4e8,
    4px 4px 0 0 #e8f4e8,
    -4px 4px 0 0 #e8f4e8,
    /* 외곽 그림자 */
    8px 0px 0 0 #000,
    -8px 0px 0 0 #000,
    0px -8px 0 0 #000,
    0px 8px 0 0 #000,
    8px -8px 0 0 #000,
    -8px -8px 0 0 #000,
    8px 8px 0 0 #000,
    -8px 8px 0 0 #000;
}

/* 닫기 버튼 */
.close-btn {
  position: absolute;
  top: 4px;
  right: 6px;
  background: none;
  border: none;
  color: #90caf9;
  font-size: 0.65rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.bubble-text {
  margin: 0;
  padding-right: 12px;
  white-space: pre-wrap;
  word-break: keep-all;
}

/* 커서 깜빡임 */
.cursor {
  display: inline-block;
  color: #90caf9;
  animation: blink 0.8s step-end infinite;
  font-size: 0.6rem;
  vertical-align: middle;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* 꼬리 픽셀 (왼쪽 방향) */
.tail-pixel {
  width: 8px;
  height: 16px;
  background: #e8f4e8;
  margin-left: 20px;
  box-shadow: 0 2px 0 0 #000, 0 -2px 0 0 #000, -2px 0 0 0 #000;
  position: relative;
}

.tail-pixel::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 2px;
  width: 4px;
  height: 8px;
  background: #1a1a2e;
}

/* 꼬리 오른쪽 */
.tail-right .tail-pixel {
  margin-left: auto;
  margin-right: 20px;
}
</style>
