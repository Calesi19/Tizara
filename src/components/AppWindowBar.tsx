import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

const win = getCurrentWindow();

export const WindowBar = () => (
  <div className="fixed top-0 left-0 right-0 h-8 z-50">
    <div data-tauri-drag-region className="absolute inset-0" />
    <div className="absolute right-0 top-0 flex items-center h-8">
      <button
        onClick={() => win.minimize()}
        className="w-11 h-8 flex items-center justify-center text-foreground/60 hover:bg-foreground/10 hover:text-foreground transition-colors"
      >
        <Minus size={12} />
      </button>
      <button
        onClick={() => win.toggleMaximize()}
        className="w-11 h-8 flex items-center justify-center text-foreground/60 hover:bg-foreground/10 hover:text-foreground transition-colors"
      >
        <Square size={10} />
      </button>
      <button
        onClick={() => win.close()}
        className="w-11 h-8 flex items-center justify-center text-foreground/60 hover:bg-red-500 hover:text-white transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  </div>
);
