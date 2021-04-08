import * as ResizeHandle from "resize-handle";

// new ResizeHandle(document.querySelector(".server-log") as HTMLDivElement, "bottom");
setupCollapsablePane(document.querySelector(".server-log"));

const settingsElt = document.querySelector(".server-settings") as HTMLDivElement;
const logTextarea = settingsElt.querySelector(".server-log textarea") as HTMLTextAreaElement;
const clearServerLogButton = settingsElt.querySelector(".server-log button.clear") as HTMLButtonElement;
clearServerLogButton.addEventListener("click", onClearLogButtonClick);

export function append(text: string) {
  logTextarea.value += text;
  setTimeout(() => { logTextarea.scrollTop = logTextarea.scrollHeight; }, 0);
}

function onClearLogButtonClick(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();

  logTextarea.value = "";
}

// todo : refacto with the one in Sup.Client ?
function setupCollapsablePane(paneElt: HTMLDivElement, refreshCallback?: Function) {
  const handle = new ResizeHandle(paneElt, "bottom");
  if (refreshCallback != null)
    handle.on("drag", () => { refreshCallback(); });

  const statusElt = paneElt.querySelector(".header") as HTMLDivElement;

  const buttonElt = document.createElement("button");
  buttonElt.classList.add("toggle");
  statusElt.appendChild(buttonElt);

  const contentElt = paneElt.querySelector(".content") as HTMLDivElement;
  const collaspe = (collapsed: boolean) => {
    contentElt.hidden = collapsed;
    buttonElt.textContent = collapsed ? "+" : "–";

    if (refreshCallback != null) refreshCallback();
  };

  collaspe(paneElt.classList.contains("collapsed"));
  statusElt.addEventListener("click", (event) => { collaspe(paneElt.classList.toggle("collapsed")); });
}
