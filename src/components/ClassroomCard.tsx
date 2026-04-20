import { Card, Chip } from "@heroui/react";
import { Users } from "lucide-react";
import type { Classroom } from "../types/classroom";

interface ClassroomCardProps {
  classroom: Classroom;
  isSelected: boolean;
  onClick: () => void;
}

export function ClassroomCard({ classroom, isSelected, onClick }: ClassroomCardProps) {
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
        <Card.Title>{classroom.name}</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-wrap gap-2">
          {classroom.subject && (
            <Chip variant="secondary" color="accent">{classroom.subject}</Chip>
          )}
          {classroom.grade && (
            <Chip variant="tertiary">{classroom.grade}</Chip>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="flex items-center gap-1.5 text-xs text-foreground/50">
            <Users size={12} />
            {classroom.student_count} student{classroom.student_count !== 1 ? "s" : ""}
          </span>
          <p className="text-xs text-foreground/40">
            Added {new Date(classroom.created_at).toLocaleDateString()}
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
