import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";

type CommunityApi = { fetch(request: Request): Promise<Response> };

/** Read the API Worker through a service binding, preserving the browser session. */
export async function communityApi(path: string, withSession = false): Promise<Response | null> {
  let api: CommunityApi | undefined;
  try {
    const context = await getCloudflareContext({ async: true });
    api = (context.env as CloudflareEnv & { PRISMELO_API?: CommunityApi }).PRISMELO_API;
  } catch {
    // Local Next.js development has no deployed service binding.
  }
  if (!api) return null;

  const headers = new Headers({ Accept: "application/json" });
  if (withSession) {
    const cookieHeader = (await cookies()).toString();
    if (cookieHeader) headers.set("Cookie", cookieHeader);
  }
  return api.fetch(new Request(`https://prismelo-api.internal${path}`, { headers }));
}

export async function communityJson<T>(path: string): Promise<T | null> {
  const response = await communityApi(path);
  if (!response?.ok) return null;
  return (await response.json()) as T;
}
