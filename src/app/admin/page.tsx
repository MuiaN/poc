import { Overview } from "@/components/pages/Overview";
import { getCurrentUser } from "@/lib/current-user";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    // This should not happen in practice, as middleware protects the route
    return null;
  }

  return <Overview user={user} role="admin" />;
}