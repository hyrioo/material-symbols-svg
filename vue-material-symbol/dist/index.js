import { defineComponent as E, ref as x, computed as u, watch as I, openBlock as j, createElementBlock as F, mergeProps as H, readonly as L } from "vue";
import { getSymbol as O } from "./consumer.js";
import { s as T, a as N } from "./config-BZ8XTVRl.js";
const $ = ["viewBox", "innerHTML"], K = /* @__PURE__ */ E({
  __name: "material-symbol",
  props: {
    icon: {},
    weight: { default: () => a.weight },
    theme: { default: () => a.theme },
    filled: { type: Boolean, default: () => a.filled },
    fills: { default: () => a.fills },
    strokes: { default: () => a.strokes },
    size: { default: 24 },
    opticalSize: { default: null }
  },
  setup(g) {
    const t = g, p = x(""), b = x("0 0 24 24"), d = u(() => typeof t.size == "object" ? t.size : { width: t.size, height: t.size }), M = u(() => ({ width: d.value.width, height: d.value.height })), C = u(() => Math.max(d.value.height, d.value.width));
    function S(e) {
      var o;
      return typeof e == "string" && ((o = a.colorSchemes) != null && o[e]) ? a.colorSchemes[e] : e;
    }
    const _ = u(() => S(t.fills)), A = u(() => S(t.strokes));
    function B(e) {
      return typeof e == "object" && e !== null && !Array.isArray(e);
    }
    function P(e) {
      return typeof e == "string" || e === null;
    }
    function D(e, o, m) {
      if (!e || typeof DOMParser > "u") return e;
      const l = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${e}</svg>`, "image/svg+xml").documentElement, c = Array.from(l.children), y = (r, f, s) => {
        s === "keep" || s === null || s === void 0 || r.setAttribute(f, s === "text" ? "currentColor" : s);
      }, z = (r, f, s, n) => {
        if (Array.isArray(n)) {
          y(r, s, n[f]);
          return;
        }
        if (B(n)) {
          const w = r.getAttribute("id");
          w && n[w] !== void 0 && y(r, s, n[w]);
          return;
        }
        P(n) && y(r, s, n);
      };
      return c.forEach((r, f) => {
        z(r, f, "fill", o), z(r, f, "stroke", m);
      }), l.innerHTML;
    }
    function k() {
      const e = O({
        icon: String(t.icon),
        theme: t.theme,
        filled: t.filled ? 1 : 0,
        weight: Number(t.weight)
      });
      if (e) {
        const o = t.opticalSize || C.value, m = Object.keys(e).map(Number).sort((l, c) => l - c);
        let v = o;
        !e[o] && m.length > 0 && (v = m.reduce((l, c) => Math.abs(c - o) < Math.abs(l - o) ? c : l));
        const h = e[v];
        if (h) {
          p.value = D(h.content, _.value, A.value), b.value = h.viewBox;
          return;
        }
      }
      p.value = "", T(N.diagnostics) && console.warn(
        `[vue-material-symbol] Icon "${String(t.icon)}" could not be rendered. Fix: verify defineIcons() includes this icon and requested variant.`
      );
    }
    return I(() => [t.icon, t.theme, t.filled, t.weight, t.size, t.fills, t.strokes], () => k(), {
      deep: !0
    }), k(), (e, o) => (j(), F("svg", H({ viewBox: b.value }, M.value, { innerHTML: p.value }), null, 16, $));
  }
});
let i = {
  weight: 400,
  theme: "rounded",
  filled: !1,
  fills: "text",
  strokes: null,
  colorSchemes: {}
};
function Q(g) {
  i = {
    ...i,
    ...g
  };
}
const a = L({
  get weight() {
    return i.weight;
  },
  get theme() {
    return i.theme;
  },
  get filled() {
    return i.filled;
  },
  get fills() {
    return i.fills;
  },
  get strokes() {
    return i.strokes;
  },
  get colorSchemes() {
    return i.colorSchemes;
  }
});
export {
  K as MaterialSymbol,
  Q as configureMaterialSymbolDefaultProps,
  a as materialSymbolDefaultProps
};
//# sourceMappingURL=index.js.map
