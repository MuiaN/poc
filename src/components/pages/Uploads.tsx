"use client";

import { useState, useRef, useEffect, FormEvent, DragEvent, ChangeEvent } from "react";
import { PageHeader, Button, Card, PanelHeader, Badge } from "@/components/ui";
import { cn } from "@/components/ui";

type Role = "insurer" | "operator";

const INSURER_CATEGORIES = [
  { key: "certificates", label: "Certificates", count: 2 },
  { key: "loss_runs", label: "Loss Runs", count: 1 },
  { key: "surveys", label: "Surveys", count: 1 },
  { key: "submissions", label: "Submissions", count: 1 },
  { key: "evidence", label: "Evidence", count: 1 },
];

const OPERATOR_CATEGORIES = [
  { key: "flight_ops", label: "Flight Ops", count: 0 },
  { key: "crew_docs", label: "Crew Documents", count: 0 },
  { key: "permits", label: "Permits", count: 0 },
  { key: "safety", label: "Safety Records", count: 0 },
];

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  date: string;
  status: "verified" | "pending" | "draft";
  category: string;
}

const MOCK_FILES: UploadedFile[] = [
  { id: "1", name: "KQ_Fleet_Insurance_Cert_2026.pdf", type: "pdf", size: "1.2 MB", uploadedBy: "A. Mwangi", date: "2026-06-28", status: "verified", category: "certificates" },
  { id: "2", name: "ET_Loss_Run_Q2_2026.xlsx", type: "xls", size: "384 KB", uploadedBy: "S. Bekele", date: "2026-06-21", status: "verified", category: "loss_runs" },
  { id: "3", name: "Fly540_Hull_Survey_Report.pdf", type: "pdf", size: "5.6 MB", uploadedBy: "J. Otieno", date: "2026-06-15", status: "pending", category: "surveys" },
  { id: "4", name: "RwandAir_Renewal_Submission.docx", type: "doc", size: "212 KB", uploadedBy: "P. Uwase", date: "2026-06-02", status: "verified", category: "submissions" },
  { id: "5", name: "Jubilee_Claim_CLM-2026-0037_Photos.zip", type: "other", size: "22.4 MB", uploadedBy: "A. Mwangi", date: "2026-05-27", status: "pending", category: "evidence" },
];

