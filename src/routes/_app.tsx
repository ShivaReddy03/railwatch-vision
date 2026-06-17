import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("railoptic_access_token");
      if (!t) throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});
