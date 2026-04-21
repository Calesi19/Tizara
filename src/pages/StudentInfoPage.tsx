import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  ListBox,
  Spinner,
  DatePicker,
  DateField,
  Calendar,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { useStudentInfo } from "../hooks/useStudentInfo";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Group } from "../types/group";
import type { Student } from "../types/student";

interface StudentInfoPageProps {
  student: Student;
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onGoToStudentProfile: () => void;
}

function AppDatePicker({
  label,
  value,
  onChange,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  const parsed = value ? parseDate(value) : null;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <DatePicker
        className="w-full"
        aria-label={label}
        value={parsed}
        onChange={(date: DateValue | null) => onChange(date ? date.toString() : "")}
      >
        <DateField.Group fullWidth>
          <DateField.Input>
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <Calendar aria-label={label}>
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>
                {(date) => <Calendar.Cell date={date} />}
              </Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({ year }) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </div>
  );
}

export function StudentInfoPage({
  student,
  group,
  onGoToGroups,
  onGoToStudents,
  onGoToStudentProfile,
}: StudentInfoPageProps) {
  const { student: fresh, loading, error, save } = useStudentInfo(student.id);

  const [name, setName] = useState(student.name);
  const [gender, setGender] = useState(student.gender ?? "");
  const [birthdate, setBirthdate] = useState(student.birthdate ?? "");
  const [studentNumber, setStudentNumber] = useState(student.student_number ?? "");
  const [enrollmentDate, setEnrollmentDate] = useState(student.enrollment_date ?? "");
  const [enrollmentEndDate, setEnrollmentEndDate] = useState(
    student.enrollment_end_date ?? group.end_date ?? "",
  );

  useEffect(() => {
    if (fresh) {
      setName(fresh.name);
      setGender(fresh.gender ?? "");
      setBirthdate(fresh.birthdate ?? "");
      setStudentNumber(fresh.student_number ?? "");
      setEnrollmentDate(fresh.enrollment_date ?? "");
      setEnrollmentEndDate(fresh.enrollment_end_date ?? group.end_date ?? "");
    }
  }, [fresh, group.end_date]);

  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setSaveError(null);
    try {
      await save({
        name: name.trim(),
        gender,
        birthdate,
        student_number: studentNumber,
        enrollment_date: enrollmentDate,
        enrollment_end_date: enrollmentEndDate,
      });
      onGoToStudentProfile();
    } catch (e) {
      setSaveError(String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <Breadcrumb
        items={[
          { label: "Groups", onClick: onGoToGroups },
          { label: group.name },
          { label: "Students", onClick: onGoToStudents },
          { label: student.name, onClick: onGoToStudentProfile },
          { label: "Student Info" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Student Info</h2>
          <p className="text-sm text-muted">{student.name}</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onPress={handleSave}
          isDisabled={submitting || !name.trim()}
        >
          {submitting ? <Spinner size="sm" /> : "Save"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="accent" />
        </div>
      ) : error ? (
        <div role="alert" className="rounded-lg bg-danger/10 text-danger px-4 py-3 text-sm">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-w-lg pb-10">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="info-name">Name *</Label>
            <Input
              id="info-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="info-student-number">Student ID</Label>
            <Input
              id="info-student-number"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="e.g. 2024-001"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Gender</Label>
            <Select
              aria-label="Gender"
              selectedKey={gender || null}
              onSelectionChange={(key) => setGender(String(key ?? ""))}
            >
              <Select.Trigger>
                <Select.Value>
                  {({ selectedText, isPlaceholder }) =>
                    isPlaceholder ? "Select gender" : selectedText
                  }
                </Select.Value>
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="Male" textValue="Male">Male</ListBox.Item>
                  <ListBox.Item id="Female" textValue="Female">Female</ListBox.Item>
                  <ListBox.Item id="Other" textValue="Other">Other</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <AppDatePicker
            id="info-birthdate"
            label="Birthdate"
            value={birthdate}
            onChange={setBirthdate}
          />

          <AppDatePicker
            id="info-enrollment-date"
            label="Enrollment Date"
            value={enrollmentDate}
            onChange={setEnrollmentDate}
          />

          <div className="flex flex-col gap-1.5">
            <AppDatePicker
              id="info-enrollment-end-date"
              label="Enrollment End Date"
              value={enrollmentEndDate}
              onChange={setEnrollmentEndDate}
            />
            {group.end_date && (
              <p className="text-xs text-muted">
                Group ends {new Date(group.end_date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>

          {saveError && <p className="text-danger text-sm">{saveError}</p>}
        </div>
      )}
    </div>
  );
}
