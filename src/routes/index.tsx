import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAtlas();
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
