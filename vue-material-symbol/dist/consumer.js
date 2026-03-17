import { k as d, d as u, p, s as g, a as y } from "./config-BZ8XTVRl.js";
import { e as I } from "./config-BZ8XTVRl.js";
import b from "./loader-map.js";
const a = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set(), i = b;
function r(e, o) {
  !g(y.diagnostics) || f.has(e) || (f.add(e), console.warn(`[vue-material-symbol] ${o}`));
}
function h(e) {
  const o = `::${e}::`;
  return Object.keys(i).some((n) => n.includes(o));
}
function w(e) {
  const o = d(e), n = u(e);
  let t = a.get(o) || a.get(n);
  if (!t) {
    const s = i[o] || i[n];
    if (s) {
      t = {};
      for (const [c, m] of Object.entries(s)) {
        const l = p(m);
        l && (t[Number(c)] = l);
      }
      a.set(s === i[o] ? o : n, t);
    } else
      Object.keys(i).length === 0 ? r(
        "loader-map-empty",
        "Loader map is empty. Fix: generate/populate @hyrioo/vue-material-symbol loader-map.js before rendering icons."
      ) : h(e.icon) ? r(
        `variant:${o}`,
        `Variant not found for icon "${e.icon}" (theme=${e.theme}, filled=${e.filled}, weight=${e.weight}). Fix: include this variant in defineIcons() or use an available one.`
      ) : r(
        `icon:${e.icon}`,
        `Icon "${e.icon}" was not found in generated symbols. Fix: add it to defineIcons().`
      );
  }
  return t;
}
export {
  I as configureSymbolConfig,
  w as getSymbol,
  y as symbolConfig
};
//# sourceMappingURL=consumer.js.map
