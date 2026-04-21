import { useState, useEffect } from "react";
import { Button, Spinner } from "@heroui/react";
import { useStudentObservations } from "../hooks/useStudentObservations";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Group } from "../types/group";
import type { Student } from "../types/student";
import type { StudentObservationsInput } from "../types/studentObservations";

interface ObservationsPageProps {
  student: Student;
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onGoToStudentProfile: () => void;
}

const defaultForm: StudentObservationsInput = {
  obs_reading_writing: false,
  obs_mirror_numbers: false,
  obs_left_right_confusion: false,
  obs_sequence_difficulty: false,
  obs_disorganized_work: false,
  obs_inattention_detail: false,
  obs_sustained_attention: false,
  obs_doesnt_listen: false,
  obs_task_organization: false,
  obs_loses_belongings: false,
  obs_distracted_stimuli: false,
  obs_forgetful: false,
  obs_excess_hand_foot: false,
  obs_gets_up_from_seat: false,
  obs_running_jumping: false,
  obs_talks_excessively: false,
  obs_difficulty_quiet: false,
  obs_driven_by_motor: false,
  obs_impulsive_answers: false,
  obs_difficulty_waiting: false,
  obs_interrupts_others: false,
  obs_easily_angered: false,
  obs_argues: false,
  obs_defies_adults: false,
  obs_annoys_others: false,
  obs_aggressive: false,
  obs_spiteful: false,
  obs_blames_others: false,
  obs_breaks_property: false,
  obs_incomplete_homework: false,
  obs_frequent_absences: false,
  obs_neglected_appearance: false,
  obs_uses_profanity: false,
  obs_takes_belongings: false,
  obs_forgets_materials: false,
  obs_appears_sad: false,
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
        className={`size-5 shrink-0 rounded flex items-center justify-center border transition-colors ${
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

export function ObservationsPage({
  student,
  group,
  onGoToGroups,
  onGoToStudents,
  onGoToStudentProfile,
}: ObservationsPageProps) {
  const { data, loading, error, save } = useStudentObservations(student.id);
  const [form, setForm] = useState<StudentObservationsInput>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        obs_reading_writing: data.obs_reading_writing === 1,
        obs_mirror_numbers: data.obs_mirror_numbers === 1,
        obs_left_right_confusion: data.obs_left_right_confusion === 1,
        obs_sequence_difficulty: data.obs_sequence_difficulty === 1,
        obs_disorganized_work: data.obs_disorganized_work === 1,
        obs_inattention_detail: data.obs_inattention_detail === 1,
        obs_sustained_attention: data.obs_sustained_attention === 1,
        obs_doesnt_listen: data.obs_doesnt_listen === 1,
        obs_task_organization: data.obs_task_organization === 1,
        obs_loses_belongings: data.obs_loses_belongings === 1,
        obs_distracted_stimuli: data.obs_distracted_stimuli === 1,
        obs_forgetful: data.obs_forgetful === 1,
        obs_excess_hand_foot: data.obs_excess_hand_foot === 1,
        obs_gets_up_from_seat: data.obs_gets_up_from_seat === 1,
        obs_running_jumping: data.obs_running_jumping === 1,
        obs_talks_excessively: data.obs_talks_excessively === 1,
        obs_difficulty_quiet: data.obs_difficulty_quiet === 1,
        obs_driven_by_motor: data.obs_driven_by_motor === 1,
        obs_impulsive_answers: data.obs_impulsive_answers === 1,
        obs_difficulty_waiting: data.obs_difficulty_waiting === 1,
        obs_interrupts_others: data.obs_interrupts_others === 1,
        obs_easily_angered: data.obs_easily_angered === 1,
        obs_argues: data.obs_argues === 1,
        obs_defies_adults: data.obs_defies_adults === 1,
        obs_annoys_others: data.obs_annoys_others === 1,
        obs_aggressive: data.obs_aggressive === 1,
        obs_spiteful: data.obs_spiteful === 1,
        obs_blames_others: data.obs_blames_others === 1,
        obs_breaks_property: data.obs_breaks_property === 1,
        obs_incomplete_homework: data.obs_incomplete_homework === 1,
        obs_frequent_absences: data.obs_frequent_absences === 1,
        obs_neglected_appearance: data.obs_neglected_appearance === 1,
        obs_uses_profanity: data.obs_uses_profanity === 1,
        obs_takes_belongings: data.obs_takes_belongings === 1,
        obs_forgets_materials: data.obs_forgets_materials === 1,
        obs_appears_sad: data.obs_appears_sad === 1,
      });
    }
  }, [data]);

  const set = (key: keyof StudentObservationsInput, v: boolean) =>
    setForm((f) => ({ ...f, [key]: v }));

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
          { label: "Observations" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Observations</h2>
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
        <div className="flex flex-col gap-8 max-w-lg">
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Learning & Dyslexia (Dislexia)</h3>
            <CheckItem label="Difficulty learning to read and write" checked={form.obs_reading_writing} onChange={(v) => set("obs_reading_writing", v)} />
            <CheckItem label="Writing numbers in mirror image or backward" checked={form.obs_mirror_numbers} onChange={(v) => set("obs_mirror_numbers", v)} />
            <CheckItem label="Difficulty distinguishing left from right" checked={form.obs_left_right_confusion} onChange={(v) => set("obs_left_right_confusion", v)} />
            <CheckItem label="Difficulty retaining sequences" checked={form.obs_sequence_difficulty} onChange={(v) => set("obs_sequence_difficulty", v)} />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Attention & Hyperactivity (ADD / ADHD)</h3>
            <CheckItem label="Disorganized in work" checked={form.obs_disorganized_work} onChange={(v) => set("obs_disorganized_work", v)} />
            <CheckItem label="Does not pay sufficient attention to detail" checked={form.obs_inattention_detail} onChange={(v) => set("obs_inattention_detail", v)} />
            <CheckItem label="Difficulty with sustained attention" checked={form.obs_sustained_attention} onChange={(v) => set("obs_sustained_attention", v)} />
            <CheckItem label="Does not seem to listen when spoken to directly" checked={form.obs_doesnt_listen} onChange={(v) => set("obs_doesnt_listen", v)} />
            <CheckItem label="Difficulty organizing tasks or activities" checked={form.obs_task_organization} onChange={(v) => set("obs_task_organization", v)} />
            <CheckItem label="Loses belongings easily" checked={form.obs_loses_belongings} onChange={(v) => set("obs_loses_belongings", v)} />
            <CheckItem label="Distracted by irrelevant stimuli" checked={form.obs_distracted_stimuli} onChange={(v) => set("obs_distracted_stimuli", v)} />
            <CheckItem label="Forgetful" checked={form.obs_forgetful} onChange={(v) => set("obs_forgetful", v)} />
            <CheckItem label="Excessive movement of hands and feet" checked={form.obs_excess_hand_foot} onChange={(v) => set("obs_excess_hand_foot", v)} />
            <CheckItem label="Constantly getting up from seat" checked={form.obs_gets_up_from_seat} onChange={(v) => set("obs_gets_up_from_seat", v)} />
            <CheckItem label="Running or jumping in inappropriate situations" checked={form.obs_running_jumping} onChange={(v) => set("obs_running_jumping", v)} />
            <CheckItem label="Talking excessively" checked={form.obs_talks_excessively} onChange={(v) => set("obs_talks_excessively", v)} />
            <CheckItem label="Difficulty engaging in quiet or passive activities" checked={form.obs_difficulty_quiet} onChange={(v) => set("obs_difficulty_quiet", v)} />
            <CheckItem label='Acting as if "driven by a motor"' checked={form.obs_driven_by_motor} onChange={(v) => set("obs_driven_by_motor", v)} />
            <CheckItem label="Answering questions impulsively or prematurely" checked={form.obs_impulsive_answers} onChange={(v) => set("obs_impulsive_answers", v)} />
            <CheckItem label="Difficulty waiting in lines" checked={form.obs_difficulty_waiting} onChange={(v) => set("obs_difficulty_waiting", v)} />
            <CheckItem label="Interrupting or intruding on others' activities" checked={form.obs_interrupts_others} onChange={(v) => set("obs_interrupts_others", v)} />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Social & Oppositional (Oposicional / Social)</h3>
            <CheckItem label="Easily angered" checked={form.obs_easily_angered} onChange={(v) => set("obs_easily_angered", v)} />
            <CheckItem label="Argues with friends and adults" checked={form.obs_argues} onChange={(v) => set("obs_argues", v)} />
            <CheckItem label="Defies adults and fails to obey" checked={form.obs_defies_adults} onChange={(v) => set("obs_defies_adults", v)} />
            <CheckItem label="Deliberately annoys other people" checked={form.obs_annoys_others} onChange={(v) => set("obs_annoys_others", v)} />
            <CheckItem label="Aggressive behavior" checked={form.obs_aggressive} onChange={(v) => set("obs_aggressive", v)} />
            <CheckItem label="Spiteful or vindictive" checked={form.obs_spiteful} onChange={(v) => set("obs_spiteful", v)} />
            <CheckItem label="Blames others for their own mistakes" checked={form.obs_blames_others} onChange={(v) => set("obs_blames_others", v)} />
            <CheckItem label="Breaks others' property" checked={form.obs_breaks_property} onChange={(v) => set("obs_breaks_property", v)} />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Other Indicators</h3>
            <CheckItem label="Does not complete home assignments" checked={form.obs_incomplete_homework} onChange={(v) => set("obs_incomplete_homework", v)} />
            <CheckItem label="Frequent absences or pattern of tardiness" checked={form.obs_frequent_absences} onChange={(v) => set("obs_frequent_absences", v)} />
            <CheckItem label="Neglected appearance and poor eating habits" checked={form.obs_neglected_appearance} onChange={(v) => set("obs_neglected_appearance", v)} />
            <CheckItem label="Use of profanity" checked={form.obs_uses_profanity} onChange={(v) => set("obs_uses_profanity", v)} />
            <CheckItem label="Taking things that belong to others" checked={form.obs_takes_belongings} onChange={(v) => set("obs_takes_belongings", v)} />
            <CheckItem label="Failure to bring work materials" checked={form.obs_forgets_materials} onChange={(v) => set("obs_forgets_materials", v)} />
            <CheckItem label="Appearing sad most of the time" checked={form.obs_appears_sad} onChange={(v) => set("obs_appears_sad", v)} />
          </section>

          {saveError && (
            <p className="text-danger text-sm">{saveError}</p>
          )}
        </div>
      )}
    </div>
  );
}
