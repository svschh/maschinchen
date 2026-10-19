import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

const ID = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_BODY = 1_500_000;

const reply = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const digest = (s) => createHash("sha256").update(String(s)).digest();

async function readBody(req) {
  const text = await req.text();
  if (text.length > MAX_BODY) return { error: reply({ error: "Zu groß." }, 413) };
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    return { data };
  } catch {
    return { error: reply({ error: "Ungültige Daten." }, 400) };
  }
}

export default async (req) => {
  const expected = process.env.ACCESS_CODE;
  if (!expected) {
    return reply({ error: "In Netlify fehlt die Variable ACCESS_CODE. Lege sie an und starte einen neuen Deploy." }, 500);
  }
  const given = req.headers.get("x-code") || "";
  if (!timingSafeEqual(digest(given), digest(expected))) return reply({ error: "auth" }, 401);

  const [kind, a, b] = new URL(req.url).pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const patterns = getStore({ name: "patterns", consistency: "strong" });
  const photos = getStore({ name: "photos", consistency: "strong" });
  const m = req.method;

  try {
    if (kind === "docs" && !a && m === "GET") {
      const { blobs } = await patterns.list();
      const rows = await Promise.all(
        blobs.map(async (x) => ({ id: x.key, data: await patterns.get(x.key, { type: "json" }) }))
      );
      return reply(rows.filter((r) => r.data));
    }

    if (kind === "docs" && a && ID.test(a)) {
      if (m === "PUT") {
        const body = await readBody(req);
        if (body.error) return body.error;
        await patterns.setJSON(a, body.data);
        return reply({ ok: true });
      }
      if (m === "DELETE") {
        await patterns.delete(a);
        const { blobs } = await photos.list({ prefix: a + "/" });
        await Promise.all(blobs.map((x) => photos.delete(x.key)));
        return reply({ ok: true });
      }
    }

    if (kind === "photos" && a && ID.test(a)) {
      if (!b && m === "GET") {
        const { blobs } = await photos.list({ prefix: a + "/" });
        const rows = await Promise.all(
          blobs.map(async (x) => ({ id: x.key.split("/")[1], data: await photos.get(x.key, { type: "json" }) }))
        );
        rows.sort((p, q) => (p.data?.created || 0) - (q.data?.created || 0));
        return reply(rows.filter((r) => r.data));
      }
      if (b && ID.test(b)) {
        if (m === "PUT") {
          const body = await readBody(req);
          if (body.error) return body.error;
          await photos.setJSON(a + "/" + b, body.data);
          return reply({ ok: true });
        }
        if (m === "DELETE") {
          await photos.delete(a + "/" + b);
          return reply({ ok: true });
        }
      }
    }

    return reply({ error: "Nicht gefunden." }, 404);
  } catch (e) {
    return reply({ error: "Serverfehler." }, 500);
  }
};

export const config = { path: "/api/*" };
