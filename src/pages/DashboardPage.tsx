import { Users, CalendarDays, ClipboardCheck, BookOpen, Pencil } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { useTranslation } from "../i18n/LanguageContext";
import type { Group } from "../types/group";

interface DashboardPageProps {
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onGoToSchedule: () => void;
  onGoToAttendance: () => void;
  onGoToAssignments: () => void;
  onGoToEditGroup: () => void;
}

interface DashboardCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
}

function DashboardCard({ icon, label, description, onPress }: DashboardCardProps) {
  return (
    <button
      onClick={onPress}
      className="flex flex-col gap-3 p-5 rounded-xl bg-surface border border-border hover:border-accent/40 hover:bg-accent/5 transition-colors text-left cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
    </button>
  );
}

export function DashboardPage({
  group,
  onGoToGroups,
  onGoToStudents,
  onGoToSchedule,
  onGoToAttendance,
  onGoToAssignments,
  onGoToEditGroup,
}: DashboardPageProps) {
  const { t } = useTranslation();

  const cards = [
    {
      id: "students",
      icon: <Users size={20} />,
      label: t("sidebar.students"),
      description: t("dashboard.studentsDescription"),
      onPress: onGoToStudents,
    },
    {
      id: "schedule",
      icon: <CalendarDays size={20} />,
      label: t("sidebar.schedule"),
      description: t("dashboard.scheduleDescription"),
      onPress: onGoToSchedule,
    },
    {
      id: "attendance",
      icon: <ClipboardCheck size={20} />,
      label: t("sidebar.attendance"),
      description: t("dashboard.attendanceDescription"),
      onPress: onGoToAttendance,
    },
    {
      id: "assignments",
      icon: <BookOpen size={20} />,
      label: t("sidebar.assignments"),
      description: t("dashboard.assignmentsDescription"),
      onPress: onGoToAssignments,
    },
    {
      id: "edit-group",
      icon: <Pencil size={20} />,
      label: t("dashboard.editGroup"),
      description: t("dashboard.editGroupDescription"),
      onPress: onGoToEditGroup,
    },
  ];

  return (
    <div className="p-6 flex flex-col h-full">
      <Breadcrumb
        items={[
          { label: t("groups.breadcrumb"), onClick: onGoToGroups },
          { label: group.name },
        ]}
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold">{group.name}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg">
        {cards.map((card) => (
          <DashboardCard
            key={card.id}
            icon={card.icon}
            label={card.label}
            description={card.description}
            onPress={card.onPress}
          />
        ))}
      </div>
    </div>
  );
}
