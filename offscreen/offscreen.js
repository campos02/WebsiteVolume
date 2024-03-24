const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNodes = [];

chrome.runtime.onMessage.addListener(async (request) => {
    if (request.command === "setGain") {
        const lastNode = gainNodes.findLast((node) => node.website === request.website);

        if (lastNode !== undefined)
            lastNode.node.gain.value = request.gain;
    }

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