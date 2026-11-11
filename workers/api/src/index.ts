/**
 * prismelo-api — the Prismelo Technology backend.
 *
 * A tiny explicit router: no framework, because there are only a couple of
 * dozen routes and a hand-written table is easier to audit than a dependency.
 *
 * Deployment note: if this Worker is served from a custom domain such as
 * api.prismelo.tech, set COOKIE_DOMAIN=.prismelo.tech so session cookies are
 * first-party for the site. On workers.dev, browsers treat the cookie as
 * third-party and drop it — use the `token` returned by login instead.
 */

import { json, preflight, type Ctx, type Env } from "./http";
import { contact, health, resource, resources, subscribe, unsubscribe } from "./routes/public";
import {
  createThreadRoute,
  login as communityLogin,
  logout as communityLogout,
  me,
  profile,
  register,
  replyRoute,
  thread,
  threads,
} from "./routes/community";
import {
  auditLog,
  communityThreads,
  communityOverview,
  createResource,
  deleteResource,
  login as adminLogin,
  logout as adminLogout,
  mailLog,
  moderateThread,
  notifyLegal,
  removeReply,
  removeSubscriber,
  removeThread,
  resources as adminResources,
  subscribers,
  updateResource,
} from "./routes/admin";

type Handler = (ctx: Ctx) => Promise<Response> | Response;

type Route = {
  method: string;
  segments: string[];
  handler: Handler;
};

const routes: Route[] = [];

function on(method: string, path: string, handler: Handler): void {
  routes.push({ method, segments: path.split("/").filter(Boolean), handler });
}

/* --------------------------------------------------------------------- public */

on("GET", "/health", health);
on("GET", "/api/health", health);

on("POST", "/api/contact", contact);
on("POST", "/api/subscribe", subscribe);
on("POST", "/api/subscribe/unsubscribe", unsubscribe);

on("GET", "/api/resources", resources);
on("GET", "/api/resources/:slug", resource);

/* ------------------------------------------------------------------ community */

on("POST", "/api/community/register", register);
on("POST", "/api/community/login", communityLogin);
on("POST", "/api/community/logout", communityLogout);
on("GET", "/api/community/me", me);
on("GET", "/api/community/users/:username", profile);
on("GET", "/api/community/threads", threads);
on("POST", "/api/community/threads", createThreadRoute);
on("GET", "/api/community/threads/:slug", thread);
on("POST", "/api/community/threads/:slug/replies", replyRoute);

/* ---------------------------------------------------------------------- admin */

on("POST", "/api/admin/login", adminLogin);
on("POST", "/api/admin/logout", adminLogout);
on("GET", "/api/admin/resources", adminResources);
on("POST", "/api/admin/resources", createResource);
on("PATCH", "/api/admin/resources/:slug", updateResource);
on("DELETE", "/api/admin/resources/:slug", deleteResource);
on("GET", "/api/admin/community/threads", communityThreads);
on("GET", "/api/admin/community/overview", communityOverview);
on("PATCH", "/api/admin/community/threads/:id", moderateThread);
on("DELETE", "/api/admin/community/threads/:id", removeThread);
on("DELETE", "/api/admin/community/replies/:id", removeReply);
on("GET", "/api/admin/community/subscribers", subscribers);
on("DELETE", "/api/admin/community/subscribers/:id", removeSubscriber);
on("GET", "/api/admin/mail", mailLog);
on("GET", "/api/admin/audit", auditLog);
on("POST", "/api/admin/notify-legal", notifyLegal);

/* --------------------------------------------------------------------- router */

function match(segments: string[], path: string[]): Record<string, string> | null {
  if (segments.length !== path.length) return null;

  const params: Record<string, string> = {};
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (segment.startsWith(":")) {
      const value = decodeURIComponent(path[index]);
      if (!value) return null;
      params[segment.slice(1)] = value;
    } else if (segment !== path[index]) {
      return null;
    }
  }
  return params;
}

function indexResponse(env: Env): Response {
  return json(
    {
      service: "prismelo-api",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        contact: "POST /api/contact",
        subscribe: "POST /api/subscribe",
        resources: "GET /api/resources",
        community: "GET /api/community/threads",
        admin: "POST /api/admin/login",
      },
      documentation: "https://github.com/kunal-a11y/Prismelo/blob/main/docs/BACKEND.md",
    },
    { status: 200, env },
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.split("/").filter(Boolean);

    if (request.method === "OPTIONS") {
      return preflight({ request, env, url, params: {} });
    }

    if (path.length === 0 && request.method === "GET") {
      return indexResponse(env);
    }

    const allowed = new Set<string>();
    for (const route of routes) {
      const params = match(route.segments, path);
      if (!params) continue;

      if (route.method !== request.method) {
        allowed.add(route.method);
        continue;
      }

      try {
        return await route.handler({ request, env, url, params });
      } catch (error) {
        console.error(`unhandled error on ${request.method} ${url.pathname}`, error);
        return json({ error: "internal_error" }, { status: 500, env, request });
      }
    }

    if (allowed.size > 0) {
      return json(
        { error: "method_not_allowed" },
        { status: 405, env, request, headers: { Allow: [...allowed].join(", ") } },
      );
    }

    return json({ error: "not_found" }, { status: 404, env, request });
  },
} satisfies { fetch: (request: Request, env: Env) => Promise<Response> };
