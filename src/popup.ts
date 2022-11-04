const showValue = async () => {
  const msg = await chrome.storage.local.get();
  console.log(msg);
};

const clearValue = async () => {
  await chrome.storage.local.clear();
  console.log("cleared");
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".show")!.addEventListener("click", showValue);
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".clear")!.addEventListener("click", clearValue);
});
