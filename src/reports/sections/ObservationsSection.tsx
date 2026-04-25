import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StudentObservations } from "../../types/studentObservations";

const S = StyleSheet.create({
  section: { marginBottom: 28 },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#1a202c",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e0",
  },
  groups: { flexDirection: "row", gap: 12 },
  group: { flex: 1 },
  groupTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#374151",
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  item: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  check: { fontSize: 9, width: 13, color: "#15803d" },
  cross: { fontSize: 9, width: 13, color: "#94a3b8" },
  label: { fontSize: 7.5, color: "#374151", flex: 1, lineHeight: 1.3 },
  noData: { fontSize: 8.5, color: "#94a3b8" },
});

type ObsKey = keyof Omit<StudentObservations, "id" | "student_id">;

interface ObsItem { key: ObsKey; label: string }

const DYSLEXIA: ObsItem[] = [
  { key: "obs_reading_writing", label: "Difficulty with reading and writing" },
  { key: "obs_mirror_numbers", label: "Mirrors numbers or letters" },
  { key: "obs_left_right_confusion", label: "Left-right confusion" },
  { key: "obs_sequence_difficulty", label: "Difficulty with sequences" },
  { key: "obs_disorganized_work", label: "Disorganized work" },
  { key: "obs_inattention_detail", label: "Inattention to detail" },
];

const ADHD: ObsItem[] = [
  { key: "obs_sustained_attention", label: "Difficulty sustaining attention" },
  { key: "obs_doesnt_listen", label: "Does not listen when spoken to" },
  { key: "obs_task_organization", label: "Difficulty organizing tasks" },
  { key: "obs_loses_belongings", label: "Loses belongings frequently" },
  { key: "obs_distracted_stimuli", label: "Easily distracted by stimuli" },
  { key: "obs_forgetful", label: "Forgetful in daily activities" },
  { key: "obs_excess_hand_foot", label: "Excess hand or foot movement" },
  { key: "obs_gets_up_from_seat", label: "Gets up from seat unexpectedly" },
  { key: "obs_running_jumping", label: "Runs or jumps inappropriately" },
  { key: "obs_talks_excessively", label: "Talks excessively" },
  { key: "obs_difficulty_quiet", label: "Difficulty engaging quietly" },
  { key: "obs_driven_by_motor", label: "Acts as if driven by a motor" },
];

const ODD: ObsItem[] = [
  { key: "obs_impulsive_answers", label: "Blurts out impulsive answers" },
  { key: "obs_difficulty_waiting", label: "Difficulty waiting their turn" },
  { key: "obs_interrupts_others", label: "Interrupts or intrudes on others" },
  { key: "obs_easily_angered", label: "Easily angered or loses temper" },
  { key: "obs_argues", label: "Argues frequently" },
  { key: "obs_defies_adults", label: "Defies or refuses adult requests" },
  { key: "obs_annoys_others", label: "Deliberately annoys others" },
  { key: "obs_aggressive", label: "Physically aggressive" },
  { key: "obs_spiteful", label: "Spiteful or vindictive" },
  { key: "obs_blames_others", label: "Blames others for mistakes" },
  { key: "obs_breaks_property", label: "Breaks or damages property" },
  { key: "obs_incomplete_homework", label: "Frequently incomplete homework" },
  { key: "obs_frequent_absences", label: "Frequent absences" },
  { key: "obs_neglected_appearance", label: "Neglected personal appearance" },
  { key: "obs_uses_profanity", label: "Uses profanity" },
  { key: "obs_takes_belongings", label: "Takes others' belongings" },
  { key: "obs_forgets_materials", label: "Forgets materials or supplies" },
  { key: "obs_appears_sad", label: "Appears sad or withdrawn" },
];

function ObsGroup({ title, items, obs }: { title: string; items: ObsItem[]; obs: StudentObservations }) {
  return (
    <View style={S.group}>
      <Text style={S.groupTitle}>{title}</Text>
      {items.map((item) => {
        const on = !!obs[item.key];
        return (
          <View key={item.key} style={S.item}>
            <Text style={on ? S.check : S.cross}>{on ? "✓" : "○"}</Text>
            <Text style={S.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

interface Props {
  observations: StudentObservations | null;
}

export function ObservationsSection({ observations }: Props) {
  if (!observations) {
    return (
      <View style={S.section}>
        <Text style={S.title}>Behavioral Observations</Text>
        <Text style={S.noData}>No observations recorded.</Text>
      </View>
    );
  }

  return (
    <View style={S.section}>
      <Text style={S.title}>Behavioral Observations</Text>
      <View style={S.groups}>
        <ObsGroup title="Learning / Dyslexia" items={DYSLEXIA} obs={observations} />
        <ObsGroup title="Attention / Hyperactivity" items={ADHD} obs={observations} />
        <ObsGroup title="Social / Oppositional" items={ODD} obs={observations} />
      </View>
    </View>
  );
}
