export async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);

    return tab;
}

export async function setGain(tab, gain) {
    // Create offscreen document if it doesn't exist
    const existingContexts = await chrome.runtime.getContexts({});
    const offscreenDocument = existingContexts.find((context) => context.contextType === 'OFFSCREEN_DOCUMENT');

    if (!offscreenDocument) {
        await chrome.offscreen.createDocument({
            url: 'offscreen/offscreen.html',
            reasons: ['USER_MEDIA'],
            justification: 'Setting gain with tabCapture API',
        });
    }

    const website = new URL(tab.url).hostname;
    const capturedTabs = await chrome.tabCapture.getCapturedTabs();
    
    // If the provided tab isn't captured, start capturing and set its gain, otherwise just set the gain
    if (!capturedTabs.some(capturedTab => capturedTab.tabId === tab.id && capturedTab.status === "active")) {
        const streamId = await chrome.tabCapture.getMediaStreamId({
            targetTabId: tab.id
        });
        await chrome.runtime.sendMessage({ command: "captureSite", stream: streamId, website: website, gain: gain });
    }
    else {
        await chrome.runtime.sendMessage({ command: "setGain", gain: gain, website: website });
    }
}

export async function setSavedGain() {
    const websites = (await chrome.storage.sync.get(["websites"])).websites;
    const tab = await getCurrentTab();
    const website = new URL(tab.url).hostname;
    const lastWebsite = websites.findLast((site) => site.website === website);

    if (!lastWebsite)
        return 1;

    await setGain(tab, lastWebsite.gain);
    return lastWebsite.gain;
}