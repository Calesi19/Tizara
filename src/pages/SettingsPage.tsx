import { Select, ListBox, Surface } from "@heroui/react";

type ThemePreference = "light" | "dark" | "system";

interface SettingsPageProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  return (
    <div className="p-6 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted mt-0.5">App preferences and configuration</p>
      </div>

      <div className="flex flex-col gap-4">
        <Surface className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Appearance</span>
            <span className="text-xs text-foreground/50">Choose between light, dark, or your system default.</span>
          </div>
          <Select
            aria-label="Theme"
            selectedKey={theme}
            onSelectionChange={(key) => onThemeChange(String(key) as ThemePreference)}
            className="w-36 shrink-0"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="light">Light</ListBox.Item>
                <ListBox.Item id="dark">Dark</ListBox.Item>
                <ListBox.Item id="system">System</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </Surface>
      </div>
    </div>
  );
}
