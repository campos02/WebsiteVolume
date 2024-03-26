import { setSavedGain } from "./modules/set-gain.js";

chrome.commands.onCommand.addListener(async (command) => {
    if (command === "enable-gain")
        await setSavedGain();
});