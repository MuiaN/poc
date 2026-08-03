"use client";

import { useState, useEffect } from "react";
import { Card, PageHeader, Badge, PanelHeader, Button, DataTable, Dialog } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { User, Company } from "@/lib/api";

interface InviteUserForm {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  companyId?: string;
}

interface EditUserForm extends Partial<User> {
  companyId?: string;
}

function tone(status: User["status"]) {
  if (status === "active") return "success" as const;
  if (status === "invited") return "info" as const;
  return "danger" as const;
}

export function Users() {
  const { users, companies, loading, fetchUsers, fetchCompanies, createUser, updateUser, deleteUser, changeUserPassword, currentUser } = useStore();
  const [error, setError] = useState<string | null>(null);
  
  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteUserForm>({
    name: "",
    email: "",
    password: "",
    role: "admin" as User["role"],
    companyId: "",
  });

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>({});

  // Password dialog state
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, [fetchUsers, fetchCompanies]);

  // Sort users so that the currently logged-in user appears first
  const sortedUsers = [...users].sort((a, b) => {
    if (currentUser && a.id === currentUser.id) return -1;
    if (currentUser && b.id === currentUser.id) return 1;
    return 0;
  });

  // Reset invite form when opening dialog
  const openInviteDialog = () => {
    setInviteForm({ name: "", email: "", password: "", role: "admin", companyId: companies[0]?.id || "" });
    setInviteOpen(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setError(null);
    try {
      const inviteData = { ...inviteForm };
      // Only include companyId if it's a valid UUID
      if (!inviteData.companyId) {
        delete inviteData.companyId;
      }
      await createUser(inviteData);
      setInviteOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: user.roleLabel,
      companyId: user.company.id,
      status: user.status,
    });
    // Store original companyId as fallback
    setOriginalCompanyId(user.company.id);
    setEditOpen(true);
  };

  const [originalCompanyId, setOriginalCompanyId] = useState<string>("");

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    setError(null);
    try {
      const updateData = { ...editForm };
      // Prevent self role change
      if (currentUser && editingUser.id === currentUser.id) {
        delete updateData.role;
      }
      // Ensure companyId is a valid UUID - use original as fallback if empty/invalid
      if (!updateData.companyId || updateData.companyId === "") {
        updateData.companyId = originalCompanyId || editingUser.company.id;
      }
      // Explicitly ensure it's a valid UUID format (36 chars with dashes)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(updateData.companyId)) {
        updateData.companyId = originalCompanyId || editingUser.company.id;
      }
      await updateUser(editingUser.id, updateData);
      setEditOpen(false);
      setEditingUser(null);
      setOriginalCompanyId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setError(null);
    try {
      await deleteUser(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const openPasswordDialog = (userId: string) => {
    setPasswordUserId(userId);
    setPasswordForm({ currentPassword: "", newPassword: "" });
    setPasswordOpen(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUserId) return;
    setPasswordLoading(true);
    setError(null);
    try {
      await changeUserPassword(passwordUserId, passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordOpen(false);
      setPasswordUserId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Users & Invites"
        subtitle="Manage every account with access to the FRED BLACK platform"
        action={
          <Button variant="primary" onClick={openInviteDialog}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Invite User
          </Button>
        }
      />

      {/* Invite User Dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite New User"
        description="Enter the details for the new user account"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Full Name</label>
              <input
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                placeholder="Full name"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Email</label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="Email address"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Role</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as User["role"] })}
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              >
                <option value="admin">Admin</option>
                <option value="underwriter">Underwriter</option>
                <option value="operator">Operator</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Company</label>
              <select
                value={inviteForm.companyId || ""}
                onChange={(e) => setInviteForm({ ...inviteForm, companyId: e.target.value || undefined })}
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              >
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-2 mb-1">Password</label>
            <input
              type="password"
              value={inviteForm.password}
              onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
              placeholder="Password"
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={inviteLoading}>
              {inviteLoading ? "Inviting..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingUser(null); }}
        title="Edit User"
        description="Update user details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Full Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Full name"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Email address"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as User["role"] })}
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
                disabled={!!(editingUser && currentUser?.id && editingUser.id === currentUser.id)}
              >
                <option value="admin">Admin</option>
                <option value="underwriter">Underwriter</option>
                <option value="operator">Operator</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Company</label>
              <select
                value={editForm.companyId || ""}
                onChange={(e) => setEditForm({ ...editForm, companyId: e.target.value || undefined })}
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              >
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as User["status"] })}
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              >
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => { setEditOpen(false); setEditingUser(null); }}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordOpen}
        onClose={() => { setPasswordOpen(false); setPasswordUserId(null); }}
        title="Change Password"
        description="Enter current and new password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-text-2 mb-1">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Current password"
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-2 mb-1">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="New password"
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => { setPasswordOpen(false); setPasswordUserId(null); }}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Card>
        <PanelHeader title={`${users.length} Users`} />
        {error && <div className="p-3 text-danger text-sm">{error}</div>}
        {loading.users ? (
          <div className="p-8 text-center text-text-2">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable columns={["Name", "Email", "Role", "Company", "Status", "Last Active", { key: "Actions", label: "Actions", align: "left" }]}>
              {sortedUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-none hover:bg-bg-hover">
                  <td className="px-3.5 py-2.5 font-semibold text-text">{u.name}</td>
                  <td className="px-3.5 py-2.5 text-text-2">{u.email}</td>
                  <td className="px-3.5 py-2.5 text-text">{u.roleLabel}</td>
                  <td className="px-3.5 py-2.5 text-text">{u.company.name}</td>
                  <td className="px-3.5 py-2.5">
                    <Badge tone={tone(u.status)}>{u.status}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-text-2">{u.lastActive ? new Date(u.lastActive).toLocaleDateString() : "—"}</td>
                  <td className="px-3.5 py-2.5 max-w-[160px] whitespace-nowrap">
                    <div className="flex items-center justify-start gap-1.5">
                      <Button variant="ghost" className="text-accent hover:bg-accent-dim hover:text-accent p-1.5" title="Manage user" onClick={() => handleEdit(u)}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        className={`text-danger hover:bg-danger-dim hover:text-danger p-1.5 ${currentUser?.id === u.id ? "opacity-30 cursor-not-allowed" : ""}`}
                        title="Delete user"
                        onClick={() => handleDelete(u.id)}
                        disabled={currentUser?.id === u.id}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                      <Button variant="ghost" className="text-warn hover:bg-warn-dim hover:text-warn p-1.5" title="Change password" onClick={() => openPasswordDialog(u.id)}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        )}
      </Card>
    </div>
  );
}