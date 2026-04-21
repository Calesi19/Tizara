import { useState, useEffect } from "react";
import { Button, Spinner } from "@heroui/react";
import { useStudentServices } from "../hooks/useStudentServices";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Group } from "../types/group";
import type { Student } from "../types/student";
import type { StudentServicesInput } from "../types/studentServices";

interface ServicesPageProps {
  student: Student;
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onGoToStudentProfile: () => void;
}

const defaultForm: StudentServicesInput = {
  has_special_education: false,
  therapy_speech: false,
  therapy_occupational: false,
  therapy_psychological: false,
  therapy_physical: false,
  medical_plan: "none",
  has_treatment: false,
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

export function ServicesPage({
  student,
  group,
  onGoToGroups,
  onGoToStudents,
  onGoToStudentProfile,
}: ServicesPageProps) {
  const { data, loading, error, save } = useStudentServices(student.id);
  const [form, setForm] = useState<StudentServicesInput>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        has_special_education: data.has_special_education === 1,
        therapy_speech: data.therapy_speech === 1,
        therapy_occupational: data.therapy_occupational === 1,
        therapy_psychological: data.therapy_psychological === 1,
        therapy_physical: data.therapy_physical === 1,
        medical_plan: data.medical_plan,
        has_treatment: data.has_treatment === 1,
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
          { label: "Status & Services" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Status & Services</h2>
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
        <div className="flex flex-col gap-6 max-w-lg">
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Special Education</h3>
            <CheckItem
              label="Has special education services"
              checked={form.has_special_education}
              onChange={(v) => setForm((f) => ({ ...f, has_special_education: v }))}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Therapies</h3>
            <CheckItem
              label="Speech and Language (HL)"
              checked={form.therapy_speech}
              onChange={(v) => setForm((f) => ({ ...f, therapy_speech: v }))}
            />
            <CheckItem
              label="Occupational (OCUP)"
              checked={form.therapy_occupational}
              onChange={(v) => setForm((f) => ({ ...f, therapy_occupational: v }))}
            />
            <CheckItem
              label="Psychological (PSIC)"
              checked={form.therapy_psychological}
              onChange={(v) => setForm((f) => ({ ...f, therapy_psychological: v }))}
            />
            <CheckItem
              label="Physical (FIS)"
              checked={form.therapy_physical}
              onChange={(v) => setForm((f) => ({ ...f, therapy_physical: v }))}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Medical Plan</h3>
            <div className="flex gap-2">
              {(["none", "private", "government"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, medical_plan: option }))}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    form.medical_plan === option
                      ? "bg-accent text-white"
                      : "bg-foreground/8 text-foreground/60 hover:bg-foreground/12"
                  }`}
                >
                  {option === "none" ? "None" : option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Treatment</h3>
            <CheckItem
              label="Currently receiving medical treatment"
              checked={form.has_treatment}
              onChange={(v) => setForm((f) => ({ ...f, has_treatment: v }))}
            />
          </section>

          {saveError && (
            <p className="text-danger text-sm">{saveError}</p>
          )}
        </div>
      )}
    </div>
  );
}
