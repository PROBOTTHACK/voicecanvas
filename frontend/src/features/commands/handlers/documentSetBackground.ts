import type { CommandHandler, HandlerOutcome } from "../types";
import { checkColor } from "../validation";

export const documentSetBackgroundHandler: CommandHandler = {
  parameterKeys: ["color"],

  execute(document, params): HandlerOutcome {
    if (params.color === undefined) {
      return { kind: "rejected", message: "Tell me which background color to use." };
    }
    const color = checkColor(params.color, "The background color");
    if (!color.ok) return { kind: "rejected", message: color.message };

    if (color.value === document.background.toUpperCase()) {
      return { kind: "skipped", targetIds: [document.id], message: `The background is already ${color.value}.` };
    }

    return {
      kind: "applied",
      document: { ...document, background: color.value },
      targetIds: [document.id],
      message: `Changed the background to ${color.value}.`,
    };
  },
};
