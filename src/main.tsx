import React from "react";
import { hydrateRoot } from "react-dom/client";
import { RouterClient } from "@tanstack/react-router/ssr/client";
import { router } from "./router";
import { initAnalytics, trackPageView } from "./lib/analytics";
import "./styles.css";

initAnalytics();

router.subscribe("onResolved", ({ toLocation }) => {
  trackPageView(toLocation.pathname);
});

hydrateRoot(
  document,
  <React.StrictMode>
    <RouterClient router={router} />
  </React.StrictMode>,
);
