"use client";

import { useState, useEffect } from "react";
import { Card, DataTable, PageHeader, Badge, PanelHeader, Button, Dialog } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Aircraft } from "@/lib/api";
import type { Role } from "@/lib/types";

function statusTone(status: string): "success" | "warn" | "danger" | "info" {
  if (status === "active") return "success";
  if (status === "maintenance") return "warn";
  if (status === "retired" || status === "grounded") return "danger";
  return "info";
}

export function Fleet({ role }: { role: Role }) {
  const { aircraft, loading, fetchAircraft, createAircraft, updateAircraft, deleteAircraft } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [filteredAircraft, setFilteredAircraft] = useState<Aircraft[]>([]);
  
  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    registration: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    year: "",
    status: "active",
    companyId: "",
  });
  
  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);
  const [editForm, setEditForm] = useState({
    registration: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    year: "",
    status: "active",
  });

  // Get companies for dropdown
  const { companies } = useStore();

  useEffect(() => {
    fetchAircraft();
  }, [fetchAircraft]);

  useEffect(() => {
    if (role === "operator") {
      // For operators, filter to their company's aircraft
      // In a real app, this would be based on the current user's company
      setFilteredAircraft(aircraft.filter((a) => a.company.name === "Kenya Airways"));
    } else {
      setFilteredAircraft(aircraft);
    }
  }, [aircraft, role]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    try {
      await createAircraft({
        registration: createForm.registration.trim().toUpperCase(),
        manufacturer: createForm.manufacturer.trim(),
        model: createForm.model.trim(),
        serialNumber: createForm.serialNumber.trim() || undefined,
        year: createForm.year ? parseInt(createForm.year) : undefined,
        status: createForm.status,
        companyId: createForm.companyId,
      });
      setCreateOpen(false);
      setCreateForm({ registration: "", manufacturer: "", model: "", serialNumber: "", year: "", status: "active", companyId: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create aircraft");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (aircraft: Aircraft) => {
    setEditingAircraft(aircraft);
    setEditForm({
      registration: aircraft.registration,
      manufacturer: aircraft.manufacturer,
      model: aircraft.model,
      serialNumber: aircraft.serialNumber || "",
      year: aircraft.year?.toString() || "",
      status: aircraft.status,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAircraft) return;
    setEditLoading(true);
    setError(null);
    try {
      await updateAircraft(editingAircraft.id, {
        registration: editForm.registration.trim().toUpperCase(),
        manufacturer: editForm.manufacturer.trim(),
        model: editForm.model.trim(),
        serialNumber: editForm.serialNumber.trim() || undefined,
        year: editForm.year ? parseInt(editForm.year) : undefined,
        status: editForm.status,
      });
      setEditOpen(false);
      setEditingAircraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update aircraft");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (aircraftId: string) => {
    if (!confirm("Are you sure you want to delete this aircraft?")) return;
    setError(null);
    try {
      await deleteAircraft(aircraftId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete aircraft");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Fleet Register"
        subtitle={
          role === "operator"
            ? "Aircraft operated by your organisation"
            : "Aircraft under management across all client operators"
        }
        action={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            New Aircraft
          </Button>
        }
      />

      {/* Create Aircraft Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Aircraft"
        description="Enter aircraft details"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Registration</label>
              <input
                value={createForm.registration}
                onChange={(e) => setCreateForm({ ...createForm, registration: e.target.value })}
                placeholder="e.g., 5Y-KQA"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Manufacturer</label>
              <input
                value={createForm.manufacturer}
                onChange={(e) => setCreateForm({ ...createForm, manufacturer: e.target.value })}
                placeholder="e.g., Boeing"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Model</label>
              <input
                value={createForm.model}
                onChange={(e) => setCreateForm({ ...createForm, model: e.target.value })}
                placeholder="e.g., 737-800"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Serial Number</label>
              <input
                value={createForm.serialNumber}
                onChange={(e) => setCreateForm({ ...createForm, serialNumber: e.target.value })}
                placeholder="Optional"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Year</label>
              <input
                type="number"
                value={createForm.year}
                onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })}
                placeholder="e.g., 2015"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Company</label>
              <select
                value={createForm.companyId}
                onChange={(e) => setCreateForm({ ...createForm, companyId: e.target.value })}
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={createLoading}>
              {createLoading ? "Adding..." : "Add Aircraft"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Aircraft Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingAircraft(null); }}
        title="Edit Aircraft"
        description="Update aircraft details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Registration</label>
              <input
                value={editForm.registration}
                onChange={(e) => setEditForm({ ...editForm, registration: e.target.value })}
                placeholder="e.g., 5Y-KQA"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Manufacturer</label>
              <input
                value={editForm.manufacturer}
                onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
                placeholder="e.g., Boeing"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Model</label>
              <input
                value={editForm.model}
                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                placeholder="e.g., 737-800"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Serial Number</label>
              <input
                value={editForm.serialNumber}
                onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
                placeholder="Optional"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Year</label>
              <input
                type="number"
                value={editForm.year}
                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                placeholder="e.g., 2015"
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[12.5px] text-text outline-none focus:border-accent"
                required
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setEditOpen(false); setEditingAircraft(null); }}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Card>
        <PanelHeader title={`${filteredAircraft.length} Aircraft`} />
        {error && <div className="p-3 text-danger text-sm">{error}</div>}
        {loading.aircraft ? (
          <div className="p-8 text-center text-text-2">Loading aircraft...</div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={["Registration", "Manufacturer", "Model", "Serial", "Year", "Company", "Status", "Actions"]}
            >
              {filteredAircraft.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-none hover:bg-bg-hover">
                  <td className="px-3.5 py-2.5 font-mono text-[12px] font-bold tracking-wide text-accent">{a.registration}</td>
                  <td className="px-3.5 py-2.5 text-text">{a.manufacturer}</td>
                  <td className="px-3.5 py-2.5 text-text">{a.model}</td>
                  <td className="px-3.5 py-2.5 text-text-2">{a.serialNumber || "—"}</td>
                  <td className="px-3.5 py-2.5 text-text">{a.year || "—"}</td>
                  <td className="px-3.5 py-2.5 text-text">{a.company.name}</td>
                  <td className="px-3.5 py-2.5">
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <Button variant="ghost" className="text-accent hover:bg-accent-dim hover:text-accent p-1.5" title="Edit aircraft" onClick={() => handleEdit(a)}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" className="text-danger hover:bg-danger-dim hover:text-danger p-1.5" title="Delete aircraft" onClick={() => handleDelete(a.id)}>
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