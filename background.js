import { getSavedWebsite, getCurrentTab, setGain } from "./modules/set-gain.js";

const MUTED = 0;
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "enable-gain") {
        const tab = await getCurrentTab();
        const website = await getSavedWebsite();

        if (!website.muted)
            await setGain(tab, website.gain);
        else
            await setGain(tab, MUTED);
    }
});