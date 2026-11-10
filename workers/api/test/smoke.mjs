#!/usr/bin/env node
/**
 * End-to-end check against a running `wrangler dev`.
 *
 *   npm run dev           # terminal 1
 *   npm run smoke         # terminal 2
 *
 * It exercises the real Worker: D1 reads and writes, sessions, validation,
 * rate limiting, CORS and origin rejection. Email paths are asserted for what
 * they should do without credentials (501, never a fake success).
 */

const BASE = process.env.API_BASE ?? "http://127.0.0.1:8787";
const ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:3200";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "test-admin-password";

const results = [];
let failures = 0;

function check(name, condition, detail = "") {
  const pass = Boolean(condition);
  if (!pass) failures += 1;
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${pass || !detail ? "" : `  -> ${detail}`}`);
}

async function call(path, { method = "GET", body, origin = ORIGIN, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (origin) headers.origin = origin;
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = null;
  const text = await response.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 120) };
  }
  return { status: response.status, data, headers: response.headers };
}

const stamp = Date.now().toString(36);
const email = `smoke-${stamp}@example.com`;

async function main() {
  /* ---------------------------------------------------------------- health */
  const health = await call("/health");
  check("GET /health returns 200 and storage ok", health.status === 200 && health.data.storage === "ok", JSON.stringify(health.data));

  // Mail paths answer differently depending on whether SMTP is configured, and
  // both answers are correct. Assert the one that applies rather than assuming.
  const mailConfigured = health.data.mail === "configured";

  check(
    "health reports at-rest encryption",
    health.data.encryption === "configured",
    `encryption=${health.data.encryption}`,
  );
  check(
    "health reports a password pepper",
    health.data.passwordPepper === "configured",
    `pepper=${health.data.passwordPepper}`,
  );

  const index = await call("/");
  check("GET / identifies the service", index.status === 200 && index.data.service === "prismelo-api", JSON.stringify(index.data));

  /* ------------------------------------------------------------------ cors */
  const preflight = await fetch(`${BASE}/api/contact`, {
    method: "OPTIONS",
    headers: { origin: ORIGIN, "access-control-request-method": "POST" },
  });
  check(
    "OPTIONS allows the site origin",
    preflight.status === 204 && preflight.headers.get("access-control-allow-origin") === ORIGIN,
    `${preflight.status} ${preflight.headers.get("access-control-allow-origin")}`,
  );

  const evil = await call("/api/contact", {
    method: "POST",
    body: { name: "X", email: "x@example.com", details: "x".repeat(30) },
    origin: "https://evil.example",
  });
  check("cross-origin mutation is rejected with 403", evil.status === 403, `${evil.status} ${JSON.stringify(evil.data)}`);

  /* ------------------------------------------------------------- resources */
  const list = await call("/api/resources");
  check("GET /api/resources lists seeded posts", list.status === 200 && list.data.resources.length >= 5, `${list.status} count=${list.data.resources?.length}`);

  const first = list.data.resources?.[0];
  const detail = first ? await call(`/api/resources/${first.slug}`) : { status: 0, data: {} };
  check("GET /api/resources/:slug returns the body", detail.status === 200 && typeof detail.data.post?.body === "string", `${detail.status}`);

  const missing = await call("/api/resources/does-not-exist");
  check("unknown post returns 404", missing.status === 404, `${missing.status}`);

  /* --------------------------------------------------------------- contact */
  const invalid = await call("/api/contact", { method: "POST", body: { name: "A", email: "nope", details: "short" } });
  check(
    "contact rejects invalid fields with 400",
    invalid.status === 400 && invalid.data.error === "validation_failed" && invalid.data.fields?.email,
    `${invalid.status} ${JSON.stringify(invalid.data)}`,
  );

  const honeypot = await call("/api/contact", {
    method: "POST",
    body: { name: "Bot Bot", email: "bot@example.com", details: "x".repeat(40), website: "http://spam.example" },
  });
  check("contact honeypot answers 200 without sending", honeypot.status === 200 && honeypot.data.ok === true, `${honeypot.status}`);

  const valid = await call("/api/contact", {
    method: "POST",
    body: {
      name: "Smoke Test",
      email: "smoke@example.com",
      company: "Test Co",
      service: "Cloud",
      details: "This is a smoke-test enquiry long enough to pass validation.",
    },
  });
  if (mailConfigured) {
    check("contact sends when SMTP is configured", valid.status === 200 && valid.data.ok === true, `${valid.status} ${JSON.stringify(valid.data)}`);
  } else {
    check(
      "contact without SMTP credentials reports 501 (no fake success)",
      valid.status === 501 && valid.data.error === "delivery_not_configured",
      `${valid.status} ${JSON.stringify(valid.data)}`,
    );
  }

  /* ------------------------------------------------------------- community */
  const register = await call("/api/community/register", {
    method: "POST",
    body: { name: "Smoke Tester", email, password: "correct-horse-battery" },
  });
  check("register creates an account and returns a token", register.status === 200 && Boolean(register.data.token), `${register.status} ${JSON.stringify(register.data)}`);
  const token = register.data.token;

  const duplicate = await call("/api/community/register", {
    method: "POST",
    body: { name: "Smoke Tester", email, password: "correct-horse-battery" },
  });
  check("duplicate email returns 409", duplicate.status === 409, `${duplicate.status}`);

  const me = await call("/api/community/me", { token });
  check("Bearer token identifies the member", me.status === 200 && me.data.user?.username, `${me.status} ${JSON.stringify(me.data)}`);

  check(
    "member response never includes the email address",
    me.status === 200 && !Object.prototype.hasOwnProperty.call(me.data.user ?? {}, "email"),
    JSON.stringify(me.data.user),
  );

  const tampered = `${token.slice(0, -2)}${token.slice(-2) === "aa" ? "bb" : "aa"}`;
  const tamperedMe = await call("/api/community/me", { token: tampered });
  check("a tampered session token is rejected", tamperedMe.status === 401, `${tamperedMe.status}`);

  const noAuthThread = await call("/api/community/threads", {
    method: "POST",
    body: { title: "Anonymous attempt", category: "General", body: "x".repeat(40) },
  });
  check("starting a thread requires sign-in", noAuthThread.status === 401, `${noAuthThread.status}`);

  const newThread = await call("/api/community/threads", {
    method: "POST",
    body: { title: `Smoke thread ${stamp}`, category: "General", body: "A thread created by the smoke test, long enough to pass." },
    token,
  });
  check("signed-in member can start a thread", newThread.status === 200 && newThread.data.slug, `${newThread.status} ${JSON.stringify(newThread.data)}`);

  const threadList = await call("/api/community/threads");
  const created = threadList.data.threads?.find((entry) => entry.slug === newThread.data.slug);
  check("new thread appears in the list with its author", Boolean(created?.author?.name), JSON.stringify(created?.author));

  const reply = await call(`/api/community/threads/${newThread.data.slug}/replies`, {
    method: "POST",
    body: { body: "A reply from the smoke test." },
    token,
  });
  check("member can reply", reply.status === 200 && reply.data.ok, `${reply.status}`);

  const threadDetail = await call(`/api/community/threads/${newThread.data.slug}`);
  check("thread detail includes the reply", threadDetail.status === 200 && threadDetail.data.thread?.replies?.length === 1, `${threadDetail.status} replies=${threadDetail.data.thread?.replies?.length}`);

  const badLogin = await call("/api/community/login", { method: "POST", body: { email, password: "wrong-password" } });
  check("wrong password returns 401", badLogin.status === 401, `${badLogin.status}`);

  // One character off must fail exactly like any other wrong password.
  const nearMiss = await call("/api/community/login", { method: "POST", body: { email, password: "correct-horse-batterY" } });
  check("a near-miss password is refused", nearMiss.status === 401, `${nearMiss.status}`);

  const login = await call("/api/community/login", { method: "POST", body: { email, password: "correct-horse-battery" } });
  check("correct password signs in", login.status === 200 && Boolean(login.data.token), `${login.status}`);

  /* ----------------------------------------------------------------- admin */
  const adminNoAuth = await call("/api/admin/resources");
  check("admin routes reject anonymous callers", adminNoAuth.status === 401, `${adminNoAuth.status}`);

  const adminBad = await call("/api/admin/login", { method: "POST", body: { password: "not-the-password" } });
  check("wrong admin password returns 401", adminBad.status === 401, `${adminBad.status}`);

  const adminLogin = await call("/api/admin/login", { method: "POST", body: { password: ADMIN_PASSWORD } });
  check("admin password signs in", adminLogin.status === 200 && Boolean(adminLogin.data.token), `${adminLogin.status} ${JSON.stringify(adminLogin.data)}`);
  const adminToken = adminLogin.data.token;

  const draft = await call("/api/admin/resources", {
    method: "POST",
    body: {
      slug: `smoke-post-${stamp}`,
      title: "Smoke post",
      description: "A post created by the smoke test to prove the write path works.",
      category: "Engineering",
      date: "2026-11-10",
      draft: true,
      body: "This body is long enough to satisfy the minimum length for a post.",
    },
    token: adminToken,
  });
  check("admin can create a post", draft.status === 200 && draft.data.post?.slug, `${draft.status} ${JSON.stringify(draft.data)}`);

  const notPublic = await call(`/api/resources/smoke-post-${stamp}`);
  check("drafts are not visible publicly", notPublic.status === 404, `${notPublic.status}`);

  const patched = await call(`/api/admin/resources/smoke-post-${stamp}`, {
    method: "PATCH",
    body: { draft: false },
    token: adminToken,
  });
  check("admin can publish a post", patched.status === 200, `${patched.status} ${JSON.stringify(patched.data)}`);

  const nowPublic = await call(`/api/resources/smoke-post-${stamp}`);
  check("published post is readable publicly", nowPublic.status === 200, `${nowPublic.status}`);

  const removedPost = await call(`/api/admin/resources/smoke-post-${stamp}`, { method: "DELETE", token: adminToken });
  check("admin can delete a post", removedPost.status === 200, `${removedPost.status}`);

  // With mail configured this would post a real notice to every subscriber, so
  // assert the guard instead: an empty notice must be refused before sending.
  const auditLog = await call("/api/admin/audit", { token: adminToken });
  const events = auditLog.data.events ?? [];
  check(
    "audit log records admin sign-ins and refusals",
    auditLog.status === 200 && events.some((entry) => entry.event === "admin.login") && events.some((entry) => entry.event === "admin.login_failed"),
    `${auditLog.status} events=${events.length}`,
  );
  check(
    "audit log never stores a password or token",
    !JSON.stringify(events).includes(adminToken) && !JSON.stringify(events).includes(ADMIN_PASSWORD),
  );

  const legal = mailConfigured
    ? await call("/api/admin/notify-legal", { method: "POST", body: {}, token: adminToken })
    : await call("/api/admin/notify-legal", {
        method: "POST",
        body: { subject: "Policy update", message: "A sufficiently long legal notice body." },
        token: adminToken,
      });
  check(
    mailConfigured ? "legal notice validates before sending" : "legal notice without SMTP reports 501",
    mailConfigured ? legal.status === 400 : legal.status === 501,
    `${legal.status} ${JSON.stringify(legal.data)}`,
  );

  /* ------------------------------------------------------------ subscribe */
  const sub = await call("/api/subscribe", { method: "POST", body: { email: `list-${stamp}@example.com`, source: "resources" } });
  check("subscribe accepts a new address", sub.status === 200 && sub.data.ok, `${sub.status} ${JSON.stringify(sub.data)}`);

  const badUnsub = await call("/api/subscribe/unsubscribe", { method: "POST", body: { token: "not-a-real-token" } });
  check("unsubscribe rejects an unknown token", badUnsub.status === 400, `${badUnsub.status}`);

  /* ---------------------------------------------------------- rate limiting */
  let limited = false;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const hit = await call("/api/contact", {
      method: "POST",
      body: { name: "Rate Test", email: "rate@example.com", details: "Another enquiry body that is long enough to pass." },
    });
    if (hit.status === 429) limited = true;
  }
  check("contact rate limit engages under repeated posts", limited);

  /* ------------------------------------------------------------- not found */
  const nowhere = await call("/api/nope");
  check("unknown path returns 404", nowhere.status === 404, `${nowhere.status}`);

  const method = await call("/api/contact");
  check("wrong method returns 405 with Allow", method.status === 405 && method.headers.get("allow")?.includes("POST"), `${method.status}`);

  console.log(`\n${results.length - failures}/${results.length} checks passed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("smoke test crashed:", error);
  process.exit(1);
});
