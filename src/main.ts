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
const onShownAd = (target: HTMLDivElement) => {
  console.log("showing ad");
  shownAt = new Date();
};

const onHiddenAd = (target: HTMLDivElement) => {
  console.log("end ad");
  console.log(`${Date.now() - shownAt!.getTime()} millisec passed`);
  shownAt = null;
};

const onPausedAd = (target: HTMLDivElement) => {};
const onPlayedAd = (target: HTMLDivElement) => {};

// main
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
