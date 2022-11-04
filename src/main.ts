const initClassObserver = <T extends Element>(
  watchClassName: string,
  onClassAdded: (element: T) => void,
  onClassRemoved: (element: T) => void
) => {
  let classState = false;
  const callback: MutationCallback = (mutationsList) => {
    for (let mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const target = mutation.target as T;
        let isContainClass = target.classList.contains(watchClassName);
        if (classState !== isContainClass) {
          classState = isContainClass;
          if (isContainClass) {
            onClassAdded(target);
          } else {
            onClassRemoved(target);
          }
        }
      }
    }
  };
  const observer = new MutationObserver(callback);
  const observe = (target: T) => {
    observer.observe(target, { attributes: true });
  };

  return {
    observe,
  };
};

let shownAt: Date | null = null;
let pausedAt: Date | null = null;
let pausedDuration = 0;
const onShownAd = (_target: HTMLDivElement) => {
  console.log("showing ad");
  shownAt = new Date();
  pausedAt = null;
};

const onHiddenAd = (target: HTMLDivElement) => {
  console.log("end ad");
  const timePassed = Date.now() - shownAt!.getTime();
  console.log(`${timePassed} millisec passed`);
  if (pausedAt) {
    onPlayedAd(target);
  }
  console.log(`${timePassed - pausedDuration} millisec watched`);

  // save
  chrome.storage.local.set({
    [Date.now()]: {
      watchStartedAt: shownAt?.getTime(),
      totalTimePassed: timePassed,
      timePaused: pausedDuration,
      timeWatched: timePassed - pausedDuration,
    },
  });

  resetState();
};

const onPausedAd = (_target: HTMLDivElement) => {
  if (shownAt) {
    console.log("start pause");
    pausedAt = new Date();
  }
};
const onPlayedAd = (_target: HTMLDivElement) => {
  if (pausedAt) {
    console.log("end pause");
    const timePaused = Date.now() - pausedAt.getTime();
    pausedDuration += timePaused;
    console.log({ timePaused, pausedDuration });
    pausedAt = null;
  }
};

const resetState = () => {
  shownAt = null;
  pausedAt = null;
  pausedDuration = 0;
};

const adShowObserver = initClassObserver("ad-showing", onShownAd, onHiddenAd);
const adPauseObserber = initClassObserver(
  "paused-mode",
  onPausedAd,
  onPlayedAd
);

var old_url = "";
var mutationObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (location.href != old_url) {
      old_url = location.href;
      console.log("URL was changed");

      resetState();
      const container = document.querySelector<HTMLDivElement>(
        ".html5-video-player"
      );
      console.log(container);
      if (container) {
        adShowObserver.observe(container);
        adPauseObserber.observe(container);
      }
    }
  });
});
mutationObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

console.log("yt-adtime loaded");
