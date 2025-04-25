const sliderT = document.getElementById('sliderThreshold');
const labelT  = document.getElementById('dbVal');
const sliderS = document.getElementById('sliderSpeed');
const labelS  = document.getElementById('speedVal');
const sliderV = document.getElementById('sliderVol');
const labelV  = document.getElementById('volVal');

function showThresh(v){ labelT.textContent = '-' + v; }
function showSpeed(v){ labelS.textContent = v; }
function showVol(v){ labelV.textContent = v; }

// load saved settings
chrome.storage.local.get(
  {
    thresholdDb: -55,
    speed: 5.0,
    silentVolume: 0.3
  },
  ({ thresholdDb, speed, silentVolume }) => {
    const t = Math.abs(thresholdDb);
    sliderT.value = t; showThresh(t);

    sliderS.value = speed; showSpeed(speed);

    const volPct = Math.round(silentVolume * 100);
    sliderV.value = volPct; showVol(volPct);
  }
);

// live feedback
sliderT.oninput = () => showThresh(sliderT.value);
sliderS.oninput = () => showSpeed(sliderS.value);
sliderV.oninput = () => showVol(sliderV.value);

// persist & notify
function update(key, value, msgType) {
  chrome.storage.local.set({ [key]: value }, () => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      tabs => {
        if (tabs[0])
          chrome.tabs.sendMessage(
            tabs[0].id,
            { type: msgType, value }
          );
      }
    );
  });
}

sliderT.onchange = () => {
  update('thresholdDb', -parseInt(sliderT.value, 10), 'updateThreshold');
};
sliderS.onchange = () => {
  update('speed', parseFloat(sliderS.value), 'updateSpeed');
};
sliderV.onchange = () => {
  const vol = parseInt(sliderV.value, 10) / 100;
  update('silentVolume', vol, 'updateSilentVol');
};
