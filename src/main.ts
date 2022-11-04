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
  shownAt = new Date();
  pausedAt = null;
};

const onHiddenAd = (target: HTMLDivElement) => {
  const timePassed = Date.now() - shownAt!.getTime();
  if (pausedAt) {
    onPlayedAd(target);
  }

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
    pausedAt = new Date();
  }
};
const onPlayedAd = (_target: HTMLDivElement) => {
  if (pausedAt) {
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
var urlChangeObserver = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    if (location.href != old_url) {
      old_url = location.href;

      resetState();
      const container = document.querySelector<HTMLDivElement>(
        ".html5-video-player"
      );
      if (container) {
        // update observe target
        adShowObserver.observe(container);
        adPauseObserber.observe(container);
      }
    }
  });
});

urlChangeObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

console.log("yt-adtime loaded");
