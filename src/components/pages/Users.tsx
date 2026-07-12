"use client";

import { useState } from "react";
import { Card, PageHeader, Badge, PanelHeader, Button, DataTable } from "@/components/ui";
import { MOCK_USERS, type MockUser } from "@/data/mock-users";

function tone(status: MockUser["status"]) {
  if (status === "active") return "success" as const;
  if (status === "invited") return "info" as const;
  return "danger" as const;
}

export function Users() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Users & Invites"
        subtitle="Manage every account with access to the FRED BLACK platform"
        action={
          <Button variant="primary" onClick={() => setOpen((v) => !v)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Invite User
          </Button>
        }
      />

      {open && (
        <Card className="p-4">
          <div className="mb-3 text-[12.5px] font-semibold text-text">Invite a new user</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input placeholder="Full name" className="rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent" />
            <input placeholder="Email address" className="rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent" />
            <select className="rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent">
              <option>Admin</option>
              <option>Underwriter</option>
              <option>Operator</option>
            </select>
            <select className="rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent">
              <option>FRED BLACK</option>
              <option>Kenya Airways</option>
              <option>Ethiopian Airlines</option>
              <option>RwandAir</option>
              <option>Fly540</option>
            </select>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Send Invite
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <PanelHeader title={`${MOCK_USERS.length} Users`} />
        <div className="overflow-x-auto">
          <DataTable columns={["Name", "Email", "Role", "Company", "Status", "Last Active", ""]}>
            {MOCK_USERS.map((u) => (
              <tr key={u.email} className="border-b border-border last:border-none hover:bg-bg-hover">
                <td className="px-3.5 py-2.5 font-semibold text-text">{u.name}</td>
                <td className="px-3.5 py-2.5 text-text-2">{u.email}</td>
                <td className="px-3.5 py-2.5 text-text">{u.roleLabel}</td>
                <td className="px-3.5 py-2.5 text-text">{u.company}</td>
                <td className="px-3.5 py-2.5">
                  <Badge tone={tone(u.status)}>{u.status}</Badge>
                </td>
                <td className="px-3.5 py-2.5 text-text-2">{u.lastActive}</td>
                <td className="px-3.5 py-2.5 text-right">
                  <button className="text-[11px] font-semibold text-accent hover:underline">Manage</button>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      </Card>
    </div>
  );
}
