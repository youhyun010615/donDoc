<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 1~10 단계 */
  level: { type: Number, required: true },
})

/**
 * level 기준으로 5가지 체형 결정
 * fat(9-10) / chubby(6-8) / normal(4-5) / thin(2-3) / grill(1)
 */
const state = computed(() => {
  if (props.level >= 9) return 'fat'
  if (props.level >= 6) return 'chubby'
  if (props.level >= 4) return 'normal'
  if (props.level >= 2) return 'thin'
  return 'grill'
})
</script>

<!--
  픽셀 아트 돼지 SVG
  viewBox: 200 × 270
  각 rect는 픽셀 아트 격자에 맞춰 배치됨 (shape-rendering: crispEdges)

  체형 비교:
    fat    → 몸통 192px 너비 (거의 꽉 참)
    normal → 몸통 160px 너비
    thin   → 몸통 56px 너비 + 갈비뼈 4개
    crisis → 몸통 40px 너비 + 갈비뼈 10개 + X눈
-->
<template>
  <svg
    viewBox="0 0 200 270"
    class="pig-art"
    xmlns="http://www.w3.org/2000/svg"
    style="shape-rendering: crispEdges"
  >

    <!-- ==============================
         FAT PIG — 황금 뚱뚱 돼지 (lv 8-10)
         몸통이 화면 꽉 참, 황금색, 반짝이
         ============================== -->
    <g v-if="state === 'fat'">
      <!-- 황금 후광 -->
      <ellipse cx="100" cy="195" rx="98" ry="75" fill="#FFF9C4" opacity="0.65"/>

      <!-- 왼쪽 귀 -->
      <rect x="20"  y="0"  width="40" height="48" fill="#4A2500"/>
      <rect x="24"  y="4"  width="32" height="40" fill="#FF8FAB"/>
      <!-- 오른쪽 귀 -->
      <rect x="140" y="0"  width="40" height="48" fill="#4A2500"/>
      <rect x="144" y="4"  width="32" height="40" fill="#FF8FAB"/>

      <!-- 머리 (192px 너비) -->
      <rect x="4"   y="32" width="192" height="100" fill="#4A2500"/>
      <rect x="8"   y="36" width="184" height="92"  fill="#FFD700"/>
      <!-- 볼 홍조 -->
      <rect x="12"  y="72" width="40"  height="28"  fill="#FF69B4" opacity="0.4"/>
      <rect x="148" y="72" width="40"  height="28"  fill="#FF69B4" opacity="0.4"/>

      <!-- 눈 (큰 정사각 눈 + 반짝) -->
      <rect x="44"  y="52" width="32" height="32" fill="#1A237E"/>
      <rect x="44"  y="52" width="14" height="14" fill="#FFFFFF"/>
      <rect x="124" y="52" width="32" height="32" fill="#1A237E"/>
      <rect x="124" y="52" width="14" height="14" fill="#FFFFFF"/>

      <!-- 코 -->
      <rect x="56"  y="88" width="88" height="40" fill="#4A2500"/>
      <rect x="60"  y="92" width="80" height="32" fill="#FF8FAB"/>
      <rect x="68"  y="100" width="26" height="16" fill="#C2185B"/>
      <rect x="106" y="100" width="26" height="16" fill="#C2185B"/>

      <!-- 입 (U자 미소) -->
      <rect x="60"  y="128" width="8"  height="8"  fill="#C2185B"/>
      <rect x="68"  y="132" width="64" height="8"  fill="#C2185B"/>
      <rect x="132" y="128" width="8"  height="8"  fill="#C2185B"/>

      <!-- 몸통 (꽉 참 — 192px 너비) -->
      <rect x="0"   y="136" width="200" height="112" fill="#4A2500"/>
      <rect x="4"   y="140" width="192" height="104" fill="#FFD700"/>
      <!-- 몸통 아래 그림자 -->
      <rect x="4"   y="220" width="192" height="20"  fill="#E8A000"/>

      <!-- 꼬리 (몸통 위에 겹쳐서 표현) -->
      <rect x="184" y="152" width="16" height="8"  fill="#FF8FAB"/>
      <rect x="188" y="144" width="12" height="8"  fill="#FF8FAB"/>
      <rect x="184" y="136" width="8"  height="8"  fill="#FF8FAB"/>

      <!-- 뚱뚱한 다리 4개 -->
      <rect x="16"  y="244" width="40" height="24" fill="#4A2500"/>
      <rect x="20"  y="248" width="32" height="16" fill="#FFD700"/>
      <rect x="64"  y="244" width="40" height="24" fill="#4A2500"/>
      <rect x="68"  y="248" width="32" height="16" fill="#FFD700"/>
      <rect x="96"  y="244" width="40" height="24" fill="#4A2500"/>
      <rect x="100" y="248" width="32" height="16" fill="#FFD700"/>
      <rect x="144" y="244" width="40" height="24" fill="#4A2500"/>
      <rect x="148" y="248" width="32" height="16" fill="#FFD700"/>

      <!-- 반짝 픽셀 -->
      <rect x="0" y="12" width="8" height="8" fill="#FFF59D"/>
      <rect x="4" y="20" width="8" height="8" fill="#FFE082"/>
      <rect x="164" y="12" width="8" height="8" fill="#FFF59D"/>
      <rect x="168" y="20" width="8" height="8" fill="#FFE082"/>
      <rect x="0" y="172" width="8" height="8" fill="#FFF59D"/>
      <rect x="4" y="180" width="8" height="8" fill="#FFE082"/>
    </g>


    <!-- ==============================
         NORMAL PIG — 분홍 건강 돼지 (lv 5-7)
         몸통 160px 너비, 핑크, 보통 표정
         ============================== -->
    <g v-else-if="state === 'normal'">
      <!-- 왼쪽 귀 -->
      <rect x="36"  y="4"  width="28" height="40" fill="#4A2500"/>
      <rect x="40"  y="8"  width="20" height="32" fill="#FF8FAB"/>
      <!-- 오른쪽 귀 -->
      <rect x="136" y="4"  width="28" height="40" fill="#4A2500"/>
      <rect x="140" y="8"  width="20" height="32" fill="#FF8FAB"/>

      <!-- 머리 (160px 너비) -->
      <rect x="20"  y="36" width="160" height="92" fill="#4A2500"/>
      <rect x="24"  y="40" width="152" height="84" fill="#FFB6C1"/>
      <!-- 볼 홍조 -->
      <rect x="28"  y="76" width="28" height="20" fill="#FF80AB" opacity="0.4"/>
      <rect x="144" y="76" width="28" height="20" fill="#FF80AB" opacity="0.4"/>

      <!-- 눈 (중간 크기) -->
      <rect x="52"  y="56" width="24" height="24" fill="#1A237E"/>
      <rect x="52"  y="56" width="10" height="10" fill="#FFFFFF"/>
      <rect x="124" y="56" width="24" height="24" fill="#1A237E"/>
      <rect x="124" y="56" width="10" height="10" fill="#FFFFFF"/>

      <!-- 코 -->
      <rect x="64"  y="88" width="72" height="36" fill="#4A2500"/>
      <rect x="68"  y="92" width="64" height="28" fill="#FF8FAB"/>
      <rect x="76"  y="100" width="20" height="14" fill="#C2185B"/>
      <rect x="104" y="100" width="20" height="14" fill="#C2185B"/>

      <!-- 입 (평범한 일자) -->
      <rect x="72"  y="124" width="56" height="6"  fill="#C2185B"/>

      <!-- 몸통 (160px 너비) -->
      <rect x="16"  y="132" width="168" height="112" fill="#4A2500"/>
      <rect x="20"  y="136" width="160" height="104" fill="#FFB6C1"/>
      <!-- 몸통 아래 그림자 -->
      <rect x="20"  y="216" width="160" height="20"  fill="#F48FB1"/>

      <!-- 꼬리 -->
      <rect x="180" y="152" width="12" height="8"  fill="#FF8FAB"/>
      <rect x="184" y="144" width="8"  height="8"  fill="#FF8FAB"/>
      <rect x="180" y="136" width="8"  height="8"  fill="#FF8FAB"/>

      <!-- 다리 4개 (중간 크기) -->
      <rect x="28"  y="244" width="30" height="22" fill="#4A2500"/>
      <rect x="32"  y="248" width="22" height="14" fill="#FFB6C1"/>
      <rect x="72"  y="244" width="30" height="22" fill="#4A2500"/>
      <rect x="76"  y="248" width="22" height="14" fill="#FFB6C1"/>
      <rect x="100" y="244" width="30" height="22" fill="#4A2500"/>
      <rect x="104" y="248" width="22" height="14" fill="#FFB6C1"/>
      <rect x="144" y="244" width="30" height="22" fill="#4A2500"/>
      <rect x="148" y="248" width="22" height="14" fill="#FFB6C1"/>
    </g>


    <!-- ==============================
         THIN PIG — 홀쭉 창백 돼지 (lv 3-4)
         몸통 56px 너비 (화면 중앙 좁은 띠)
         갈비뼈 4개 표시, 슬픈 표정
         ============================== -->
    <g v-else-if="state === 'thin'">
      <!-- 배경에 옅은 원래 실루엣 (얼마나 줄었는지 비교) -->
      <rect x="20" y="36" width="160" height="212" fill="#FFCDD2" opacity="0.15"/>

      <!-- 왼쪽 귀 (작아짐) -->
      <rect x="72"  y="8"  width="20" height="28" fill="#4A2500"/>
      <rect x="76"  y="12" width="12" height="20" fill="#EF9A9A"/>
      <!-- 오른쪽 귀 -->
      <rect x="108" y="8"  width="20" height="28" fill="#4A2500"/>
      <rect x="112" y="12" width="12" height="20" fill="#EF9A9A"/>

      <!-- 머리 (88px 너비) -->
      <rect x="56"  y="32" width="88" height="80" fill="#4A2500"/>
      <rect x="60"  y="36" width="80" height="72" fill="#FFCDD2"/>

      <!-- 슬픈 눈썹 (안쪽이 올라가 있음 = 슬픔) -->
      <rect x="68" y="44" width="8"  height="4" fill="#4A2500"/>
      <rect x="76" y="48" width="12" height="4" fill="#4A2500"/>
      <rect x="120" y="44" width="8"  height="4" fill="#4A2500"/>
      <rect x="112" y="48" width="8"  height="4" fill="#4A2500"/>

      <!-- 슬픈 눈 (더 작고 어두움) -->
      <rect x="68"  y="52" width="20" height="16" fill="#455A64"/>
      <rect x="112" y="52" width="20" height="16" fill="#455A64"/>
      <!-- 눈 테두리 -->
      <rect x="66"  y="50" width="24" height="20" fill="none" stroke="#4A2500" stroke-width="2"/>
      <rect x="110" y="50" width="24" height="20" fill="none" stroke="#4A2500" stroke-width="2"/>

      <!-- 코 (작아짐) -->
      <rect x="76"  y="80" width="48" height="32" fill="#4A2500"/>
      <rect x="80"  y="84" width="40" height="24" fill="#EF9A9A"/>
      <rect x="84"  y="90" width="14" height="12" fill="#C2185B"/>
      <rect x="102" y="90" width="14" height="12" fill="#C2185B"/>

      <!-- 입 (역U자 찡그림) -->
      <rect x="80"  y="112" width="8"  height="8" fill="#C2185B"/>
      <rect x="88"  y="108" width="24" height="8" fill="#C2185B"/>
      <rect x="112" y="112" width="8"  height="8" fill="#C2185B"/>

      <!-- 몸통 (56px 너비 — 좁은 막대) -->
      <rect x="72"  y="120" width="56" height="132" fill="#4A2500"/>
      <rect x="76"  y="124" width="48" height="124" fill="#FFCDD2"/>

      <!-- 갈비뼈 4개 (뚜렷하게 보임) -->
      <rect x="80" y="148" width="40" height="6" fill="#EF9A9A" opacity="0.75"/>
      <rect x="80" y="168" width="40" height="6" fill="#EF9A9A" opacity="0.75"/>
      <rect x="80" y="188" width="40" height="6" fill="#EF9A9A" opacity="0.75"/>
      <rect x="80" y="208" width="40" height="6" fill="#EF9A9A" opacity="0.75"/>

      <!-- 다리 2개 (가는 다리) -->
      <rect x="80"  y="252" width="20" height="16" fill="#4A2500"/>
      <rect x="84"  y="256" width="12" height="8"  fill="#FFCDD2"/>
      <rect x="100" y="252" width="20" height="16" fill="#4A2500"/>
      <rect x="104" y="256" width="12" height="8"  fill="#FFCDD2"/>

      <!-- 땀 픽셀 아이콘 -->
      <rect x="28" y="60" width="8" height="8" fill="#90CAF9"/>
      <rect x="32" y="68" width="8" height="8" fill="#64B5F6"/>
      <rect x="148" y="86" width="8" height="8" fill="#90CAF9"/>
      <rect x="152" y="94" width="8" height="8" fill="#64B5F6"/>
    </g>


    <!-- ==============================
         CRISIS PIG — 위기 해골 돼지 (lv 1-2)
         몸통 40px (매우 좁음), X눈, 갈비뼈 10개
         ============================== -->
    <g v-else>
      <!-- 배경 실루엣 (흐릿하게 원래 크기 표시) -->
      <rect x="4" y="36" width="192" height="212" fill="#CFD8DC" opacity="0.1"/>

      <!-- 귀 (아주 작음) -->
      <rect x="80"  y="8"  width="16" height="20" fill="#37474F"/>
      <rect x="84"  y="12" width="8"  height="12" fill="#90A4AE"/>
      <rect x="104" y="8"  width="16" height="20" fill="#37474F"/>
      <rect x="108" y="12" width="8"  height="12" fill="#90A4AE"/>

      <!-- 머리 (80px 너비) -->
      <rect x="60"  y="24" width="80" height="76" fill="#37474F"/>
      <rect x="64"  y="28" width="72" height="68" fill="#CFD8DC"/>

      <!-- X 눈 (픽셀 X 패턴, 각 픽셀=8px) -->
      <!-- 왼쪽 X눈 -->
      <rect x="70" y="48" width="8" height="8" fill="#37474F"/>
      <rect x="86" y="48" width="8" height="8" fill="#37474F"/>
      <rect x="78" y="56" width="8" height="8" fill="#37474F"/>
      <rect x="70" y="64" width="8" height="8" fill="#37474F"/>
      <rect x="86" y="64" width="8" height="8" fill="#37474F"/>
      <!-- 오른쪽 X눈 -->
      <rect x="106" y="48" width="8" height="8" fill="#37474F"/>
      <rect x="122" y="48" width="8" height="8" fill="#37474F"/>
      <rect x="114" y="56" width="8" height="8" fill="#37474F"/>
      <rect x="106" y="64" width="8" height="8" fill="#37474F"/>
      <rect x="122" y="64" width="8" height="8" fill="#37474F"/>

      <!-- 코 (아주 작음) -->
      <rect x="80"  y="76" width="40" height="24" fill="#37474F"/>
      <rect x="84"  y="80" width="32" height="16" fill="#90A4AE"/>
      <rect x="88"  y="84" width="10" height="8"  fill="#546E7A"/>
      <rect x="102" y="84" width="10" height="8"  fill="#546E7A"/>

      <!-- 심한 찡그림 -->
      <rect x="84"  y="100" width="8"  height="8" fill="#37474F"/>
      <rect x="92"  y="104" width="16" height="8" fill="#37474F"/>
      <rect x="108" y="100" width="8"  height="8" fill="#37474F"/>

      <!-- 몸통 (40px 너비 — 해골처럼 좁음) -->
      <rect x="80"  y="108" width="40" height="148" fill="#37474F"/>
      <rect x="84"  y="112" width="32" height="140" fill="#CFD8DC"/>

      <!-- 갈비뼈 10개 -->
      <rect x="86" y="120" width="28" height="5" fill="#90A4AE"/>
      <rect x="86" y="132" width="28" height="5" fill="#90A4AE"/>
      <rect x="86" y="144" width="28" height="5" fill="#90A4AE"/>
      <rect x="86" y="156" width="28" height="5" fill="#90A4AE"/>
      <rect x="86" y="168" width="28" height="5" fill="#90A4AE"/>
      <rect x="86" y="180" width="28" height="5" fill="#90A4AE"/>
      <rect x="86" y="192" width="28" height="5" fill="#90A4AE"/>
      <rect x="86" y="204" width="28" height="5" fill="#90A4AE"/>
      <rect x="86" y="216" width="28" height="5" fill="#90A4AE"/>
      <rect x="86" y="228" width="28" height="5" fill="#90A4AE"/>

      <!-- 막대 다리 -->
      <rect x="88"  y="256" width="12" height="12" fill="#37474F"/>
      <rect x="100" y="256" width="12" height="12" fill="#37474F"/>

      <!-- 혼절/위기 픽셀 아이콘 -->
      <rect x="24" y="44" width="8" height="8" fill="#FFE082"/>
      <rect x="32" y="52" width="8" height="8" fill="#FFD54F"/>
      <rect x="148" y="44" width="12" height="12" fill="#B0BEC5"/>
      <rect x="152" y="48" width="4" height="4" fill="#37474F"/>
      <rect x="32" y="168" width="8" height="8" fill="#90CAF9"/>
      <rect x="36" y="176" width="8" height="8" fill="#64B5F6"/>
      <rect x="148" y="168" width="8" height="8" fill="#90CAF9"/>
      <rect x="152" y="176" width="8" height="8" fill="#64B5F6"/>
    </g>

  </svg>
</template>

<style scoped>
.pig-art {
  
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
