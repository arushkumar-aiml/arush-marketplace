"use client";

import { useEffect } from "react";

export default function PWARegister() {
    useEffect(() => {
        if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
            return;
        }

        navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
        }).catch((err) => console.error("Service worker registration failed:", err));
    }, []);

    return null;
}
