import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PakAutoSe Generators",
    short_name: "PakAutoSe",
    description:
      "PakAutoSe provides quality generators, genuine parts, and professional generator services in Pakistan.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "en-PK",
  };
}
