/*jshint newcap: false*/
/*global Preview, Profiles */

(function(window, Preview, Profiles){

"use strict";

var list = {
    "www.youtube.com": "youtube"
  },
  config = {
    previewInterval: 200,
  };

var App;

chrome.storage.sync.get({
  previewInterval: 200
}, function(config) {
  var previewInterval = Number(config.previewInterval);
  var profile = Profiles[list[window.location.host] || "youtube"]();
  App = Preview(profile, config);
});

})(window, Preview, Profiles);
