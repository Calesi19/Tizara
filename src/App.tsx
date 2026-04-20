import { useState } from "react";
import "./App.css";
import { Button, Drawer, useOverlayState } from "@heroui/react";
import { Sidebar } from "./components/Sidebar";
import { ClassroomsPage } from "./pages/ClassroomsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { StudentProfilePage } from "./pages/StudentProfilePage";
import { FamilyMembersPage } from "./pages/FamilyMembersPage";
import { NotesPage } from "./pages/NotesPage";
import type { Classroom } from "./types/classroom";
import type { Student } from "./types/student";

type Route =
  | { page: "classrooms" }
  | { page: "students"; classroom: Classroom }
  | { page: "student-profile"; classroom: Classroom; student: Student }
  | { page: "family-members"; classroom: Classroom; student: Student }
  | { page: "notes"; classroom: Classroom; student: Student };

function App() {
  const drawerState = useOverlayState();
  const [route, setRoute] = useState<Route>({ page: "classrooms" });

  const goToClassrooms = () => setRoute({ page: "classrooms" });
  const goToStudents = (classroom: Classroom) => setRoute({ page: "students", classroom });
  const goToStudentProfile = (classroom: Classroom, student: Student) =>
    setRoute({ page: "student-profile", classroom, student });
  const goToFamilyMembers = (classroom: Classroom, student: Student) =>
    setRoute({ page: "family-members", classroom, student });
  const goToNotes = (classroom: Classroom, student: Student) =>
    setRoute({ page: "notes", classroom, student });

  function renderPage() {
    switch (route.page) {
      case "classrooms":
        return <ClassroomsPage onSelectClassroom={(c) => goToStudents(c)} />;
      case "students":
        return (
          <StudentsPage
            classroom={route.classroom}
            onGoToClassrooms={goToClassrooms}
            onSelectStudent={(s) => goToStudentProfile(route.classroom, s)}
          />
        );
      case "student-profile":
        return (
          <StudentProfilePage
            student={route.student}
            classroom={route.classroom}
            onGoToClassrooms={goToClassrooms}
            onGoToStudents={() => goToStudents(route.classroom)}
            onGoToFamilyMembers={() => goToFamilyMembers(route.classroom, route.student)}
            onGoToNotes={() => goToNotes(route.classroom, route.student)}
          />
        );
      case "notes":
        return (
          <NotesPage
            student={route.student}
            classroom={route.classroom}
            onGoToClassrooms={goToClassrooms}
            onGoToStudents={() => goToStudents(route.classroom)}
            onGoToStudentProfile={() => goToStudentProfile(route.classroom, route.student)}
          />
        );
      case "family-members":
        return (
          <FamilyMembersPage
            student={route.student}
            classroom={route.classroom}
            onGoToClassrooms={goToClassrooms}
            onGoToStudents={() => goToStudents(route.classroom)}
            onGoToStudentProfile={() => goToStudentProfile(route.classroom, route.student)}
          />
        );
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile drawer — only visible when open */}
      <Drawer state={drawerState}>
        <Drawer.Backdrop isDismissable>
          <Drawer.Content placement="left">
            <Drawer.Dialog aria-label="Navigation">
              <Drawer.Body className="p-0">
                <Sidebar
                  currentPage={route.page}
                  onNavigate={() => {
                    goToClassrooms();
                    drawerState.close();
                  }}
                />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      {/* Static desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar currentPage={route.page} onNavigate={goToClassrooms} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-2 px-4 py-3 bg-background border-b border-border shadow-sm">
          <Button variant="ghost" isIconOnly size="sm" onPress={drawerState.open} aria-label="Open menu">
            ☰
          </Button>
          <span className="text-lg font-bold">Tizara</span>
        </div>
        <main className="flex-1 bg-background-secondary flex flex-col">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
