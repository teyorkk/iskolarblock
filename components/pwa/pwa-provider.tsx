"use client";

import { useEffect } from "react";

const SERVICE_WORKER_PATH = "/sw.js";

export function PWAProvider(): React.JSX.Element | null {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          SERVICE_WORKER_PATH,
          {
            scope: "/",
          }
        );

        if (process.env.NODE_ENV === "development") {
          console.info("Service worker registered:", registration.scope);
        }
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    register().catch((error) => {
      console.error("Service worker registration promise rejected:", error);
    });
  }, []);

  return null;
}
