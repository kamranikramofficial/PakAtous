export async function GET() {
  return new Response(
    "google-site-verification=rDqxssgRpWDWOjB4U8LG-0FXPNW6sJ62eAALi70-Qv0",
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    }
  );
}
