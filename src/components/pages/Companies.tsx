"use client";

import { useState, useEffect } from "react";
import { Card, PageHeader, Badge, PanelHeader, Button, DataTable, Dialog } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Company } from "@/lib/api";

function getTypeLabel(type: "INSURER_OPS" | "OPERATOR") {
  return type === "INSURER_OPS" ? "Insurer Ops" : "Operator";
}

function getTypeBadgeTone(type: "INSURER_OPS" | "OPERATOR") {
  return type === "INSURER_OPS" ? "info" : "success";
}

export function Companies() {
  const { companies, countries, loading, fetchCompanies, fetchCountries, createCompany, updateCompany, deleteCompany } = useStore();
  const [error, setError] = useState<string | null>(null);
  
  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ 
    name: "", 
    type: "OPERATOR" as "INSURER_OPS" | "OPERATOR",
    country: "",
  });
  
  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editForm, setEditForm] = useState({ 
    name: "",
    type: "OPERATOR" as "INSURER_OPS" | "OPERATOR",
    country: "",
  });

  useEffect(() => {
    fetchCompanies();
    fetchCountries();
  }, [fetchCompanies, fetchCountries]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    try {
      await createCompany({ 
        name: createForm.name.trim(),
        type: createForm.type,
        country: createForm.country,
      });
      setCreateOpen(false);
      setCreateForm({ name: "", type: "OPERATOR", country: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setEditForm({ 
      name: company.name,
      type: company.type,
      country: company.country,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    setEditLoading(true);
    setError(null);
    try {
      await updateCompany(editingCompany.id, { 
        name: editForm.name.trim(),
        type: editForm.type,
        country: editForm.country,
      });
      setEditOpen(false);
      setEditingCompany(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update company");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm("Are you sure you want to delete this company? This will also remove all associated users and aircraft.")) return;
    setError(null);
    try {
      await deleteCompany(companyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete company");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Companies"
        subtitle="Insurer and operator organisations on the platform, with linked users and aircraft"
        action={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add Company
          </Button>
        }
      />

      {/* Create Company Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Company"
        description="Enter the company details"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-text-2 mb-1">Company Name</label>
            <input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g., Kenya Airways"
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-2 mb-1">Type</label>
            <select
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as "INSURER_OPS" | "OPERATOR" })}
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              required
            >
              <option value="INSURER_OPS">Insurer Ops</option>
              <option value="OPERATOR">Operator</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-2 mb-1">Country</label>
            <select
              value={createForm.country}
              onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              required
            >
              <option value="">Select country</option>
              {useStore.getState().countries.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={createLoading}>
              {createLoading ? "Creating..." : "Add Company"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingCompany(null); }}
        title="Edit Company"
        description="Update company details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-text-2 mb-1">Company Name</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Company name"
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-2 mb-1">Type</label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value as "INSURER_OPS" | "OPERATOR" })}
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              required
            >
              <option value="INSURER_OPS">Insurer Ops</option>
              <option value="OPERATOR">Operator</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-2 mb-1">Country</label>
            <select
              value={editForm.country}
              onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              required
            >
              <option value="">Select country</option>
              {useStore.getState().countries.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setEditOpen(false); setEditingCompany(null); }}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Card>
        <PanelHeader title={`${companies.length} Companies`} />
        {error && <div className="p-3 text-danger text-sm">{error}</div>}
        {loading.companies ? (
          <div className="p-8 text-center text-text-2">Loading companies...</div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable columns={["Company", "Type", "Country", "Linked Users", "Aircraft", "Status", "Actions"]}>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-none hover:bg-bg-hover">
                  <td className="px-3.5 py-2.5 font-semibold text-text">{c.name}</td>
                  <td className="px-3.5 py-2.5 text-text">
                    <Badge tone={getTypeBadgeTone(c.type)}>{getTypeLabel(c.type)}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-text-2">{c.country}</td>
                  <td className="px-3.5 py-2.5 text-text">{c._count?.users ?? 0}</td>
                  <td className="px-3.5 py-2.5 text-text">{c._count?.aircraft ?? 0}</td>
                  <td className="px-3.5 py-2.5">
                    <Badge tone="success">active</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <Button variant="ghost" className="text-accent hover:bg-accent-dim hover:text-accent p-1.5" title="Manage company" onClick={() => handleEdit(c)}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" className="text-danger hover:bg-danger-dim hover:text-danger p-1.5" title="Delete company" onClick={() => handleDelete(c.id)}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
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