function getFileIcon(type: string) {
  const icons: Record<string, { label: string; className: string }> = {
    pdf: { label: "PDF", className: "up-file-ico pdf" },
    doc: { label: "DOC", className: "up-file-ico doc" },
    docx: { label: "DOC", className: "up-file-ico doc" },
    xls: { label: "XLS", className: "up-file-ico xls" },
    xlsx: { label: "XLS", className: "up-file-ico xls" },
    png: { label: "IMG", className: "up-file-ico img" },
    jpg: { label: "IMG", className: "up-file-ico img" },
    jpeg: { label: "IMG", className: "up-file-ico img" },
    other: { label: "···", className: "up-file-ico other" },
  };
  const ext = type.toLowerCase().replace(".", "");
  return icons[ext] || icons.other;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Uploads() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [files, setFiles] = useState<UploadedFile[]>(MOCK_FILES);
  const [dragOver, setDragOver] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentRole: Role = "insurer"; // TODO: get from auth context
  const categories = currentRole === "insurer" ? INSURER_CATEGORIES : OPERATOR_CATEGORIES;
  const subtitle = currentRole === "insurer"
    ? "Policy documents, claims files, fleet records & risk reports"
    : "Flight operations, crew documents, permits & safety records";

  const filteredFiles = activeCategory === "all"
    ? files
    : files.filter(f => f.category === activeCategory);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} exceeds 50 MB limit`);
        return;
      }
      setPendingFile(file);
      setShowCategoryModal(true);
    });
  };

  const confirmUpload = (category: string) => {
    if (!pendingFile) return;
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: pendingFile.name,
      type: pendingFile.name.split(".").pop()?.toLowerCase() || "other",
      size: formatFileSize(pendingFile.size),
      uploadedBy: "You",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      category,
    };
    setFiles(prev => [newFile, ...prev]);
    setPendingFile(null);
    setShowCategoryModal(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDropzoneClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    handleUploadClick();
  };

  return (
    <div className="up-content flex flex-col gap-4">
      {/* Header */}
      <div className="up-header flex items-start justify-between gap-4">
        <div>
          <div className="up-title text-[16px] font-bold text-text">Documents & Uploads</div>
          <div className="up-title-sub text-[12px] text-text-2 mt-1">{subtitle}</div>
        </div>
        <Button variant="primary" className="up-upload-btn flex items-center gap-2" onClick={handleUploadClick}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" className="flex-shrink-0">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload File
        </Button>
      </div>

      {/* Category tabs */}
      <div className="up-cats flex gap-[5px] flex-wrap">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "up-cat flex items-center gap-[5px] px-[13px] py-[5px] rounded-full text-[11.5px] font-medium transition-all whitespace-nowrap",
            activeCategory === "all"
              ? "bg-accent-dim border-accent text-accent font-bold"
              : "bg-bg-2 border border-border text-text-2 hover:border-accent hover:text-accent"
          )}
        >
          All
          <span className={cn("up-cat-count text-[10px] font-bold rounded-full px-[6px] py-[1px]", activeCategory === "all" ? "bg-white/20" : "bg-white/[0.08]")}>
            {files.length}
          </span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "up-cat flex items-center gap-[5px] px-[13px] py-[5px] rounded-full text-[11.5px] font-medium transition-all whitespace-nowrap",
              activeCategory === cat.key
                ? "bg-accent-dim border-accent text-accent font-bold"
                : "bg-bg-2 border border-border text-text-2 hover:border-accent hover:text-accent"
            )}
          >
            {cat.label}
            <span className={cn("up-cat-count text-[10px] font-bold rounded-full px-[6px] py-[1px]", activeCategory === cat.key ? "bg-white/20" : "bg-white/[0.08]")}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        ref={dropzoneRef}
        className={cn(
          "up-dropzone relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          dragOver
            ? "border-accent bg-accent-dim"
            : "border-border-2 bg-bg-2 hover:border-accent hover:bg-accent-dim"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="upFileInput"
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={handleFileInputChange}
        />
        <svg className="up-dz-ico w-9 h-9 mx-auto mb-2.5 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div className="up-dz-title text-[13px] font-semibold text-text-2 mb-1 transition-colors">
          {dragOver ? "Release to upload" : "Drop files here or click to upload"}
        </div>
        <div className="up-dz-sub text-[11px] text-text-3">
          PDF, DOCX, XLSX, PNG, JPG &nbsp;·&nbsp; Max 50 MB per file
        </div>
      </div>

      {/* File table */}
      <Card className="up-table-wrap overflow-hidden">
        <div className="up-table-hdr flex items-center justify-between px-4 py-3 border-b border-border bg-bg-3">
          <span className="up-table-hdr-title text-[10px] font-bold uppercase tracking-wider text-text-2">Uploaded Files</span>
          <span className="up-count-badge text-[11px] font-medium text-text-3">{filteredFiles.length} files</span>
        </div>
        <div className="divide-y divide-border">
          {filteredFiles.length === 0 ? (
            <div className="up-empty flex flex-col items-center justify-center py-12 px-6 gap-2 text-center">
              <svg className="up-empty-ico w-10 h-10 stroke-text-3 fill-none stroke-[1.2] opacity-50" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
              <div className="up-empty-title text-[13px] font-semibold text-text-2">No files yet</div>
              <div className="up-empty-sub text-[11.5px] text-text-3 max-w-xs leading-relaxed">
                Drag and drop files above or click "Upload File" to get started.
              </div>
            </div>
          ) : (
            <table className="up-table w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="px-[14px] py-[8px] text-left text-[10px] font-bold uppercase tracking-wider text-text-2 bg-bg-3 border-b border-border">File</th>
                  <th className="px-[14px] py-[8px] text-left text-[10px] font-bold uppercase tracking-wider text-text-2 bg-bg-3 border-b border-border">Type</th>
                  <th className="px-[14px] py-[8px] text-left text-[10px] font-bold uppercase tracking-wider text-text-2 bg-bg-3 border-b border-border">Size</th>
                  <th className="px-[14px] py-[8px] text-left text-[10px] font-bold uppercase tracking-wider text-text-2 bg-bg-3 border-b border-border">Uploaded By</th>
                  <th className="px-[14px] py-[8px] text-left text-[10px] font-bold uppercase tracking-wider text-text-2 bg-bg-3 border-b border-border">Date</th>
                  <th className="px-[14px] py-[8px] text-left text-[10px] font-bold uppercase tracking-wider text-text-2 bg-bg-3 border-b border-border">Status</th>
                  <th className="px-[14px] py-[8px] text-right text-[10px] font-bold uppercase tracking-wider text-text-2 bg-bg-3 border-b border-border">Actions</th>
                </tr>
              </thead>
              <tbody id="upTableBody">
                {filteredFiles.map((f, i) => {
                  const icon = getFileIcon(f.type);
                  return (
                    <tr key={f.id} className="hover:bg-bg-hover">
                      <td className="px-[14px] py-[10px] border-b border-border text-text align-middle">
                        <div className="flex items-center gap-3">
                          <span className={cn("up-file-ico w-[30px] h-[30px] rounded-[6px] flex items-center justify-center text-[9px] font-extrabold tracking-tighter flex-shrink-0", icon.className)}>
                            {icon.label}
                          </span>
                          <div>
                            <div className="up-fname font-medium text-text leading-snug">{f.name}</div>
                            <div className="up-fnote text-[10.5px] text-text-3 mt-0.5">{f.category.replace("_", " ")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[14px] py-[10px] border-b border-border text-text-2 text-[11px] capitalize align-middle">{f.type.toUpperCase()}</td>
                      <td className="px-[14px] py-[10px] border-b border-border text-text font-mono text-[11px] align-middle">{f.size}</td>
                      <td className="px-[14px] py-[10px] border-b border-border text-text-2 text-[11px] align-middle">{f.uploadedBy}</td>
                      <td className="px-[14px] py-[10px] border-b border-border text-text-2 text-[11px] align-middle">{f.date}</td>
                      <td className="px-[14px] py-[10px] border-b border-border align-middle">
                        <Badge tone={f.status === "verified" ? "success" : f.status === "pending" ? "warn" : "neutral"}>
                          {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-[14px] py-[10px] border-b border-border text-right align-middle">
                        <div className="up-actions flex items-center justify-end gap-2">
                          <button
                            className="up-act-btn w-[26px] h-[26px] rounded-[5px] border border-border bg-transparent flex items-center justify-center text-text-2 hover:border-accent hover:text-accent hover:bg-accent-dim transition-all"
                            title="Download"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </button>
                          <button
                            className="up-act-btn del w-[26px] h-[26px] rounded-[5px] border border-border bg-transparent flex items-center justify-center text-text-2 hover:border-danger hover:text-danger hover:bg-danger-dim transition-all"
                            title="Delete"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Category picker modal */}
      {showCategoryModal && pendingFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55"
          onClick={() => { setShowCategoryModal(false); setPendingFile(null); }}
        >
          <div className="bg-bg-2 border border-border-2 rounded-xl w-full max-w-md overflow-hidden box-shadow:0_20px_60px_rgba(0,0,0,.5)" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-border">
              <div className="text-[14px] font-bold text-text mb-1">Select a Category</div>
              <div id="upPickerMeta" className="text-[11px] text-text-3">
                {pendingFile.name} · {formatFileSize(pendingFile.size)}
              </div>
            </div>
            <div id="upPickerCatList" className="p-4 grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => confirmUpload(cat.key)}
                  className="px-4 py-3 bg-bg-3 border border-border-2 rounded-lg text-left cursor-pointer hover:border-accent hover:bg-accent-dim hover:text-accent transition-all"
                >
                  <div className="font-medium text-text">{cat.label}</div>
                  <div className="text-[10px] text-text-3 mt-0.5">{cat.count} files</div>
                </button>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border text-right">
              <button
                onClick={() => { setShowCategoryModal(false); setPendingFile(null); }}
                className="px-4 py-2 border border-border-2 bg-transparent rounded-lg text-[12px] text-text-2 hover:border-accent hover:text-accent transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}