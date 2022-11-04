const initClassObserver = <T extends Element>(
  target: T,
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

  return {
    observe: () => observer.observe(target, { attributes: true }),
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

  shownAt = null;
  pausedDuration = 0;
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

// main
console.log("yt-adtime loaded");
const container = document.querySelector<HTMLDivElement>(".html5-video-player");
if (container) {
  const adShowObserver = initClassObserver(
    container,
    "ad-showing",
    onShownAd,
    onHiddenAd
  );
  adShowObserver.observe();

  const adPauseObserber = initClassObserver(
    container,
    "paused-mode",
    onPausedAd,
    onPlayedAd
  );
  adPauseObserber.observe();
}
