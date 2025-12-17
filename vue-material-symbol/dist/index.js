import { defineComponent as h, ref as s, computed as d, watch as f, createElementBlock as m, openBlock as p, mergeProps as v, createElementVNode as g } from "vue";
import { getSymbol as w } from "@hyrioo/vite-plugin-material-symbols-svg";
const _ = ["viewBox"], z = ["d"], b = /* @__PURE__ */ h({
  __name: "c-icon",
  props: {
    icon: {},
    weight: { default: 200 },
    theme: { default: "rounded" },
    fill: { default: 0 },
    width: { default: void 0 },
    height: { default: void 0 },
    size: { default: 24 }
  },
  setup(r) {
    const e = r, i = s(""), n = s("0 0 24 24"), u = d(() => ({
      width: e.width ?? e.size,
      height: e.height ?? e.size
    }));
    function a(t) {
      return t < 22 ? 20 : t < 32 ? 24 : t < 44 ? 40 : 48;
    }
    function c() {
      const t = e.size ?? 24, l = a(t), o = w({
        icon: String(e.icon),
        theme: e.theme ?? "rounded",
        fill: e.fill ?? 0,
        weight: Number(e.weight ?? 200),
        size: Number(l)
      });
      o && (i.value = o.d, n.value = o.viewBox);
    }
    return f(
      () => [e.icon, e.theme, e.fill, e.weight, e.size],
      () => c()
    ), c(), (t, l) => (p(), m("svg", v({ viewBox: n.value }, u.value), [
      g("path", {
        class: "fill-current",
        d: i.value
      }, null, 8, z)
    ], 16, _));
  }
});
export {
  b as CIcon
};
//# sourceMappingURL=index.js.map
