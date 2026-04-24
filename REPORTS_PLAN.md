# Reports Feature — Implementation Plan

Offline PDF report generation for teachers. Reports can cover a whole class or an individual student. The user picks which modules (sections) to include and applies per-module filters. PDFs are saved locally to a folder configured in Settings.

**Library:** `@react-pdf/renderer` — React components rendered to PDF, works fully offline in the Tauri webview.  
**File save:** Custom Rust command `write_pdf` (base64 → bytes → disk). Folder configured in Settings → Files.

---

## Stage 1 — Foundation ✅

Goal: prove the pipeline works end-to-end before building content.

- [x] Install `@react-pdf/renderer`, `@tauri-apps/plugin-dialog`
- [x] Add `tauri-plugin-dialog` Rust crate; register in `lib.rs`
- [x] Add `write_pdf` Rust command (base64 → file write)
- [x] `src/reports/PdfDocument.tsx` — shared document shell (header, footer with page count)
- [x] `src/pages/ReportsPage.tsx` — sidebar page with "Generate Test PDF" button
- [x] Wire Reports into `App.tsx` routing and `Sidebar.tsx` nav
- [x] Settings → Files section with folder picker (`@tauri-apps/plugin-dialog`)

**Verify:** App builds, Reports appears in sidebar, folder picker works in Settings, test PDF saves to disk with correct header/footer.

---

## Stage 2 — Group Reports

Goal: whole-class exports. Scope = selected group, no student picker needed.

Sections to build (`src/reports/sections/`):

| File | Content |
|------|---------|
| `StudentRosterSection.tsx` | Table: name, gender, birthdate, student ID, enrollment date |
| `AttendanceSummarySection.tsx` | Table: student · # present · # absent · # late · % present. Filter: date range |
| `GradeSummarySection.tsx` | Per period: student scores table + grade distribution (A–F). Filter: period name |

ReportsPage UI (group scope):
- Checkboxes for each section
- Per-section filter controls (date range, period)
- Generate button → saves PDF to configured folder

- [x] `src/reports/fetchGroupReportData.ts` — standalone fetch functions (students, attendance summary, grade summary, distinct periods)
- [x] `src/reports/sections/StudentRosterSection.tsx`
- [x] `src/reports/sections/AttendanceSummarySection.tsx` — color-coded attendance %, optional date range
- [x] `src/reports/sections/GradeSummarySection.tsx` — grade letters A–F, class average, optional period filter
- [x] ReportsPage rebuilt: checkbox section cards + per-section filter controls + Generate button

**Verify:** Generate a group report with all three sections; data matches what's visible in the app; headers/footers present on all pages.

---

## Stage 3 — Individual Student Reports

Goal: per-student exports with the full range of student data.

Sections to build:

| File | Content |
|------|---------|
| `StudentProfileSection.tsx` | Demographics: name, gender, DOB, student ID, enrollment dates |
| `ContactsSection.tsx` | Table: name · relationship · phone · email · guardian/emergency flags |
| `AddressesSection.tsx` | Formatted address blocks, home address flagged |
| `ServicesSection.tsx` | Special ed, therapies checklist, medical plan, allergies, conditions |
| `AccommodationsSection.tsx` | Checklist of 6 accommodation types |
| `ObservationsSection.tsx` | 3 grouped checklists (learning/dyslexia, attention/hyperactivity, social/oppositional) |
| `NotesSection.tsx` | Chronological note list with date and tags. Filter: by tag |
| `AttendanceRecordsSection.tsx` | Table: date · period · status · notes. Filter: date range |
| `GradesSection.tsx` | Table: assignment · period · score · max · grade letter. Filter: period |

ReportsPage UI (individual scope):
- Student picker dropdown (within current group)
- Checkboxes for each section
- Per-section filter controls

**Verify:** Generate a student report with all sections; every field matches the student profile.

---

## Stage 4 — Report Builder Polish

Goal: unified, polished UI covering both scopes.

- Scope toggle at top of ReportsPage: "Group Report" / "Individual Student Report"
- Select All / Deselect All shortcuts
- Disable Generate when no sections selected and no folder configured
- Loading state during generation (can be slow for large datasets)
- Post-generate: show saved file path + "Show in Finder" button (`plugin-opener`)
- Translation: add all report-related strings to `en` and `es` in `translations.ts`

---

## Data Reference

All data available for reports (from DB schema):

| Category | Table(s) | Key fields |
|----------|----------|-----------|
| Group | `groups` | name, grade, school_name, start_date, end_date |
| Students | `students` | name, gender, birthdate, student_number, enrollment_date, enrollment_end_date |
| Contacts | `contacts` | name, relationship, phone, email, is_emergency_contact, is_primary_guardian |
| Addresses | `student_addresses` | street, city, state, zip_code, country, is_student_home |
| Attendance | `attendance_records` | date, status, notes (joined with schedule_periods) |
| Assignments | `assignments` | title, period_name, max_score |
| Scores | `assignment_scores` | score (joined with students) |
| Notes | `student_notes` | content, tags, created_at |
| Services | `student_services` | special_education, therapies, medical_plan, allergies, conditions |
| Accommodations | `student_accommodations` | 6 boolean fields |
| Observations | `student_observations` | 37 boolean checklist items |
| Visitations | `visitations` | visited_at, notes (joined with contacts) |
| Canceled days | `canceled_days` | date, reason |

All tables use soft deletes (`is_deleted = 0` filter required in all queries).

---

## File Structure

```
src/
  reports/
    PdfDocument.tsx          ← shared document shell (header + footer)
    sections/
      StudentRosterSection.tsx
      AttendanceSummarySection.tsx
      GradeSummarySection.tsx
      StudentProfileSection.tsx
      ContactsSection.tsx
      AddressesSection.tsx
      ServicesSection.tsx
      AccommodationsSection.tsx
      ObservationsSection.tsx
      NotesSection.tsx
      AttendanceRecordsSection.tsx
      GradesSection.tsx
  pages/
    ReportsPage.tsx          ← report builder UI
  pages/
    SettingsPage.tsx         ← Files section added here

src-tauri/src/lib.rs        ← write_pdf command
```
