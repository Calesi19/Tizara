import { useState, useEffect } from "react";
import { Button, Spinner } from "@heroui/react";
import { useStudentAccommodations } from "../hooks/useStudentAccommodations";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Group } from "../types/group";
import type { Student } from "../types/student";
import type { StudentAccommodationsInput } from "../types/studentAccommodations";

interface AccommodationsPageProps {
  student: Student;
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onGoToStudentProfile: () => void;
}

const defaultForm: StudentAccommodationsInput = {
  desk_placement: false,
  extended_time: false,
  shorter_assignments: false,
  use_abacus: false,
  simple_instructions: false,
  visual_examples: false,
};

function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none group">
      <div
        className={`size-5 rounded flex items-center justify-center border transition-colors ${
          checked
            ? "bg-accent border-accent"
            : "border-border bg-background group-hover:border-accent/50"
        }`}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline
              points="2 6 5 9 10 3"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

export function AccommodationsPage({
  student,
  group,
  onGoToGroups,
  onGoToStudents,
  onGoToStudentProfile,
}: AccommodationsPageProps) {
  const { data, loading, error, save } = useStudentAccommodations(student.id);
  const [form, setForm] = useState<StudentAccommodationsInput>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        desk_placement: data.desk_placement === 1,
        extended_time: data.extended_time === 1,
        shorter_assignments: data.shorter_assignments === 1,
        use_abacus: data.use_abacus === 1,
        simple_instructions: data.simple_instructions === 1,
        visual_examples: data.visual_examples === 1,
      });
    }
  }, [data]);

  const handleSave = async () => {
    setSubmitting(true);
    setSaveError(null);
    try {
      await save(form);
      onGoToStudentProfile();
    } catch (e) {
      setSaveError(String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <Breadcrumb
        items={[
          { label: "Groups", onClick: onGoToGroups },
          { label: group.name, onClick: onGoToStudents },
          { label: student.name, onClick: onGoToStudentProfile },
          { label: "Accommodations" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Accommodations</h2>
          <p className="text-sm text-muted">{student.name}</p>
        </div>
        <Button variant="primary" size="sm" onPress={handleSave} isDisabled={submitting}>
          {submitting ? <Spinner size="sm" /> : "Save"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="accent" />
        </div>
      ) : error ? (
        <div role="alert" className="rounded-lg bg-danger/10 text-danger px-4 py-3 text-sm">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-lg">
          <p className="text-sm text-muted">Select all accommodations that apply to this student.</p>
          <div className="flex flex-col gap-3">
            <CheckItem
              label="Desk placement (Ubicación de pupitre)"
              checked={form.desk_placement}
              onChange={(v) => setForm((f) => ({ ...f, desk_placement: v }))}
            />
            <CheckItem
              label="Extended time (Tiempo y medio)"
              checked={form.extended_time}
              onChange={(v) => setForm((f) => ({ ...f, extended_time: v }))}
            />
            <CheckItem
              label="Shorter assignments (Tareas más cortas)"
              checked={form.shorter_assignments}
              onChange={(v) => setForm((f) => ({ ...f, shorter_assignments: v }))}
            />
            <CheckItem
              label="Use of an abacus (Ábaco)"
              checked={form.use_abacus}
              onChange={(v) => setForm((f) => ({ ...f, use_abacus: v }))}
            />
            <CheckItem
              label="Simple instructions (Instrucciones sencillas)"
              checked={form.simple_instructions}
              onChange={(v) => setForm((f) => ({ ...f, simple_instructions: v }))}
            />
            <CheckItem
              label="Visual examples (Proveer ejemplos visuales)"
              checked={form.visual_examples}
              onChange={(v) => setForm((f) => ({ ...f, visual_examples: v }))}
            />
          </div>

          {saveError && (
            <p className="text-danger text-sm">{saveError}</p>
          )}
        </div>
      )}
    </div>
  );
}
