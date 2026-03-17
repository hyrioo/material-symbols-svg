<template>
  <svg :viewBox="viewBox" v-bind="attrs" v-html="content" />
</template>

<script lang="ts" setup>
import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import type { Filled, OpticalSize, Theme, Weight } from './shared/types';
import type { IconKey } from './shared/icon-types';
import { getSymbol } from './consumer/loader';
import { shouldEmitDiagnostics, symbolConfig } from './shared/config';
import { materialSymbolDefaultProps } from './index';
import type { SvgColor, ColorProp } from './index';

export type { SvgColor, ColorProp };

export interface MaterialSymbolProps {
  icon: IconKey;
  weight?: Weight;
  theme?: Theme;
  filled?: Filled;
  fills?: ColorProp;
  strokes?: ColorProp;
  size?: number | { width: number; height: number };
  opticalSize?: OpticalSize | null;
}

const props = withDefaults(defineProps<MaterialSymbolProps>(), {
  weight: () => materialSymbolDefaultProps.weight,
  theme: () => materialSymbolDefaultProps.theme,
  filled: () => materialSymbolDefaultProps.filled,
  fills: () => materialSymbolDefaultProps.fills as any,
  strokes: () => materialSymbolDefaultProps.strokes as any,
  size: 24,
  opticalSize: null,
});

const content: Ref<string> = ref('');
const viewBox: Ref<string> = ref('0 0 24 24');

const resolvedSize = computed(() => {
  if (typeof props.size === 'object') return props.size;
  return { width: props.size, height: props.size };
});

const attrs = computed(() => ({ width: resolvedSize.value.width, height: resolvedSize.value.height }));
const biggestSize = computed(() => Math.max(resolvedSize.value.height, resolvedSize.value.width));

function resolveColorProp(value: ColorProp): ColorProp {
  if (typeof value === 'string' && materialSymbolDefaultProps.colorSchemes?.[value]) {
    return materialSymbolDefaultProps.colorSchemes[value];
  }

  return value;
}

const resolvedFills = computed<ColorProp>(() => resolveColorProp(props.fills));
const resolvedStrokes = computed<ColorProp>(() => resolveColorProp(props.strokes));

function isColorMap(input: ColorProp): input is Readonly<Record<string, SvgColor>> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function isSingleColor(input: ColorProp): input is SvgColor {
  return typeof input === 'string' || input === null;
}

function applyColors(content: string, fills: ColorProp, strokes: ColorProp): string {
  if (!content || typeof DOMParser === 'undefined') return content;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${content}</svg>`, 'image/svg+xml');
  const svg = doc.documentElement;
  const children = Array.from(svg.children);

  const applyColor = (el: Element, attr: string, value: SvgColor | undefined) => {
    if (value === 'keep' || value === null || value === undefined) return;
    el.setAttribute(attr, value === 'text' ? 'currentColor' : value);
  };

  const applyColorInput = (el: Element, index: number, attr: string, input: ColorProp) => {
    if (Array.isArray(input)) {
      applyColor(el, attr, input[index]);
      return;
    }

    if (isColorMap(input)) {
      const id = el.getAttribute('id');
      if (id && input[id] !== undefined) {
        applyColor(el, attr, input[id]);
      }
      return;
    }

    if (isSingleColor(input)) {
      applyColor(el, attr, input);
    }
  };

  children.forEach((child, index) => {
    applyColorInput(child, index, 'fill', fills);
    applyColorInput(child, index, 'stroke', strokes);
  });

  return svg.innerHTML;
}

function updateIcon() {
  const available = getSymbol({
    icon: String(props.icon),
    theme: props.theme,
    filled: props.filled ? 1 : 0,
    weight: Number(props.weight),
  });

  if (available) {
    const targetSize = props.opticalSize || biggestSize.value;
    const sizes = Object.keys(available)
      .map(Number)
      .sort((a, b) => a - b);

    let bestSize = targetSize;
    if (!available[targetSize] && sizes.length > 0) {
      bestSize = sizes.reduce((prev, curr) => {
        return Math.abs(curr - targetSize) < Math.abs(prev - targetSize) ? curr : prev;
      });
    }

    const svg = available[bestSize];
    if (svg) {
      content.value = applyColors(svg.content, resolvedFills.value, resolvedStrokes.value);
      viewBox.value = svg.viewBox;
      return;
    }
  }

  content.value = '';

  if (shouldEmitDiagnostics(symbolConfig.diagnostics)) {
    console.warn(
      `[vue-material-symbol] Icon "${String(props.icon)}" could not be rendered. Fix: verify defineIcons() includes this icon and requested variant.`,
    );
  }
}

watch(() => [props.icon, props.theme, props.filled, props.weight, props.size, props.fills, props.strokes], () => updateIcon(), {
  deep: true,
});

updateIcon();
</script>
