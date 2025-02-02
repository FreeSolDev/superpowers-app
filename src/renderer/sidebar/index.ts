import "./me";

import * as ResizeHandle from "resize-handle";
import * as TreeView from "dnd-tree-view";
import { ConfirmDialog } from "simple-dialogs";
import * as i18n from "../../shared/i18n";

import AddAddOrEditServerDialog from "./AddOrEditServerDialog";
import * as settings from "../settings";
import * as serverSettings from "../serverSettings";
import openServer from "../tabs/openServer";

new ResizeHandle(document.querySelector("body > .sidebar") as HTMLDivElement, "left");

const addServerBtn = document.querySelector(".add-server") as HTMLButtonElement;
const editServerBtn = document.querySelector(".edit-server") as HTMLButtonElement;
const removeServerBtn = document.querySelector(".remove-server") as HTMLButtonElement;

const serversTreeView = new TreeView(document.querySelector(".servers-tree-view") as HTMLElement, { dropCallback: onServerDrop });

export function start() {
  addServer({
    id: "local",
    label: i18n.t("server:myServer"),
    hostname: i18n.t("server:autoConfigured"),
    port: null, password: null
  });

  for (const serverEntry of settings.favoriteServers) addServer(serverEntry);
  addServerBtn.disabled = false;
}

addServerBtn.addEventListener("click", onAddServerClick);
editServerBtn.addEventListener("click", onEditServerClick);
removeServerBtn.addEventListener("click", onRemoveServerClick);

serversTreeView.on("selectionChange", updateSelectedServer);
serversTreeView.on("activate", onServerActivate);

function onAddServerClick(event: MouseEvent) {
  const addOrEditOptions = {
    validationLabel: i18n.t("common:actions.add"),
    initialHostnameValue: "",
    initialPortValue: "4237",
    initialLabelValue: "",
    initialPasswordValue: ""
  };

  new AddAddOrEditServerDialog(i18n.t("sidebar:addServer.title"), addOrEditOptions, (newServer: ServerEntry) => {
    if (newServer == null) return;

    let id = 0;
    for (const server of settings.favoriteServers) id = Math.max(id, parseInt(server.id, 10) + 1);
    newServer.id = id.toString();

    addServer(newServer);
    settings.favoriteServers.push(newServer);
    settings.favoriteServersById[newServer.id] = newServer;
    settings.scheduleSave();
  });
}

function onEditServerClick(event: MouseEvent) {
  const serverId = serversTreeView.selectedNodes[0].dataset["serverId"];
  if (serverId === "local") return;

  const serverEntry = settings.favoriteServersById[serverId];

  const addOrEditOptions = {
    validationLabel: i18n.t("common:actions.save"),
    initialHostnameValue: serverEntry.hostname,
    initialPortValue: serverEntry.port,
    initialLabelValue: serverEntry.label,
    initialPasswordValue: serverEntry.password
  };

  new AddAddOrEditServerDialog(i18n.t("sidebar:editServer.title"), addOrEditOptions, (updatedEntry) => {
    if (updatedEntry == null) return;

    serverEntry.hostname = updatedEntry.hostname;
    serverEntry.port = updatedEntry.port;
    serverEntry.label = updatedEntry.label;
    serverEntry.password = updatedEntry.password;

    const selectedServerElt = serversTreeView.treeRoot.querySelector(`li[data-server-id="${serverId}"]`);
    const host = serverEntry.hostname + (serverEntry.port != null ? `:${serverEntry.port}` : "");
    selectedServerElt.querySelector(".host").textContent = host;
    selectedServerElt.querySelector(".label").textContent = serverEntry.label;

    settings.scheduleSave();
  });
}

function onRemoveServerClick(event: MouseEvent) {
  const selectedServerId = serversTreeView.selectedNodes[0].dataset["serverId"];
  if (selectedServerId === "local") return;

  new ConfirmDialog("Are you sure you want to remove the server?", { validationLabel: "Remove" }, (confirm) => {
    if (!confirm) return;

    const selectedServerElt = serversTreeView.treeRoot.querySelector(`li[data-server-id="${selectedServerId}"]`);
    serversTreeView.treeRoot.removeChild(selectedServerElt);

    const favoriteServer = settings.favoriteServersById[selectedServerId];
    delete settings.favoriteServersById[selectedServerId];
    settings.favoriteServers.splice(settings.favoriteServers.indexOf(favoriteServer), 1);

    settings.scheduleSave();
  });
}

function addServer(serverEntry: ServerEntry) {
  const serverElt = document.createElement("li");
  serverElt.dataset["serverId"] = serverEntry.id;
  serversTreeView.append(serverElt, "item");

  const labelElt = document.createElement("div");
  labelElt.classList.add("label");
  labelElt.textContent = serverEntry.label;
  serverElt.appendChild(labelElt);

  const hostElt = document.createElement("div");
  hostElt.classList.add("host");

  const host = serverEntry.hostname + (serverEntry.port != null ? `:${serverEntry.port}` : "");
  hostElt.textContent = host;
  serverElt.appendChild(hostElt);
}

function onServerDrop(event: DragEvent, dropLocation: TreeView.DropLocation, orderedNodes: HTMLLIElement[]) {
  // TODO
  return false;
}

function updateSelectedServer() {
  let canEditSelectedServer = false;

  if (serversTreeView.selectedNodes.length !== 0) {
    const selectedServerId = serversTreeView.selectedNodes[0].dataset["serverId"];
    canEditSelectedServer = selectedServerId !== "local";
  }

  editServerBtn.disabled = !canEditSelectedServer;
  removeServerBtn.disabled = !canEditSelectedServer;
}

function onServerActivate() {
  if (serversTreeView.selectedNodes.length === 0) return;

  const serverId = serversTreeView.selectedNodes[0].dataset["serverId"];
  let serverEntry: ServerEntry;

  if (serverId === "local") {
    // Fetch local server config to build up-to-date entry
    serverEntry = {
      id: "local",
      label: i18n.t("server:myServer"),
      hostname: "127.0.0.1",
      port: serverSettings.config.mainPort.toString(),
      password: serverSettings.config.password
    };
  } else {
    serverEntry = settings.favoriteServersById[serverId];
  }

  openServer(serverEntry);
}
