import { createHash, timingSafeEqual } from "node:crypto";
import process from "node:process";
import { unauthenticated } from "../shopify.server";

const SHOP_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

function isAuthorized(request) {
  const secret = process.env.SYNC_API_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  const digest = (value) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(provided), digest(secret));
}

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export const loader = () => json({ error: "Method not allowed" }, 405);

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (!isAuthorized(request)) {
    return json({ error: "Unauthorized" }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { shop, query, variables } = body || {};
  if (typeof shop !== "string" || !SHOP_DOMAIN.test(shop)) {
    return json({ error: "Invalid shop" }, 400);
  }
  if (typeof query !== "string" || !query.trim()) {
    return json({ error: "Missing query" }, 400);
  }

  let admin;
  try {
    // Refreshes the offline token when it is within 5 minutes of expiry.
    ({ admin } = await unauthenticated.admin(shop));
  } catch (error) {
    console.error("Session lookup failed", { shop, error: error.message });
    return json({ error: "No valid session for this shop" }, 404);
  }

  try {
    const response = await admin.graphql(query, { variables, tries: 3 });
    return json(await response.json());
  } catch (error) {
    if (error.body) {
      return json(error.body, 400);
    }
    console.error("GraphQL proxy failed", { shop, error: error.message });
    return json({ error: "Shopify request failed" }, 502);
  }
};
