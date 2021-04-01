/*jshint newcap: false*/
/*global Preview, Profiles */

(function(window, Preview, Profiles) {

  'use strict';

  var App, list = {
      'www.youtube.com': 'youtube'
    },
    config = {
      delayPreview: 20,
      previewInterval: 200,
      showRatingBar: true,
      showRewindButton: true
    };

  chrome.storage.sync.get(config, function(config) {
    config.previewInterval = Number(config.previewInterval);
    config.delayPreview = Number(config.delayPreview);
    config.showRatingBar = config.showRatingBar;
    config.showRewindButton = config.showRewindButton;
    var profile = Profiles[list[window.location.host] || 'youtube']();

    App = Preview(profile, config);
    chrome.storage.onChanged.addListener((changes) => {
      App.updateConfigs(changes);
      App.initialize();
    });
  });


})(window, Preview, Profiles);