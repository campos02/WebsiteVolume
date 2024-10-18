const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNodes = [];

chrome.runtime.onMessage.addListener(async (request) => {
    // Update the gain node for the website
    if (request.command === "setGain") {
        const lastNode = gainNodes.findLast((node) => node.website === request.website);
        lastNode.node.gain.value = request.gain;
    }

    // In testing it was found gain value needs to be set directly after creating a new node and audio context. Volume won't be set if
    // the setGain command is directly after this one.
    if (request.command === "captureSite") {
        const media = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: "tab",
                    chromeMediaSourceId: request.stream,
                },
            }
        });
        const source = audioContext.createMediaStreamSource(media);
        const lastNode = gainNodes.findLast((node) => node.website === request.website);
        
        // Connect node if found, otherwise create a new one
        if (lastNode !== undefined)
            source.connect(lastNode.node);
        else {
            const gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            source.connect(gainNode);
            
            gainNode.gain.value = request.gain;

            gainNodes.push({
                website: request.website,
                node: gainNode
            });
        }
    }
});