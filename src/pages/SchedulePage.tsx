import { Button, Spinner } from "@heroui/react";
import { CalendarCheck } from "lucide-react";
import { useSchedule } from "../hooks/useSchedule";
import { Breadcrumb } from "../components/Breadcrumb";
import { AddPeriodModal } from "../components/AddPeriodModal";
import { PeriodCard } from "../components/PeriodCard";
import { DAY_LABELS } from "../types/schedule";
import type { DayOfWeek } from "../types/schedule";
import type { Group } from "../types/group";

interface SchedulePageProps {
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onGoToAttendance: () => void;
}

const ORDERED_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];
const DAY_SHORT: Record<DayOfWeek, string> = {
  1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 0: "Sun",
};

export function SchedulePage({
  group,
  onGoToGroups,
  onGoToStudents,
  onGoToAttendance,
}: SchedulePageProps) {
  const { periods, loading, error, addPeriod, updatePeriod, deletePeriod, periodsByDay } =
    useSchedule(group.id);

  return (
    <div className="p-6 flex flex-col h-full">
      <Breadcrumb
        items={[
          { label: "Groups", onClick: onGoToGroups },
          { label: group.name, onClick: onGoToStudents },
          { label: "Schedule" },
        ]}
      />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Schedule</h2>
          <p className="text-sm text-muted">
            {group.subject && <span>{group.subject} · </span>}
            {group.grade && <span>{group.grade}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onPress={onGoToAttendance}>
            <CalendarCheck size={15} className="mr-1" />
            Take Attendance
          </Button>
          <AddPeriodModal onAdd={addPeriod} />
        </div>
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

      {!loading && !error && periods.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-center gap-3">
          <p className="text-lg font-semibold text-muted">No schedule set up yet</p>
          <p className="text-sm text-foreground/40">
            Add periods to define when this class meets each week.
          </p>
          <AddPeriodModal onAdd={addPeriod} />
        </div>
      )}

      {!loading && !error && periods.length > 0 && (
        <>
          {/* Week view — large screens */}
          <div className="hidden lg:grid grid-cols-7 gap-2 flex-1 min-h-0">
            {ORDERED_DAYS.map((day) => {
              const dayPeriods = periodsByDay.get(day) ?? [];
              return (
                <div key={day} className="flex flex-col min-h-0">
                  <div className="text-center py-2 mb-2 border-b border-border/40">
                    <span className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                      {DAY_SHORT[day]}
                    </span>
                    {dayPeriods.length > 0 && (
                      <span className="block text-foreground/30 text-xs mt-0.5">
                        {dayPeriods.length}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 overflow-y-auto">
                    {dayPeriods.map((period) => (
                      <PeriodCard
                        key={period.id}
                        period={period}
                        onDelete={deletePeriod}
                        onEdit={updatePeriod}
                        compact
                      />
                    ))}
                    {dayPeriods.length === 0 && (
                      <p className="text-center text-foreground/20 text-xs pt-3">—</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* List view — small screens */}
          <div className="lg:hidden flex flex-col gap-6">
            {ORDERED_DAYS.filter((day) => periodsByDay.has(day)).map((day) => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground/60">
                    {DAY_LABELS[day]}
                  </h3>
                  <span className="text-xs text-foreground/40">
                    ({periodsByDay.get(day)!.length} period{periodsByDay.get(day)!.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {periodsByDay.get(day)!.map((period) => (
                    <PeriodCard
                      key={period.id}
                      period={period}
                      onDelete={deletePeriod}
                      onEdit={updatePeriod}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
