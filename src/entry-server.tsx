import React from "react";
import {
  RouterServer,
  createRequestHandler,
  renderRouterToString,
} from "@tanstack/react-router/ssr/server";
import { createRouter } from "./router";

export async function render({ request }: { request: Request }) {
  const handler = createRequestHandler({
    request,
    createRouter: () => createRouter(),
  });

  return handler(({ request, responseHeaders, router }) =>
    renderRouterToString({
      request,
      responseHeaders,
      router,
      children: <RouterServer router={router} />,
    }),
  );
}
