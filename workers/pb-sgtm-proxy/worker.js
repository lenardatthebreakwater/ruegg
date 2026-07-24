const UPSTREAM_HOST = "sgtm.peisbutikken.no";
const PUBLIC_PREFIX = "/cartdata";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // /cartdata → /, /cartdata/gtm.js → /gtm.js, /cartdata/g/collect → /g/collect
    const upstreamPath =
      url.pathname === PUBLIC_PREFIX
        ? "/"
        : url.pathname.startsWith(`${PUBLIC_PREFIX}/`)
          ? url.pathname.slice(PUBLIC_PREFIX.length)
          : url.pathname;

    const upstreamUrl = `https://${UPSTREAM_HOST}${upstreamPath}${url.search}`;
    const upstreamRequest = new Request(upstreamUrl, request);

    // Preserve visitor context for GA4 geo/IP and debugging.
    const clientIp = request.headers.get("CF-Connecting-IP");
    if (clientIp) upstreamRequest.headers.set("X-Forwarded-For", clientIp);
    upstreamRequest.headers.set("X-Forwarded-Host", url.hostname);
    upstreamRequest.headers.set("X-Forwarded-Proto", "https");

    return fetch(upstreamRequest);
  },
};
