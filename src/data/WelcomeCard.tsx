import type { Role } from "@/lib/types";

export function WelcomeCard({ name, role }: { name: string; role: Role }) {
  const firstName = name.split(" ")[0];
  const isOp = role === "operator";

  return (
    <div className="welcome-card">
      <h2>{`Welcome back, ${firstName}! 👋`}</h2>
      <p>
        {isOp
          ? "Here's an overview of your Kenya Airways fleet and operations today."
          : "Here's what's happening with your aviation portfolio today."}
      </p>
    </div>
  );
}