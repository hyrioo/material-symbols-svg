<template>
  <svg :viewBox="viewBox" v-bind="attrs">
    <path class="fill-current" :d="path" />
  </svg>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { getSymbol } from '../vite-plugin-material-symbols-svg/registry';

type Theme = 'rounded' | 'outlined' | 'sharp';

interface CIconProps {
  icon: string;
  weight?: number;
  theme?: Theme;
  fill?: 0 | 1;
  width?: number;
  height?: number;
  size?: number; // rendered size; used to decide optical size bucket
}

const props = withDefaults(defineProps<CIconProps>(), {
  width: undefined,
  height: undefined,
  size: 24,
  theme: 'rounded',
  fill: 0,
  weight: 200,
});

const path: Ref<string> = ref('');
const viewBox: Ref<string> = ref('0 0 24 24');

const attrs = computed(() => ({
  width: props.width ?? props.size,
  height: props.height ?? props.size,
}));

function opticalSizeFor(rendered: number): 20 | 24 | 40 | 48 {
  return rendered < 22 ? 20 : rendered < 32 ? 24 : rendered < 44 ? 40 : 48;
}

function updateIcon() {
  const rendered = props.size ?? 24;
  const size = opticalSizeFor(rendered);
  const svg = getSymbol({
    icon: String(props.icon),
    theme: props.theme ?? 'rounded',
    fill: (props.fill ?? 0) as 0 | 1,
    weight: Number(props.weight ?? 200),
    size: Number(size),
  });
  if (svg) {
    path.value = svg.d;
    viewBox.value = svg.viewBox;
  } else if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[CIcon] Icon not found: ${String(props.icon)} (size ${size})`);
  }
}

watch(
  () => [props.icon, props.theme, props.fill, props.weight, props.size],
  () => updateIcon(),
);

updateIcon();
</script>
