const PRIMARY_HOST = "www.samsonhandyman.com";
const APEX_HOST = "samsonhandyman.com";

export function onRequest(context) {
  const url = new URL(context.request.url);
  const forwardedProtocol = context.request.headers.get("x-forwarded-proto");
  const isCustomDomain = url.hostname === PRIMARY_HOST || url.hostname === APEX_HOST;
  const needsHttps = url.protocol !== "https:" || forwardedProtocol === "http";
  const needsPrimaryHost = url.hostname === APEX_HOST;

  if (isCustomDomain && (needsHttps || needsPrimaryHost)) {
    const redirectUrl = new URL(url.pathname + url.search, "https://" + PRIMARY_HOST);
    return Response.redirect(redirectUrl.toString(), 301);
  }

  return context.next();
}
