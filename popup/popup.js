import { setSavedGain, setGain, getCurrentTab } from "../modules/set-gain.js";

const boostCheckbox = document.getElementById("boost-checkbox");
const volumeSlider = document.getElementById("volume-slider");
const volumeOutput = document.getElementById("volume");
const displayedWebsite = document.getElementById("website");

async function setSelectedGain() {
    volumeOutput.textContent = volumeSlider.value + "%";
    
    const tab = await getCurrentTab();
    const website = new URL(tab.url).hostname;

    await setGain(tab, volumeSlider.value / 100);

    const websiteInfo = {
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

volumeOutput.textContent = volumeSlider.value + "%";
setSavedGain().then(async (gain) => {
    const tab = await getCurrentTab();
    const website = new URL(tab.url).hostname;

    displayedWebsite.innerText = website;

    if (gain > 1) {
        volumeSlider.max = 800;
        boostCheckbox.checked = true;
    }
    
    volumeSlider.value = gain * 100;
    volumeOutput.textContent = volumeSlider.value + "%";
});

boostCheckbox.oninput = async () => {
    if (boostCheckbox.checked)
        volumeSlider.max = 800;
    else {
        volumeSlider.max = 100;
        volumeOutput.textContent = volumeSlider.value + "%";

        if (volumeSlider.value == 100)
            await setSelectedGain();
    }
};

volumeSlider.oninput = setSelectedGain;