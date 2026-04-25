import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StudentObservations } from "../../types/studentObservations";
import { translations } from "../../i18n/translations";
import type { Language } from "../../i18n/translations";

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
  language: Language;
}

export function ObservationsSection({ observations, language }: Props) {
  const L = translations[language].reports.pdf;

  const DYSLEXIA: ObsItem[] = [
    { key: "obs_reading_writing", label: L.obsReadingWriting },
    { key: "obs_mirror_numbers", label: L.obsMirrorNumbers },
    { key: "obs_left_right_confusion", label: L.obsLeftRightConfusion },
    { key: "obs_sequence_difficulty", label: L.obsSequenceDifficulty },
    { key: "obs_disorganized_work", label: L.obsDisorganizedWork },
    { key: "obs_inattention_detail", label: L.obsInattentionDetail },
  ];

  const ADHD: ObsItem[] = [
    { key: "obs_sustained_attention", label: L.obsSustainedAttention },
    { key: "obs_doesnt_listen", label: L.obsDoesntListen },
    { key: "obs_task_organization", label: L.obsTaskOrganization },
    { key: "obs_loses_belongings", label: L.obsLosesBelongings },
    { key: "obs_distracted_stimuli", label: L.obsDistractedStimuli },
    { key: "obs_forgetful", label: L.obsForgetful },
    { key: "obs_excess_hand_foot", label: L.obsExcessHandFoot },
    { key: "obs_gets_up_from_seat", label: L.obsGetsUpFromSeat },
    { key: "obs_running_jumping", label: L.obsRunningJumping },
    { key: "obs_talks_excessively", label: L.obsTalksExcessively },
    { key: "obs_difficulty_quiet", label: L.obsDifficultyQuiet },
    { key: "obs_driven_by_motor", label: L.obsDrivenByMotor },
  ];

  const ODD: ObsItem[] = [
    { key: "obs_impulsive_answers", label: L.obsImpulsiveAnswers },
    { key: "obs_difficulty_waiting", label: L.obsDifficultyWaiting },
    { key: "obs_interrupts_others", label: L.obsInterruptsOthers },
    { key: "obs_easily_angered", label: L.obsEasilyAngered },
    { key: "obs_argues", label: L.obsArgues },
    { key: "obs_defies_adults", label: L.obsDefiesAdults },
    { key: "obs_annoys_others", label: L.obsAnnoysOthers },
    { key: "obs_aggressive", label: L.obsAggressive },
    { key: "obs_spiteful", label: L.obsSpiteful },
    { key: "obs_blames_others", label: L.obsBlamesOthers },
    { key: "obs_breaks_property", label: L.obsBreaksProperty },
    { key: "obs_incomplete_homework", label: L.obsIncompleteHomework },
    { key: "obs_frequent_absences", label: L.obsFrequentAbsences },
    { key: "obs_neglected_appearance", label: L.obsNeglectedAppearance },
    { key: "obs_uses_profanity", label: L.obsUsesProfanity },
    { key: "obs_takes_belongings", label: L.obsTakesBelongings },
    { key: "obs_forgets_materials", label: L.obsForgetsMaterials },
    { key: "obs_appears_sad", label: L.obsAppearsSad },
  ];

  if (!observations) {
    return (
      <View style={S.section}>
        <Text style={S.title}>{L.observations}</Text>
        <Text style={S.noData}>{L.noObservations}</Text>
      </View>
    );
  }

  return (
    <View style={S.section}>
      <Text style={S.title}>{L.observations}</Text>
      <View style={S.groups}>
        <ObsGroup title={L.obsDyslexia} items={DYSLEXIA} obs={observations} />
        <ObsGroup title={L.obsADHD} items={ADHD} obs={observations} />
        <ObsGroup title={L.obsODD} items={ODD} obs={observations} />
      </View>
    </View>
  );
}
