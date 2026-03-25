export async function GET() {
  return new Response(
    "google-site-verification=UbRhy6VTZlLstY2cPwAR4PqjqBecFxYW-vTdv_zfAC8",
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    }
  );
}
