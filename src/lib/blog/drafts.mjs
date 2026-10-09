// Draft articles are shown only when explicitly asked for: `npm run dev:drafts` and
// `npm run build:drafts` set BLOG_INCLUDE_DRAFTS=1. Plain `npm run dev` matches production.

/**
 * @param {Record<string, string | undefined>} [env]
 * @returns {boolean}
 */
export function draftsEnabled(env = process.env) {
  return env.BLOG_INCLUDE_DRAFTS === "1";
}
