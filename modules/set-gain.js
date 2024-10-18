/**
 * Queries the active tab on the last focused window, i.e. the one the user is currently in
 * @returns Active tab found
 */
export async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

/**
 * Retrieves from storage the last saved website with the current hostname
 * @returns Retrieved website
 */
export async function getSavedWebsite() {
    const tab = await getCurrentTab();
    const hostname = new URL(tab.url).hostname;
    const websites = (await chrome.storage.sync.get(["websites"])).websites;
    return websites.findLast((site) => site.website === hostname);
}

/**
 * Sends a message for the offscreen document to set the provided gain on the provided tab and save it in storage
 * @param {tab} tab - Tab that will have its gain modified
 * @param {number} gain - Gain value to set
 */
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

    const hostname = new URL(tab.url).hostname;
    const capturedTabs = await chrome.tabCapture.getCapturedTabs();
    
    // If the provided tab isn't captured, start capturing and set its gain, otherwise just set the gain
    if (!capturedTabs.some(capturedTab => capturedTab.tabId === tab.id && capturedTab.status === "active")) {
        const streamId = await chrome.tabCapture.getMediaStreamId({
            targetTabId: tab.id
        });
        await chrome.runtime.sendMessage({ command: "captureSite", stream: streamId, website: hostname, gain: gain });
    }
    else {
        await chrome.runtime.sendMessage({ command: "setGain", gain: gain, website: hostname });
    }
}