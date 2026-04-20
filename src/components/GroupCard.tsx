import { Card, Chip } from "@heroui/react";
import { Users } from "lucide-react";
import type { Group } from "../types/group";

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  onClick: () => void;
}

export function GroupCard({ group, isSelected, onClick }: GroupCardProps) {
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
      </Card.Header>
      <Card.Content>
        <div className="flex flex-wrap gap-2">
          {group.subject && (
            <Chip variant="secondary" color="accent">{group.subject}</Chip>
          )}
          {group.grade && (
            <Chip variant="tertiary">{group.grade}</Chip>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="flex items-center gap-1.5 text-xs text-foreground/50">
            <Users size={12} />
            {group.student_count} student{group.student_count !== 1 ? "s" : ""}
          </span>
          <p className="text-xs text-foreground/40">
            Added {new Date(group.created_at).toLocaleDateString()}
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
