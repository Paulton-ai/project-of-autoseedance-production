import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router";
import { initAnalytics, trackPageView } from "./lib/analytics";

const queryClient = new QueryClient();

initAnalytics();

router.subscribe("onResolved", ({ toLocation }) => {
  trackPageView(toLocation.pathname);
});

function App() {
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);
  return <RouterProvider router={router} context={{ queryClient }} />;
}

const rootEl = document.getElementById("root")!;
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
