import satori from "satori";

interface Env {
  OGIFY_API_KEYS?: string;
}

async function loadFont(): Promise<ArrayBuffer> {
  const url = "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf";
  const resp = await fetch(url);
  if (resp.ok) return resp.arrayBuffer();
  throw new Error("Failed to load font");
}

function validateKey(key: string, env: Env): boolean {
  const validKeys = (env.OGIFY_API_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean);
  if (validKeys.length === 0) return true;
  return validKeys.includes(key);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname !== "/og") {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    const title = url.searchParams.get("title");
    const subtitle = url.searchParams.get("subtitle");
    const bg = url.searchParams.get("bg");
    const logo = url.searchParams.get("logo");
    const key = url.searchParams.get("key");

    if (!title) return Response.json({ error: "title is required" }, { status: 400 });
    if (title.length > 200) return Response.json({ error: "title too long" }, { status: 400 });

    if (!key || !validateKey(key, env)) {
      return Response.json({ error: "rate_limit", message: "Invalid or missing API key" }, { status: 429 });
    }

    const cache = (caches as any).default;
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const fontData = await loadFont();
      const svg = await satori(
        {
          type: "div",
          props: {
            style: {
              width: 1200,
              height: 630,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              fontFamily: "Inter",
              overflow: "hidden",
              ...(bg
                ? { background: `url(${bg}) center/cover no-repeat` }
                : { background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }),
            },
            children: [
              bg && {
                type: "div",
                props: {
                  style: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" },
                },
              },
              logo && {
                type: "img",
                props: {
                  src: logo,
                  style: { width: 72, height: 72, borderRadius: 16, zIndex: 1, marginBottom: 16 },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 56,
                    fontWeight: 700,
                    color: "#fff",
                    textAlign: "center",
                    lineHeight: 1.3,
                    maxWidth: 900,
                    zIndex: 1,
                    padding: "0 40px",
                    textShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  },
                  children: title,
                },
              },
              subtitle && {
                type: "div",
                props: {
                  style: {
                    fontSize: 24,
                    color: "rgba(255,255,255,0.8)",
                    textAlign: "center",
                    marginTop: 16,
                    zIndex: 1,
                  },
                  children: subtitle,
                },
              },
            ].filter(Boolean),
          },
        },
        { width: 1200, height: 630, fonts: [{ name: "Inter", data: fontData, weight: 700, style: "normal" }] }
      );

      const response = new Response(svg, {
        headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=31536000, immutable" },
      });

      req.url.startsWith("http") && (await cache.put(req, response.clone()));
      return response;
    } catch (err) {
      return Response.json({ error: "generation_failed", detail: String(err) }, { status: 500 });
    }
  },
};
