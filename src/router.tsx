import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function createRouter(queryClient = new QueryClient()) {
  return createTanstackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
}

export const router = createRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
