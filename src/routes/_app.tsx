import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("railoptic_access_token");
      if (!t) throw redirect({ to: "/login" });

      const userRaw = localStorage.getItem("railoptic_user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        const path = location.pathname;
        const isActionDeskRole = user.role === "rpf" || user.role === "maintenance";
        
        if (isActionDeskRole && !path.startsWith("/action-desk") && !path.startsWith("/settings")) {
          throw redirect({ to: "/action-desk" });
        }
        if (!isActionDeskRole && path.startsWith("/action-desk")) {
          throw redirect({ to: "/dashboard" });
        }
      }
    }
  },
  component: () => <Outlet />,
});
