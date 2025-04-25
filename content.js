/* ------------- YouTube Silence Speeder – content.js --------------- */
/* Speeds silent stretches to fastRate & lowers volume to silentVol.   */
/*---------------------------------------------------------------------*/

const NORMAL_RATE        = 1.0;     // regular playbackRate
const MIN_SILENCE_SEC    = 1.0;     // how long RMS must stay below threshold
const CHECK_INTERVAL_MS  = 120;     // analyser polling rate
const DEFAULT_DB         = -55;     // dBFS treated as "silence"
const DEFAULT_SPEED      = 5.0;     // × playbackRate during silence
const DEFAULT_SILENT_VOL = 0.3;     // volume (0–1) during silent fast-play

let thresholdDb = DEFAULT_DB;   // live-tunable
let fastRate    = DEFAULT_SPEED;
let silentVol   = DEFAULT_SILENT_VOL;

chrome.storage.local.get(
  { thresholdDb: DEFAULT_DB, speed: DEFAULT_SPEED, silentVolume: DEFAULT_SILENT_VOL },
  res => {
    thresholdDb = res.thresholdDb;
    fastRate    = res.speed;
    silentVol   = res.silentVolume;
  }
);

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'updateThreshold') {
    thresholdDb = msg.value;
    sendResponse({ ok: true });
  } else if (msg.type === 'updateSpeed') {
    fastRate = msg.value;
    sendResponse({ ok: true });
  } else if (msg.type === 'updateSilentVol') {
    silentVol = msg.value;
    sendResponse({ ok: true });
  }
});

function wire(video) {
  if (video.dataset.speederAttached) return;
  video.dataset.speederAttached = 'true';

  video.crossOrigin = 'anonymous';

  video.addEventListener('play', () => {
    if (video.dataset.speederReady) return;
    video.dataset.speederReady = 'true';

    const originalVol = video.volume;
    const AudioCtx    = window.AudioContext || window.webkitAudioContext;
    const ctx         = new AudioCtx();
    const source      = ctx.createMediaElementSource(video);
    const analyser    = ctx.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);
    analyser.connect(ctx.destination);

    const buf          = new Float32Array(analyser.fftSize);
    let   silenceStart = null;
    let   isSilent     = false;

    function tick() {
      if (video.paused || video.ended) {
        requestAnimationFrame(tick);
        return;
      }
      if (ctx.state === 'suspended') ctx.resume();

      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const s of buf) sum += s * s;
      const rms = Math.sqrt(sum / buf.length);
      const db  = 20 * Math.log10(rms || 1e-8);
      const now = video.currentTime;
      const quiet = db < thresholdDb;

      if (quiet) {
        if (!isSilent) {
          if (silenceStart === null) silenceStart = now;
          if (now - silenceStart >= MIN_SILENCE_SEC) {
            isSilent = true;
            video.playbackRate = fastRate;
            video.volume       = silentVol;
          }
        }
      } else {
        silenceStart = null;
        if (isSilent) {
          isSilent = false;
          video.playbackRate = NORMAL_RATE;
          video.volume       = originalVol;
        }
      }

      setTimeout(tick, CHECK_INTERVAL_MS);
    }

    tick();
  }, { once: true });
}

const observer = new MutationObserver(() =>
  document.querySelectorAll('video').forEach(wire)
);
observer.observe(document.documentElement, { childList:true, subtree:true });
document.querySelectorAll('video').forEach(wire);
