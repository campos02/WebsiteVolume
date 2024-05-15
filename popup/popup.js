import { setSavedGain, setGain, getCurrentTab } from "../modules/set-gain.js";

const MAX_BOOSTED_VOLUME = 800;
const MAX_VOLUME = 100;

const boostCheckbox = document.getElementById("boost-checkbox");
const volumeSlider = document.getElementById("volume-slider");
const volumeOutput = document.getElementById("volume");
const displayedWebsite = document.getElementById("website");

/**
 * Sets the volume (gain) selected by the user and saves it to storage along with the current website
 */
async function setSelectedGain() {
    volumeOutput.textContent = volumeSlider.value + "%";
    
    const tab = await getCurrentTab();
    const website = new URL(tab.url).hostname;
    await setGain(tab, volumeSlider.value / MAX_VOLUME);

    const websiteInfo = {
        website: website,
        gain: volumeSlider.value / MAX_VOLUME
    }

    const websites = new Set((await chrome.storage.sync.get(["websites"])).websites);
    for (const site of websites) {
        if (site.website === website)
            websites.delete(site);
    };

    websites.add(websiteInfo);
    chrome.storage.sync.set({ websites: [...websites] });
}

// Initial run and retrieval from storage
volumeOutput.textContent = volumeSlider.value + "%";
setSavedGain().then(async (gain) => {
    const tab = await getCurrentTab();
    const website = new URL(tab.url).hostname;

    displayedWebsite.innerText = website;

    // If volume is boosted
    if (gain > 1) {
        volumeSlider.max = MAX_BOOSTED_VOLUME;
        boostCheckbox.checked = true;
    }
    
    volumeSlider.value = gain * MAX_VOLUME;
    volumeOutput.textContent = volumeSlider.value + "%";
});

boostCheckbox.oninput = async () => {
    if (boostCheckbox.checked)
        volumeSlider.max = MAX_BOOSTED_VOLUME;
    else {
        volumeSlider.max = MAX_VOLUME;
        volumeOutput.textContent = volumeSlider.value + "%";

        if (volumeSlider.value == MAX_VOLUME)
            await setSelectedGain();
    }
};

volumeSlider.oninput = setSelectedGain;