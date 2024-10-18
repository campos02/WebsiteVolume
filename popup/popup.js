import { getSavedWebsite, setGain, getCurrentTab } from "../modules/set-gain.js";

const MAX_BOOSTED_VOLUME = 800;
const MAX_VOLUME = 100;
const MUTED = 0;

const boostCheckbox = document.getElementById("boost-button");
const muteCheckbox = document.getElementById("mute-button");
const volumeSlider = document.getElementById("volume-slider");
const volumeOutput = document.getElementById("volume");
const displayedWebsite = document.getElementById("website");

/**
 * Sets the volume (gain) selected by the user and saves it to storage
 */
async function setSelectedGain() {
    volumeOutput.textContent = volumeSlider.value + "%";
    const tab = await getCurrentTab();
    const hostname = new URL(tab.url).hostname;

    if (!muteCheckbox.checked)
        await setGain(tab, volumeSlider.value / MAX_VOLUME);
    else
        await setGain(tab, MUTED);

    const websiteInfo = {
        website: hostname,
        gain: volumeSlider.value / MAX_VOLUME,
        muted: muteCheckbox.checked
    }

    const websites = new Set((await chrome.storage.sync.get(["websites"])).websites);
    for (const site of websites) {
        if (site.website === hostname)
            websites.delete(site);
    };

    websites.add(websiteInfo);
    chrome.storage.sync.set({ websites: [...websites] });
}

// Initial run and retrieval from storage
volumeOutput.textContent = volumeSlider.value + "%";
getSavedWebsite().then(async (website) => {
    const tab = await getCurrentTab();
    displayedWebsite.innerText = new URL(tab.url).hostname;

    // If volume is boosted
    if (website.gain > 1) {
        volumeSlider.max = MAX_BOOSTED_VOLUME;
        boostCheckbox.checked = true;
    }

    if (!website.muted) {
        await setGain(tab, website.gain);
        volumeSlider.value = website.gain * MAX_VOLUME;
    }
    else {
        await setGain(tab, MUTED);
        volumeSlider.value = MUTED;
        muteCheckbox.checked = true;
    }

    volumeOutput.textContent = volumeSlider.value + "%";
});

volumeSlider.oninput = async () => {
    muteCheckbox.checked = false;
    await setSelectedGain();
};

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

muteCheckbox.oninput = async () => {
    if (muteCheckbox.checked) {
        // Set slider value only after calling gain function so the volume stored isn't saved over
        await setSelectedGain();
        volumeSlider.value = MUTED;
    }
    else {
        const website = await getSavedWebsite();
        volumeSlider.value = website.gain * MAX_VOLUME;
        await setSelectedGain();
    }

    volumeOutput.textContent = volumeSlider.value + "%";
}