import { useState } from "react";
import {
  Button,
  EmptyState,
  Input,
  Spinner,
  TableColumn,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableContent,
  TableScrollContainer,
  TableRoot,
} from "@heroui/react";
import { Inbox, Trash2 } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { ConfirmModal } from "../components/ConfirmModal";
import { AddAssignmentModal } from "../components/AddAssignmentModal";
import { useAssignments } from "../hooks/useAssignments";
import { useTranslation } from "../i18n/LanguageContext";
import type { Group } from "../types/group";
import type { Assignment } from "../types/assignment";

interface AssignmentsPageProps {
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AssignmentsPage({
  group,
  onGoToGroups,
  onGoToStudents,
  onSelectAssignment,
}: AssignmentsPageProps) {
  const { assignments, loading, error, addAssignment, deleteAssignment } = useAssignments(group.id);
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 flex flex-col h-full">
      <Breadcrumb
        items={[
          { label: t("groups.breadcrumb"), onClick: onGoToGroups },
          { label: group.name, onClick: onGoToStudents },
          { label: t("assignments.breadcrumb") },
        ]}
      />

      <div className="mb-1">
        <h2 className="text-2xl font-bold">{t("assignments.title")}</h2>
        <p className="text-sm text-muted">
          {group.grade && <span>{group.grade}</span>}
        </p>
      </div>

      <div className="flex items-center justify-between mt-6 mb-4">
        {!loading && assignments.length > 0 && (
          <Input
            placeholder={t("assignments.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        )}
        <div className="ml-auto">
          <AddAssignmentModal groupId={group.id} onAdd={addAssignment} />
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

      <div className="flex-1 flex flex-col min-h-0">
        {!loading && !error && (
          <TableRoot variant="primary" className="flex-1 h-full">
            <TableScrollContainer className="h-full">
              <TableContent
                aria-label={t("assignments.title")}
                onRowAction={(key) => {
                  const assignment = assignments.find((a) => a.id === key);
                  if (assignment) onSelectAssignment(assignment);
                }}
              >
                <TableHeader>
                  <TableColumn isRowHeader>
                    {t("assignments.tableColumns.title")}
                  </TableColumn>
                  <TableColumn>
                    {t("assignments.tableColumns.period")}
                  </TableColumn>
                  <TableColumn>
                    {t("assignments.tableColumns.maxScore")}
                  </TableColumn>
                  <TableColumn>
                    {t("assignments.tableColumns.date")}
                  </TableColumn>
                  <TableColumn>{" "}</TableColumn>
                </TableHeader>
                <TableBody
                  renderEmptyState={() => (
                    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-2 py-12 text-center">
                      <Inbox className="size-6 text-muted" />
                      <span className="text-sm font-medium text-muted">
                        {assignments.length === 0
                          ? t("assignments.noAssignmentsYet")
                          : t("students.noResultsTitle")}
                      </span>
                      <span className="text-xs text-foreground/40">
                        {assignments.length === 0
                          ? t("assignments.noAssignmentsHint")
                          : t("students.noResultsHint", { search })}
                      </span>
                    </EmptyState>
                  )}
                >
                  {filtered.map((a) => (
                    <TableRow key={a.id} id={a.id} className="cursor-pointer">
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell className="text-sm text-foreground/50">{a.period_name}</TableCell>
                      <TableCell className="text-sm text-foreground/50">
                        {a.max_score} {t("assignments.pts")}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/50">
                        {formatDate(a.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => setDeletingAssignment(a)}
                          aria-label={t("assignments.deleteModal.title")}
                          className="p-1.5 text-foreground/30 hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableContent>
            </TableScrollContainer>
          </TableRoot>
        )}
      </div>

      <ConfirmModal
        isOpen={deletingAssignment !== null}
        onClose={() => setDeletingAssignment(null)}
        onConfirm={async () => {
          if (deletingAssignment) await deleteAssignment(deletingAssignment.id);
        }}
        title={t("assignments.deleteModal.title")}
        description={
          deletingAssignment
            ? t("assignments.deleteModal.description", { title: deletingAssignment.title })
            : ""
        }
        confirmLabel={t("common.delete")}
      />
    </div>
  );
}
