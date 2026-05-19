"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export default function TawkWidget() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (document.getElementById("tawk-to-widget-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    const firstScript = document.getElementsByTagName("script")[0];
    script.id = "tawk-to-widget-script";
    script.async = true;
    script.src = "https://embed.tawk.to/6a0c64aaf47d421c3682ce26/1jp06igct";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    firstScript.parentNode?.insertBefore(script, firstScript);
  }, []);

  return null;
}
