import { defineComponent as M, ref as w, computed as y, watch as _, createElementBlock as x, openBlock as A, mergeProps as B, readonly as P } from "vue";
import { isProduction as j } from "@hyrioo/vite-plugin-material-symbols-svg";
import { getSymbol as C } from "@hyrioo/vite-plugin-material-symbols-svg/consumer";
const D = ["viewBox", "innerHTML"], L = /* @__PURE__ */ M({
  __name: "material-symbol",
  props: {
    icon: {},
    weight: { default: () => d.weight },
    theme: { default: () => d.theme },
    filled: { type: Boolean, default: () => d.filled },
    fills: { default: "current" },
    strokes: { default: null },
    size: { default: 24 },
    opticalSize: { default: null }
  },
  setup(g) {
    const e = g, m = w(""), h = w("0 0 24 24"), v = y(() => typeof e.size == "object" ? {
      width: e.size.width,
      height: e.size.height
    } : {
      width: e.size,
      height: e.size
    }), z = y(() => typeof e.size == "object" ? Math.max(e.size.height, e.size.width) : e.size);
    function S(n, t, r) {
      if (!n || typeof DOMParser > "u") return n;
      const l = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${n}</svg>`, "image/svg+xml").documentElement, s = Array.from(l.children), a = (o, c, i) => {
        i === "keep" || i === null || i === void 0 || o.setAttribute(c, i === "current" ? "currentColor" : i);
      };
      return s.forEach((o, c) => {
        if (Array.isArray(t))
          a(o, "fill", t[c]);
        else if (typeof t == "object" && t !== null) {
          const i = o.getAttribute("id");
          i && t[i] !== void 0 && a(o, "fill", t[i]);
        } else t !== void 0 && a(o, "fill", t);
        if (Array.isArray(r))
          a(o, "stroke", r[c]);
        else if (typeof r == "object" && r !== null) {
          const i = o.getAttribute("id");
          i && r[i] !== void 0 && a(o, "stroke", r[i]);
        } else r !== void 0 && a(o, "stroke", r);
      }), l.innerHTML;
    }
    function b() {
      const n = C({
        icon: String(e.icon),
        theme: e.theme,
        filled: e.filled ? 1 : 0,
        weight: Number(e.weight)
      });
      if (n) {
        const t = e.opticalSize || z.value, r = Object.keys(n).map(Number).sort((l, s) => l - s);
        let p = t;
        !n[t] && r.length > 0 && (p = r.reduce((l, s) => Math.abs(s - t) < Math.abs(l - t) ? s : l));
        const f = n[p];
        if (f) {
          m.value = S(f.content, e.fills, e.strokes), h.value = f.viewBox;
          return;
        }
      }
      m.value = "", d.debug && console.warn(`[material-symbol] Icon not found: ${String(e.icon)} (size ${e.size})`);
    }
    return _(
      () => [e.icon, e.theme, e.filled, e.weight, e.size, e.fills, e.strokes],
      () => b(),
      { deep: !0 }
    ), b(), (n, t) => (A(), x("svg", B({ viewBox: h.value }, v.value, { innerHTML: m.value }), null, 16, D));
  }
});
let u = {
  weight: 400,
  theme: "rounded",
  filled: !1,
  debug: j
};
function O(g) {
  u = {
    ...u,
    ...g
  };
}
const d = P({
  get weight() {
    return u.weight;
  },
  get theme() {
    return u.theme;
  },
  get filled() {
    return u.filled;
  },
  get debug() {
    return u.debug;
  }
});
export {
  L as MaterialSymbol,
  O as configureMaterialSymbolDefaultProps,
  d as materialSymbolDefaultProps
};
//# sourceMappingURL=index.js.map
