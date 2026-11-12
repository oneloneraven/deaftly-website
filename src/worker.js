import { handleFeedback } from "./feedback.js";

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch: (request: Request) => Promise<Response> }, APP_ENV: string, RELEASE_VERSION?: string } & import("./feedback.js").FeedbackEnv} env
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/health") {
      return Response.json(
        { ok: true, environment: env.APP_ENV, version: env.RELEASE_VERSION ?? "unreleased" },
        {
          headers: {
            "Cache-Control": "no-store",
            "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
          },
        },
      );
    }
    if (pathname === "/api/feedback") {
      if (request.method !== "POST")
        return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
      return handleFeedback(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
