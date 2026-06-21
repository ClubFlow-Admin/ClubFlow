import type { MetadataRoute } from "next";
import { isSitePrivate } from "@/lib/site-auth";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (isSitePrivate()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/"
    }
  };
}
