function u(e) {
  return `${e.theme}::${e.icon}::${e.filled}::${e.weight}`;
}
function f(e) {
  return `custom::${e.icon}`;
}
function l(e) {
  const n = e.match(/viewBox="([^"]+)"/i), r = e.match(/>([\s\S]*?)<\/svg>/i);
  return !n || !r ? null : {
    viewBox: n[1],
    content: r[1].trim()
  };
}
function c(e) {
  return Array.from(new Set(e));
}
function m(e, n) {
  const r = e && e.length ? e : n;
  return c(
    Array.from(r).map((t) => Number(t)).filter((t) => Number.isFinite(t))
  );
}
function d(e, n) {
  const r = e && e.length ? e : n, t = Array.from(r).map((o) => o === !0 ? 1 : o === !1 ? 0 : Number(o) === 1 ? 1 : 0);
  return c(t);
}
function g(e, n) {
  const r = e && e.length ? e : n, t = ["rounded", "outlined", "sharp"], o = Array.from(r).map((s) => String(s).toLowerCase()).filter((s) => t.includes(s));
  return c(o);
}
const a = {};
function h(e) {
  return e === "always" ? !0 : e === "off" ? !1 : typeof process < "u" && process.env && typeof process.env.NODE_ENV == "string" ? process.env.NODE_ENV !== "production" : !1;
}
let i = {
  diagnostics: "dev"
};
function y(e) {
  i = {
    ...i,
    ...e
  };
}
const p = {
  get diagnostics() {
    return i.diagnostics;
  }
};
export {
  p as a,
  d as b,
  g as c,
  f as d,
  y as e,
  u as k,
  m as n,
  l as p,
  h as s,
  c as u
};
//# sourceMappingURL=config-BZ8XTVRl.js.map
