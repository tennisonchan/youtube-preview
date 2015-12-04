/*jshint newcap: false*/
/*global Preview, Profiles */

(function(window, Preview, Profiles){

"use strict";

var list = {
      "www.youtube.com": "youtube"
    },
    config = {
      interval: 200,
    };

var profile = Profiles[list[window.location.host] || "youtube"]();
var App = Preview(profile, config);

})(window, Preview, Profiles);
