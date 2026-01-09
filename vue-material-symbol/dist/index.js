import { defineComponent as M, ref as w, computed as g, watch as _, createElementBlock as A, openBlock as B, mergeProps as P, readonly as j } from "vue";
import { isProduction as C } from "@hyrioo/vite-plugin-material-symbols-svg";
import { getSymbol as D } from "@hyrioo/vite-plugin-material-symbols-svg/consumer";
const E = ["viewBox", "innerHTML"], T = /* @__PURE__ */ M({
  __name: "material-symbol",
  props: {
    icon: {},
    weight: { default: () => l.weight },
    theme: { default: () => l.theme },
    filled: { type: Boolean, default: () => l.filled },
    fills: { default: () => l.fills },
    strokes: { default: () => l.strokes },
    size: { default: 24 },
    opticalSize: { default: null }
  },
  setup(d) {
    const e = d, h = w(""), b = w("0 0 24 24"), y = g(() => typeof e.size == "object" ? {
      width: e.size.width,
      height: e.size.height
    } : {
      width: e.size,
      height: e.size
    }), S = g(() => typeof e.size == "object" ? Math.max(e.size.height, e.size.width) : e.size), z = g(() => {
      var t;
      return typeof e.fills == "string" && ((t = l.colorSchemes) != null && t[e.fills]) ? l.colorSchemes[e.fills] : e.fills;
    }), k = g(() => {
      var t;
      return typeof e.strokes == "string" && ((t = l.colorSchemes) != null && t[e.strokes]) ? l.colorSchemes[e.strokes] : e.strokes;
    });
    function x(t, r, i) {
      if (!t || typeof DOMParser > "u") return t;
      const u = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${t}</svg>`, "image/svg+xml").documentElement, a = Array.from(u.children), c = (s, m, o) => {
        o === "keep" || o === null || o === void 0 || s.setAttribute(m, o === "text" ? "currentColor" : o);
      };
      return a.forEach((s, m) => {
        if (Array.isArray(r))
          c(s, "fill", r[m]);
        else if (typeof r == "object" && r !== null) {
          const o = s.getAttribute("id");
          o && r[o] !== void 0 && c(s, "fill", r[o]);
        } else r !== void 0 && c(s, "fill", r);
        if (Array.isArray(i))
          c(s, "stroke", i[m]);
        else if (typeof i == "object" && i !== null) {
          const o = s.getAttribute("id");
          o && i[o] !== void 0 && c(s, "stroke", i[o]);
        } else i !== void 0 && c(s, "stroke", i);
      }), u.innerHTML;
    }
    function v() {
      const t = D({
        icon: String(e.icon),
        theme: e.theme,
        filled: e.filled ? 1 : 0,
        weight: Number(e.weight)
      });
      if (t) {
        const r = e.opticalSize || S.value, i = Object.keys(t).map(Number).sort((u, a) => u - a);
        let p = r;
        !t[r] && i.length > 0 && (p = i.reduce((u, a) => Math.abs(a - r) < Math.abs(u - r) ? a : u));
        const f = t[p];
        if (f) {
          h.value = x(f.content, z.value, k.value), b.value = f.viewBox;
          return;
        }
      }
      h.value = "", l.debug && console.warn(`[material-symbol] Icon not found: ${String(e.icon)} (size ${e.size})`);
    }
    return _(
      () => [e.icon, e.theme, e.filled, e.weight, e.size, e.fills, e.strokes],
      () => v(),
      { deep: !0 }
    ), v(), (t, r) => (B(), A("svg", P({ viewBox: b.value }, y.value, { innerHTML: h.value }), null, 16, E));
  }
});
let n = {
  weight: 400,
  theme: "rounded",
  filled: !1,
  fills: "text",
  strokes: null,
  debug: C,
  colorSchemes: {}
};
function $(d) {
  n = {
    ...n,
    ...d
  };
}
const l = j({
  get weight() {
    return n.weight;
  },
  get theme() {
    return n.theme;
  },
  get filled() {
    return n.filled;
  },
  get fills() {
    return n.fills;
  },
  get strokes() {
    return n.strokes;
  },
  get debug() {
    return n.debug;
  },
  get colorSchemes() {
    return n.colorSchemes;
  }
});
export {
  T as MaterialSymbol,
  $ as configureMaterialSymbolDefaultProps,
  l as materialSymbolDefaultProps
};
//# sourceMappingURL=index.js.map
