const PRIMARY_HOST = "www.samsonhandyman.com";
const APEX_HOST = "samsonhandyman.com";

export function onRequest(context) {
  const url = new URL(context.request.url);
  const forwardedProtocol = context.request.headers.get("x-forwarded-proto");
  const cfVisitor = context.request.headers.get("cf-visitor");
  let visitorProtocol;

  if (cfVisitor) {
    try {
      visitorProtocol = JSON.parse(cfVisitor).scheme;
    } catch {
      // Ignore malformed edge metadata and fall back to the URL/forwarded protocol.
    }
  }

  const isCustomDomain = url.hostname === PRIMARY_HOST || url.hostname === APEX_HOST;
  const needsHttps =
    url.protocol !== "https:" ||
    forwardedProtocol === "http" ||
    visitorProtocol === "http";
  const needsPrimaryHost = url.hostname === APEX_HOST;

  if (isCustomDomain && (needsHttps || needsPrimaryHost)) {
    const redirectUrl = new URL(url.pathname + url.search, "https://" + PRIMARY_HOST);
    return Response.redirect(redirectUrl.toString(), 301);
  }

  return context.next();
}
