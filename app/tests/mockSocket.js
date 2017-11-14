import sampleStreams from './sampleStreams.js';

export function mockIO(url) {
    console.log(`mockIO url: ${url}`);
    return {
        on(event, callback) {
            console.log(`registered callback for event: ${event}`);

            const it = sampleStreams[Symbol.iterator]();
            const streamData = () => {
                const next = it.next();
                if (!next.done) {
                    console.log('cb', next.value);
                    callback(next.value);
                    setTimeout(streamData, 1000);
                }
            };
            setTimeout(streamData, 1000);
        },
    };
}