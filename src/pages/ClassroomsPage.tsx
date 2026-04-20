import { Spinner } from "@heroui/react";
import { useClassrooms } from "../hooks/useClassrooms";
import { ClassroomCard } from "../components/ClassroomCard";
import { AddClassroomModal } from "../components/AddClassroomModal";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Classroom } from "../types/classroom";

interface ClassroomsPageProps {
  onSelectClassroom: (classroom: Classroom) => void;
}

export function ClassroomsPage({ onSelectClassroom }: ClassroomsPageProps) {
  const { classrooms, loading, error, addClassroom } = useClassrooms();

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: "Classrooms" }]} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Classrooms</h2>
        <AddClassroomModal onAdd={addClassroom} />
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="accent" />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg bg-danger/10 text-danger px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && classrooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-muted">No classrooms yet</p>
          <p className="text-sm text-foreground/40 mt-1">
            Click "+ Add Classroom" to get started.
          </p>
        </div>
      )}

      {!loading && classrooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((c) => (
            <ClassroomCard key={c.id} classroom={c} onClick={() => onSelectClassroom(c)} />
          ))}
        </div>
      )}
    </div>
  );
}
