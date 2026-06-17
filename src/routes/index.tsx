import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("railoptic_access_token");
      throw redirect({ to: t ? "/dashboard" : "/login" });
    }
    throw redirect({ to: "/login" });
  },
});
