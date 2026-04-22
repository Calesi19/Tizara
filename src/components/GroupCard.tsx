import { Card, Chip } from "@heroui/react";
import { Users } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import type { Group } from "../types/group";

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  onClick: () => void;
}

function formatMonthYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(dateStr + "T12:00:00"));
}

export function GroupCard({ group, isSelected, onClick }: GroupCardProps) {
  const { t } = useTranslation();
  const start = formatMonthYear(group.start_date);
  const end = formatMonthYear(group.end_date);
  const dateRange = start && end ? `${start} – ${end}` : start || end || null;

  return (
    <Card
      className={`cursor-pointer shadow-sm transition-all border-2 ${
        isSelected
          ? "border-accent shadow-accent/20 shadow-md"
          : "border-border hover:border-accent/40 hover:shadow-md"
      }`}
      onClick={onClick}
    >
      <Card.Header>
        <Card.Title>{group.name}</Card.Title>
        {group.school_name && (
          <p className="text-xs text-muted mt-0.5">{group.school_name}</p>
        )}
      </Card.Header>
      <Card.Content>
        <div className="flex flex-wrap gap-2 mb-3">
          {group.grade && (
            <Chip variant="tertiary">{group.grade}</Chip>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-foreground/50">
            <Users size={12} />
            {group.student_count} {group.student_count !== 1 ? t("groups.card.students") : t("groups.card.student")}
          </span>
          {dateRange && (
            <p className="text-xs text-foreground/40">{dateRange}</p>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
