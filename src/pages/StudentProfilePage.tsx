import { Avatar, Card, Chip } from "@heroui/react";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Classroom } from "../types/classroom";
import type { Student } from "../types/student";

interface StudentProfilePageProps {
  student: Student;
  classroom: Classroom;
  onGoToClassrooms: () => void;
  onGoToStudents: () => void;
  onGoToFamilyMembers: () => void;
}

export function StudentProfilePage({
  student,
  classroom,
  onGoToClassrooms,
  onGoToStudents,
  onGoToFamilyMembers,
}: StudentProfilePageProps) {
  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Classrooms", onClick: onGoToClassrooms },
          { label: classroom.name, onClick: onGoToStudents },
          { label: student.name },
        ]}
      />

      <div className="flex items-center gap-4 mb-8">
        <Avatar color="accent" size="lg">
          <Avatar.Fallback color="accent">
            {student.name.charAt(0).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{student.name}</h2>
          <p className="text-sm text-muted">
            Enrolled {new Date(student.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="secondary">
          <Card.Header>
            <Card.Title className="text-base">Classroom</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="font-medium">{classroom.name}</p>
            <div className="flex gap-2 mt-1">
              {classroom.subject && (
                <Chip variant="secondary" color="accent" size="sm">{classroom.subject}</Chip>
              )}
              {classroom.grade && (
                <Chip variant="tertiary" size="sm">{classroom.grade}</Chip>
              )}
            </div>
          </Card.Content>
        </Card>

        <Card variant="secondary">
          <Card.Header>
            <Card.Title className="text-base">Student ID</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="font-mono text-foreground/60">#{student.id}</p>
          </Card.Content>
        </Card>

        <Card
          variant="secondary"
          className="cursor-pointer hover:shadow-md hover:border-accent/30 transition-all"
          onClick={onGoToFamilyMembers}
        >
          <Card.Header>
            <Card.Title className="text-base">Family Members</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-sm text-muted">View and manage family contacts →</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
