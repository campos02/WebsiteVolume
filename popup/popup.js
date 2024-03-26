import { setSavedGain, setGain, getCurrentTab } from "../modules/set-gain.js";

const volumeSlider = document.getElementById("volume-slider");
const volumeOutput = document.getElementById("volume");

volumeOutput.textContent = volumeSlider.value + "%";
setSavedGain().then((gain) => {
    volumeSlider.value = gain * 100;
    volumeOutput.textContent = volumeSlider.value + "%";
});

volumeSlider.oninput = async () => {
    volumeOutput.textContent = volumeSlider.value + "%";
    
    const tab = await getCurrentTab();
    const website = new URL(tab.url).hostname;

    await setGain(tab, volumeSlider.value / 100);

    const websiteInfo = {
        enabled: true,
        website: website,
        gain: volumeSlider.value / 100
    }

    const websites = new Set((await chrome.storage.sync.get(["websites"])).websites);
    for (const site of websites) {
        if (site.website === website)
            websites.delete(site);
    };

    websites.add(websiteInfo);
    chrome.storage.sync.set({ websites: [...websites] });
}