(function () {
  window.dataLayer = window.dataLayer || [];

  window.lovableTrack = function (eventName, payload) {
    window.dataLayer.push(Object.assign({ event: eventName }, payload || {}));
  };
})();
