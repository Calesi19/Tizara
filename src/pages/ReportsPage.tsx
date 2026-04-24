import { useState, useEffect, useRef } from "react";
import { Button, Surface, Select, ListBox } from "@heroui/react";
import { FileText, FolderOpen, CheckCircle, AlertCircle } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { PdfDocument } from "../reports/PdfDocument";
import { StudentRosterSection } from "../reports/sections/StudentRosterSection";
import { AttendanceSummarySection } from "../reports/sections/AttendanceSummarySection";
import { GradeSummarySection } from "../reports/sections/GradeSummarySection";
import {
  fetchStudentsForReport,
  fetchAttendanceSummary,
  fetchGradeSummary,
  fetchDistinctPeriods,
} from "../reports/fetchGroupReportData";
import type { Group } from "../types/group";

const REPORTS_FOLDER_KEY = "tizara-reports-folder";
const PREVIEW_DEBOUNCE_MS = 700;

type SectionId = "roster" | "attendance" | "grades";

interface ReportsPageProps {
  group: Group;
}

export function ReportsPage({ group }: ReportsPageProps) {
  const folder = localStorage.getItem(REPORTS_FOLDER_KEY);

  const [sections, setSections] = useState<Set<SectionId>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [gradesPeriod, setGradesPeriod] = useState("");
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Live preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setResult(null);
    fetchDistinctPeriods(group.id).then(setAvailablePeriods).catch(() => {});
  }, [group.id]);

  // Revoke blob URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  // Debounced preview: fetch data → build document → generate blob URL
  useEffect(() => {
    if (sections.size === 0) {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
      setPreviewUrl(null);
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const [students, attendanceRows, gradeData] = await Promise.all([
          sections.has("roster") ? fetchStudentsForReport(group.id) : Promise.resolve(null),
          sections.has("attendance")
            ? fetchAttendanceSummary(group.id, dateFrom || undefined, dateTo || undefined)
            : Promise.resolve(null),
          sections.has("grades")
            ? fetchGradeSummary(group.id, gradesPeriod || undefined)
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        const doc = (
          <PdfDocument
            title="Group Report"
            groupName={group.name}
            schoolName={group.school_name}
            generatedDate={new Date().toLocaleDateString()}
          >
            {students ? <StudentRosterSection students={students} /> : null}
            {attendanceRows ? (
              <AttendanceSummarySection
                rows={attendanceRows}
                dateFrom={dateFrom || undefined}
                dateTo={dateTo || undefined}
              />
            ) : null}
            {gradeData ? (
              <GradeSummarySection
                assignments={gradeData}
                periodFilter={gradesPeriod || undefined}
              />
            ) : null}
          </PdfDocument>
        );

        const blob = await pdf(doc).toBlob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = url;
        setPreviewUrl(url);
      } catch {
        // preview errors are silent — generation errors show on the Generate button
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sections, dateFrom, dateTo, gradesPeriod, group.id, group.name, group.school_name]);

  function toggleSection(id: SectionId, on: boolean) {
    setSections((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  }

  async function handleGenerate() {
    if (!folder || sections.size === 0) return;
    setGenerating(true);
    setResult(null);

    try {
      const [students, attendanceRows, gradeData] = await Promise.all([
        sections.has("roster") ? fetchStudentsForReport(group.id) : Promise.resolve(null),
        sections.has("attendance")
          ? fetchAttendanceSummary(group.id, dateFrom || undefined, dateTo || undefined)
          : Promise.resolve(null),
        sections.has("grades")
          ? fetchGradeSummary(group.id, gradesPeriod || undefined)
          : Promise.resolve(null),
      ]);

      const doc = (
        <PdfDocument
          title="Group Report"
          groupName={group.name}
          schoolName={group.school_name}
          generatedDate={new Date().toLocaleDateString()}
        >
          {students ? <StudentRosterSection students={students} /> : null}
          {attendanceRows ? (
            <AttendanceSummarySection
              rows={attendanceRows}
              dateFrom={dateFrom || undefined}
              dateTo={dateTo || undefined}
            />
          ) : null}
          {gradeData ? (
            <GradeSummarySection
              assignments={gradeData}
              periodFilter={gradesPeriod || undefined}
            />
          ) : null}
        </PdfDocument>
      );

      const blob = await pdf(doc).toBlob();
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const base64 = btoa(Array.from(bytes).map((b) => String.fromCharCode(b)).join(""));

      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const safeName = group.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const filename = `tizara-report-${safeName}-${ts}.pdf`;
      const filePath = await join(folder, filename);

      await invoke("write_pdf", { path: filePath, dataBase64: base64 });
      setResult({ ok: true, message: `Saved to ${filePath}` });
    } catch (err) {
      setResult({ ok: false, message: String(err) });
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = !!folder && sections.size > 0 && !generating;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText size={22} />
          Reports
        </h2>
        <p className="text-sm text-muted mt-0.5">
          Generate PDF reports for your group or individual students.
        </p>

        {!folder && (
          <div className="flex items-start gap-2 mt-3 text-sm text-foreground/60">
            <FolderOpen size={14} className="text-warning mt-0.5 shrink-0" />
            <span>
              No output folder set. Go to <strong>Settings → Files</strong> to configure one before saving.
            </span>
          </div>
        )}
      </div>

      {/* Split layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: controls */}
        <div className="w-88 shrink-0 border-r border-border flex flex-col overflow-y-auto">
          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wide">
              Group Report
            </p>

            <SectionToggle
              id="roster"
              label="Student Roster"
              description="All enrolled students with basic information."
              checked={sections.has("roster")}
              onChange={(v) => toggleSection("roster", v)}
            />

            <SectionToggle
              id="attendance"
              label="Attendance Summary"
              description="Per-student attendance counts across the group."
              checked={sections.has("attendance")}
              onChange={(v) => toggleSection("attendance", v)}
            >
              {sections.has("attendance") && (
                <div className="mt-2 flex flex-col gap-1.5">
                  <span className="text-xs text-foreground/50">Date range (optional)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="flex-1 text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                    />
                    <span className="text-xs text-foreground/40">–</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="flex-1 text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                    />
                  </div>
                </div>
              )}
            </SectionToggle>

            <SectionToggle
              id="grades"
              label="Grade Summary"
              description="Assignment scores for every student."
              checked={sections.has("grades")}
              onChange={(v) => toggleSection("grades", v)}
            >
              {sections.has("grades") && availablePeriods.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  <span className="text-xs text-foreground/50">Period (optional)</span>
                  <Select
                    aria-label="Period filter"
                    selectedKey={gradesPeriod || "__all__"}
                    onSelectionChange={(k) => setGradesPeriod(k === "__all__" ? "" : String(k))}
                    className="w-full"
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="__all__" textValue="All periods">All periods</ListBox.Item>
                        {availablePeriods.map((p) => (
                          <ListBox.Item key={p} id={p} textValue={p}>{p}</ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              )}
            </SectionToggle>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="primary"
                fullWidth
                isDisabled={!canGenerate}
                onPress={handleGenerate}
              >
                {generating ? "Saving…" : "Save to Folder"}
              </Button>
              {sections.size === 0 && (
                <p className="text-xs text-center text-foreground/30">
                  Select at least one section.
                </p>
              )}
              {!folder && sections.size > 0 && (
                <p className="text-xs text-center text-foreground/30">
                  Configure output folder in Settings.
                </p>
              )}
            </div>

            {result && (
              <Surface
                className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  result.ok ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
                }`}
              >
                {result.ok ? (
                  <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-danger mt-0.5 shrink-0" />
                )}
                <p className="break-all text-xs leading-relaxed">{result.message}</p>
              </Surface>
            )}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-foreground/[0.03]">
          {/* Preview toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background shrink-0">
            <span className="text-xs font-medium text-foreground/40 uppercase tracking-wide">
              Preview
            </span>
            {previewLoading && (
              <span className="flex items-center gap-1.5 text-xs text-foreground/40">
                <span className="w-3 h-3 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
                Updating…
              </span>
            )}
          </div>

          {/* Preview area */}
          <div className="flex-1 relative">
            {previewUrl && (
              <iframe
                key={previewUrl}
                src={previewUrl}
                className="absolute inset-0 w-full h-full border-0"
                title="PDF Preview"
              />
            )}

            {!previewUrl && !previewLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground/20">
                <FileText size={48} strokeWidth={1} />
                <p className="text-sm">Select sections to see a preview</p>
              </div>
            )}

            {previewLoading && !previewUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground/30">
                <span className="w-8 h-8 border-2 border-foreground/10 border-t-foreground/40 rounded-full animate-spin" />
                <p className="text-sm">Building preview…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SectionToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}

function SectionToggle({ id, label, description, checked, onChange, children }: SectionToggleProps) {
  return (
    <Surface
      className={`px-4 py-3 rounded-lg transition-all ${
        checked ? "ring-1 ring-accent/40" : "opacity-80"
      }`}
    >
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 accent-[var(--color-accent)]"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-foreground/50 mt-0.5">{description}</p>
          {children}
        </div>
      </label>
    </Surface>
  );
}
