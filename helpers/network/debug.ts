import { ConsoleMessage, Page } from "@playwright/test";

export const debugConsole = async (
  page: Page,
  status: "on" | "off" = "on",
): Promise<void> => {
  const eventListener = async (message: ConsoleMessage) => {
    const values = [];
    let type: keyof Console = "log";

    switch (message.type()) {
      case "warning":
        type = "warn";
        break;
      case "debug":
        type = "debug";
        break;
      case "error":
        type = "error";
        break;
      case "info":
        type = "info";
        break;
      case "log":
        type = "log";
        break;
      case "table":
        type = "table";
        break;
      default:
        break;
    }

    if (!(type in console)) {
      type = "log";
    }

    for (const arg of message.args()) values.push(await arg.jsonValue());
    console[type](...values);
  };

  if (status === "on") {
    page.on("console", eventListener);
  } else {
    page.off("console", eventListener);
  }
};
