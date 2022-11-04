interface AdWatchData {
  watchStartedAt: number;
  totalTimePassed: number;
  timePaused: number;
  timeWatched: number;
}

interface StorageData {
  [key: number]: AdWatchData;
}

const showValue = async () => {
  const msg = await chrome.storage.local.get();
  console.log(msg);
};

const clearValue = async () => {
  await chrome.storage.local.clear();
  console.log("cleared");
};

const downloadData = async () => {
  const data: StorageData = await chrome.storage.local.get();
  const jsonData = JSON.stringify(data);
  const blob = new Blob([jsonData], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.setAttribute("href", url);
  anchor.setAttribute("download", "log.json");

  const mouseEvent = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
  });

  anchor.dispatchEvent(mouseEvent);
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".show")!.addEventListener("click", showValue);
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".clear")!.addEventListener("click", clearValue);
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".download")!.addEventListener("click", downloadData);
});
