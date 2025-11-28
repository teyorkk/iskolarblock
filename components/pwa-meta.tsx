"use client";

import { useEffect } from "react";

export function PWAMeta() {
  useEffect(() => {
    // Add PWA meta tags that aren't covered by Next.js metadata API
    const addMetaTag = (name: string, content: string, attribute = "name") => {
      if (!document.querySelector(`meta[${attribute}="${name}"]`)) {
        const meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    };

    const addLinkTag = (rel: string, href: string) => {
      if (!document.querySelector(`link[rel="${rel}"]`)) {
        const link = document.createElement("link");
        link.setAttribute("rel", rel);
        link.setAttribute("href", href);
        document.head.appendChild(link);
      }
    };

    // Add manifest link
    addLinkTag("manifest", "/manifest.json");

    // Add theme color
    addMetaTag("theme-color", "#f97316");

    // Add Apple-specific meta tags
    addMetaTag("apple-mobile-web-app-capable", "yes");
    addMetaTag("apple-mobile-web-app-status-bar-style", "default");
    addMetaTag("apple-mobile-web-app-title", "IskolarBlock");

    // Add Apple touch icon
    addLinkTag("apple-touch-icon", "/iskolarblock.png");

    // Add mobile web app capable
    addMetaTag("mobile-web-app-capable", "yes");
  }, []);

  return null;
}
