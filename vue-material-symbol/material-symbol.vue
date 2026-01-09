<template>
    <svg :viewBox="viewBox" v-bind="attrs" v-html="content" />
</template>

<script lang="ts" setup>
import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import type { Filled, IconKey, OpticalSize, Theme, Weight } from '@hyrioo/vite-plugin-material-symbols-svg/consumer';
import { getSymbol } from '@hyrioo/vite-plugin-material-symbols-svg/consumer';
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
    size?: number | {width: number, height: number}; // rendered size; used to decide the optical size bucket
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

const attrs = computed(() => {
    if (typeof props.size === 'object') {
        return {
            width: props.size.width,
            height: props.size.height,
        };
    }

    return {
        width: props.size,
        height: props.size,
    };
});

const biggestSize = computed(() => {
    if (typeof props.size === 'object') {
        return Math.max(props.size.height, props.size.width);
    }

    return props.size;
});

const resolvedFills = computed(() => {
    if (typeof props.fills === 'string' && materialSymbolDefaultProps.colorSchemes?.[props.fills]) {
        return materialSymbolDefaultProps.colorSchemes[props.fills];
    }
    return props.fills;
});

const resolvedStrokes = computed(() => {
    if (typeof props.strokes === 'string' && materialSymbolDefaultProps.colorSchemes?.[props.strokes]) {
        return materialSymbolDefaultProps.colorSchemes[props.strokes];
    }
    return props.strokes;
});

function applyColors(content: string, fills: ColorProp | readonly SvgColor[], strokes: ColorProp | readonly SvgColor[]): string {
    if (!content || typeof DOMParser === 'undefined') return content;

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${content}</svg>`, 'image/svg+xml');
    const svg = doc.documentElement;
    const children = Array.from(svg.children);

    const applyColor = (el: Element, attr: string, value: any) => {
        if (value === 'keep' || value === null || value === undefined) return;
        el.setAttribute(attr, (value === 'text') ? 'currentColor' : value);
    };

    children.forEach((child, index) => {
        // Apply fills
        if (Array.isArray(fills)) {
            applyColor(child, 'fill', fills[index]);
        } else if (typeof fills === 'object' && fills !== null) {
            const id = child.getAttribute('id');
            if (id && (fills as any)[id] !== undefined) {
                applyColor(child, 'fill', (fills as any)[id]);
            }
        } else if (fills !== undefined) {
            applyColor(child, 'fill', fills);
        }

        // Apply strokes
        if (Array.isArray(strokes)) {
            applyColor(child, 'stroke', strokes[index]);
        } else if (typeof strokes === 'object' && strokes !== null) {
            const id = child.getAttribute('id');
            if (id && (strokes as any)[id] !== undefined) {
                applyColor(child, 'stroke', (strokes as any)[id]);
            }
        } else if (strokes !== undefined) {
            applyColor(child, 'stroke', strokes);
        }
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
        const sizes = Object.keys(available).map(Number).sort((a, b) => a - b);

        let bestSize = targetSize;
        if (!(available as any)[targetSize] && sizes.length > 0) {
            bestSize = sizes.reduce((prev, curr) => {
                return Math.abs(curr - targetSize) < Math.abs(prev - targetSize) ? curr : prev;
            });
        }

        const svg = (available as any)[bestSize];
        if (svg) {
            content.value = applyColors(svg.content, resolvedFills.value, resolvedStrokes.value);
            viewBox.value = svg.viewBox;
            return;
        }
    }

    content.value = '';

    if (materialSymbolDefaultProps.debug) {
        // eslint-disable-next-line no-console
        console.warn(`[material-symbol] Icon not found: ${String(props.icon)} (size ${props.size})`);
    }
}

watch(
    () => [props.icon, props.theme, props.filled, props.weight, props.size, props.fills, props.strokes],
    () => updateIcon(),
    { deep: true },
);

updateIcon();
</script>
