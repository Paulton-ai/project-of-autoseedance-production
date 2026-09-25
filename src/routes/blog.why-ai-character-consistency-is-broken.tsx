import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/why-ai-character-consistency-is-broken")({
  beforeLoad: () => {
    throw redirect({
      to: "/blog/$slug",
      params: { slug: "ai-character-consistency-problem-2026" },
    });
  },
  component: () => null,
});
