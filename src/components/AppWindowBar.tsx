// WindowBar.tsx
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

export const WindowBar = () => {
  return (
    <div data-tauri-drag-region className="window-bar">
      <div className="controls">
        <button onClick={() => appWindow.minimize()}>—</button>
        {/* toggleMaximize is now an async function on the window instance */}
        <button onClick={() => appWindow.toggleMaximize()}>▢</button>
        <button onClick={() => appWindow.close()} className="close-btn">
          ✕
        </button>
      </div>
    </div>
  );
};
