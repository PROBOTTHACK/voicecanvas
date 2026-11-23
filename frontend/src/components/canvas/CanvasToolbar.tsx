import { Circle, MousePointer2, Square, Type, type LucideIcon } from "lucide-react";
import { IconButton } from "../ui/IconButton";

interface ToolDefinition {
  id: "select" | "rectangle" | "circle" | "text";
  label: string;
  icon: LucideIcon;
}

const TOOLS: ToolDefinition[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "text", label: "Text", icon: Type },
];

/**
 * Creation tools. Shape/text creation is wired to the command engine in VC-003;
 * until then the creation tools are disabled and Select is the only mode.
 */
export function CanvasToolbar() {
  return (
    <div role="toolbar" aria-label="Tools" className="grid grid-cols-4 gap-1">
      {TOOLS.map((tool) => (
        <IconButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          active={tool.id === "select"}
          disabled={tool.id !== "select"}
          className="w-full"
        />
      ))}
    </div>
  );
}
