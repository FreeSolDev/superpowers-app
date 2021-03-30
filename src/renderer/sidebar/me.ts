import * as chat from "../chat";
import * as dialogs from "simple-dialogs";
import * as i18n from "../../shared/i18n";
import * as settings from "../settings";

const container = document.querySelector("body > .sidebar .me");
const nameElt = container.querySelector(".name") as HTMLDivElement;
const presenceElt = container.querySelector(".presence select") as HTMLInputElement;
const showIrcStatusButton = container.querySelector(".show-chat-status") as HTMLButtonElement;

export function start() {
  nameElt.textContent = settings.nickname;
  presenceElt.value = settings.presence;
}

export function updatePresenceFromSettings() {
  presenceElt.value = settings.presence;
}

nameElt.addEventListener("click", (event) => {
  const options: dialogs.PromptOptions = {
    title: i18n.t("sidebar:setNickname.title"),
    initialValue: nameElt.textContent,
    validationLabel: i18n.t("common:actions.update"),
    cancelLabel: i18n.t("common:actions.cancel"),
    pattern: chat.nicknamePatternString,
    required: true
  };

  new dialogs.PromptDialog(i18n.t("sidebar:setNickname.title"), options, (newNickname) => {
    if (newNickname != null) {
      nameElt.textContent = newNickname;
      settings.setNickname(newNickname);
      settings.scheduleSave();
      chat.onNicknameUpdated();
    }
  });
});

presenceElt.addEventListener("change", (event) => {
  settings.setPresence(presenceElt.value as any);
  settings.scheduleSave();

  chat.onPresenceUpdated();
});

showIrcStatusButton.addEventListener("click", (event) => {
  event.preventDefault();
  chat.openStatusTab();
});
