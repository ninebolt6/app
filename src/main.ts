const initObserver = (
  target: Element,
  watchClassName: string,
  classAdded: (element: Element) => void,
  classRemoved: (element: Element) => void
) => {
  let classState = false;
  const callback: MutationCallback = (mutationsList) => {
    for (let mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const target = mutation.target as HTMLDivElement;
        let isContainClass = target.classList.contains(watchClassName);
        if (classState !== isContainClass) {
          classState = isContainClass;
          if (isContainClass) {
            classAdded(target);
          } else {
            classRemoved(target);
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
const onShownAd = (target: Element) => {
  console.log("showing ad");
  shownAt = new Date();
};

const onHiddenAd = (target: Element) => {
  console.log("end ad");
  console.log(`${Date.now() - shownAt!.getTime()} millisec passed`);
  shownAt = null;
};

const onPausedAd = (target: Element) => {};
const onPlayedAd = (target: Element) => {};

// main
const container = document.querySelector<HTMLDivElement>(".html5-video-player");
if (container) {
  const adShowObserver = initObserver(
    container,
    "ad-showing",
    onShownAd,
    onHiddenAd
  );
  adShowObserver.observe();

  const adPauseObserber = initObserver(
    container,
    "paused-mode",
    onPausedAd,
    onPlayedAd
  );
  adPauseObserber.observe();
}
