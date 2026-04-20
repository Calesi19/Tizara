import { Card, Chip } from "@heroui/react";
import type { Classroom } from "../types/classroom";

interface ClassroomCardProps {
  classroom: Classroom;
  onClick: () => void;
}

export function ClassroomCard({ classroom, onClick }: ClassroomCardProps) {
  return (
    <Card
      className="cursor-pointer shadow-sm hover:shadow-md hover:border-accent/30 transition-all border border-border"
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
        <p className="text-xs text-foreground/40 mt-2">
          Added {new Date(classroom.created_at).toLocaleDateString()}
        </p>
      </Card.Content>
    </Card>
  );
}
