﻿(function($, window){

"use strict";

var cache = {},
  timeout = null,
  imageIdRegEx = new RegExp("vi(_webp)?\\/([a-z0-9-_=]+)\\/([a-z]*default)\\.([a-z]+)*", "i"),
  videoIdRegEx = new RegExp("v=([a-z0-9-_=]+)", "i"),
  channelImageIdRegEx = new RegExp("yts/img/pixel-([a-z0-9-_=]+)\\.([a-z]+)*", "i"),
  ratingList = {},
  API_KEY = "AIzaSyAKHgX0wWr82Ko24rnJSBqs8FFvHns21a4",
  config = {
    interval: 200,
  };

function debounce(fn, delay) {
  return function() {
    var context = this,
        args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      fn.apply(context, args);
    }, delay);
  };
}

function requestUrl(baseURL, paramsObject) {
  if(paramsObject) {
    baseURL += $.param(paramsObject);
  }
  return baseURL;
}

var Preview = {
  id: null,
  imgEl: null,
  storyboard: null,
  initialize: function() {
    console.log("Preview.init");

    document.addEventListener("DOMNodeInserted", Preview.onDOMNodeInserted, true);
    Preview.delegateOnVideoThumb();

    $(document)
      .off('mouseenter mouseleave')
      .on({
        mouseenter: debounce(Preview.mouseEnterEvent, 300),
        mouseleave: Preview.mouseLeaveEvent
      }, "a[href^='/watch'], a[href*='/watch?v='], [data-link*='youtube.com/watch?v=']");

    return this;
  },
  onDOMNodeInserted: function(evt) {
    var el = evt.target, nodeName = el.nodeName.toLowerCase();

    if (["#comment","#text","script","style","input","iframe","embed","button","video", "link"].indexOf(nodeName) === -1) {
      Preview.delegateOnVideoThumb(el);
    }
    return false;
  },
  getVideoId: function (parentEl) {
    var result, videoId = null,
        imgSrc = $(parentEl).find("img").attr("data-thumb") || $(parentEl).find("img").attr("src");
    if (imageIdRegEx.test(imgSrc)) {
      result = imageIdRegEx.exec(imgSrc);
      videoId = result[2];
    } else if (videoIdRegEx.test(imgSrc)) {
      result = videoIdRegEx.exec(imgSrc);
      videoId = result[1];
    } else if (channelImageIdRegEx.test(imgSrc)){
      result = channelImageIdRegEx.exec(imgSrc);
      videoId = result[1];
    } else if($(parentEl).attr("data-vid")) {
      videoId = $(parentEl).attr("data-vid");
    }
    return videoId;
  },
  delegateOnVideoThumb: function(el) {
    var tempList = [];
    $(el || document).find(".video-thumb, .yt-uix-simple-thumb-wrap")
      .each(function(i, videoEl){
        if (videoEl.offsetWidth === 0 || videoEl.offsetWidth > 50) {
          var id = Preview.getVideoId(videoEl);
          if (id) {
            if (ratingList[id]) {
              ratingList[id].push(videoEl);
            } else {
              ratingList[id] = [videoEl];
            }

            tempList.push(id);
            debounce(Preview.retrieveVideoData, 20)(tempList);
          }
        }
      });
  },
  retrieveVideoData: function (videoIds) {
    do {
      $.ajax({
        url: requestUrl("https://www.googleapis.com/youtube/v3/videos?", {
          part: "statistics",
          id: videoIds.splice(0, 50).join(","),
          key: API_KEY
        }),
        dataType: "json",
        success: function(resp) {
          resp.items.forEach(function(item, index) {
            (ratingList[item.id] || []).forEach(function(el){
              var videoSparkbar = new Preview.VideoSparkbar(item.id, item.statistics);
              videoSparkbar.appendRatingTo($(el));
            });
            delete ratingList[item.id];
          });
        }
      });
    } while(videoIds.length);
  },
  mouseEnterEvent: function() {
    var obj = $(this);
    Preview.id = obj.attr("data-link") || obj.attr("href");
    Preview.imgEl = obj.find("img").get(0) || obj.find('.videowall-still-image').get(0);
    if (cache[Preview.id]) {
      Preview.storyboard = cache[Preview.id];
      Preview.loadStoryboard();
    } else {
      $.ajax({
        dataType: "html",
        url: Preview.id,
        success: function(html) {
          var storyboard = Preview.getStoryboardDetails(html)[2];
          Preview.storyboard = storyboard.set('id', this.url);
          cache[this.url] = storyboard;
          Preview.loadStoryboard();
        }
      });
    }
  },
  mouseLeaveEvent: function() {
    console.log("mouseleave");
    clearTimeout(timeout);
    Preview.id = null;
    Preview.imgEl = null;
    Preview.storyboard.reset();
  },
  getStoryboardDetails: function(html) {
    var storyboards = {};
    var getStoryboardRegExp = new RegExp("\"storyboard_spec\": ?\"(.*?)\"", "g");
    var storyboard_spec = getStoryboardRegExp.exec(html);
    var result = storyboard_spec[1].split("|");
    var baseURL = result.shift();

    for(var i = 1; i < result.length; i++){
      storyboards[i] = new Preview.Storyboard(result[i], baseURL);
    }
    console.log("storyboards", storyboards);

    return storyboards;
  },
  loadStoryboard: function() {
    var parent = $(Preview.imgEl).parents('.video-thumb, .yt-uix-simple-thumb-wrap, .videowall-still');
    Preview.storyboard.set('frameWidth', parent.width() || Preview.imgEl.clientWidth);
    Preview.storyboard.set('frameheight', parent.height() || Preview.imgEl.clientHeight);
    Preview.loadPreviewImg();
  },
  loadPreviewImg: function() {
    var img = new Image();
    img.src = Preview.storyboard.url();
    img.onload = function() {
      Preview.storyboard.appendThumbTo(Preview.imgEl);
      Preview.framesPlaying();
    };
  },
  framesPlaying: function () {
    if(Preview.storyboard.playingFrames()) {
      setTimeout(function(){ Preview.framesPlaying(); }, config.interval);
    }
  }
};

window.Preview = Preview.initialize();

}(jQuery, window));
