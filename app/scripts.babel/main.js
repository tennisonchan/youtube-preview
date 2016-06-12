/*jshint newcap: false*/
/*global Preview, Profiles */

(function(window, Preview, Profiles) {

  'use strict';

  var list = {
      'www.youtube.com': 'youtube'
    },
    config = {
      delayPreview: 50,
      previewInterval: 200,
      showRatingBar: true
    };

  chrome.storage.sync.get(config, function(config) {
    config.previewInterval = Number(config.previewInterval);
    config.delayPreview = Number(config.delayPreview);
    config.showRatingBar = config.showRatingBar;
    var profile = Profiles[list[window.location.host] || 'youtube']();
    var App = Preview(profile, config);
  });

})(window, Preview, Profiles);