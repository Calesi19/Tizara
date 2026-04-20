import { Button } from "@heroui/react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "classrooms", label: "Classrooms" },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="bg-surface-secondary min-h-screen w-64 flex flex-col">
      <div className="p-5 pb-3">
        <h1 className="text-xl font-bold text-accent">Tizara</h1>
        <p className="text-xs text-muted mt-0.5">Classroom Manager</p>
      </div>
      <nav className="flex-1 px-2 py-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={currentPage === item.id ? "secondary" : "ghost"}
                fullWidth
                className="justify-start"
                onPress={() => onNavigate(item.id)}
              >
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
