(function($){

"use strict";

var Preview = {
  currentPage: 0,
  interval: 200,
  cache: {},
  initialize: function() {
    console.log("Preview.init");
    $(document)
      .off('mouseenter mouseleave')
      .on({
        mouseenter: Preview.mouseEnterEvent,
        mouseleave: Preview.mouseLeaveEvent
      }, "a[href^='/watch']");
  },
  mouseEnterEvent: function() {
    var obj = $(this);
    Preview.id = obj.attr("href");
    Preview.el = obj.find("img").get(0);
    var thumb = obj.find(".yt-thumb, .yt-uix-simple-thumb-wrap");
    if (Preview.cache[Preview.id]) {
      Preview.loadStoryboard(Preview.cache[Preview.id], thumb);
    } else {
      $.ajax({
        dataType: "html",
        url: Preview.id,
        success: function(html) {
          var storyboard = Preview.getStoryboardDetails(html)[2];
          storyboard.id = this.url;
          Preview.cache[storyboard.id] = storyboard;
          Preview.loadStoryboard(storyboard, thumb);
        }
      });
    }
  },
  mouseLeaveEvent: function() {
    console.log("mouseleave");
    Preview.id = null;
    Preview.el = null;
  },
  loadStoryboard: function(storyboard, thumb) {
    if (!Preview.el) return false;
    if (thumb) {
      storyboard.frameWidth = thumb.width() || storyboard.frameWidth;
      storyboard.frameheight = thumb.height() || storyboard.frameheight;
      thumb.css({
        width: storyboard.frameWidth,
        height: storyboard.frameheight,
        overflow: "hidden"
      });
    }
    Preview.loadPreviewImg(storyboard);
  },
  getStoryboardDetails: function(html) {
    var storyboards = {}, url;
    var getStoryboardRegExp = new RegExp("\"storyboard_spec\": ?\"(.*?)\"", "g");
    var storyboard_spec = getStoryboardRegExp.exec(html);
    var result = storyboard_spec[1].split("|");
    url = result.shift();

    for(var i = 1; i < result.length; i++){
      storyboards[i] = new Preview.Storyboard(result[i], url);
    }
    console.log("l", storyboards);

    return storyboards;
  },
  loadPreviewImg: function(storyboard) {
    if (!Preview.el) return false;
    Preview.el.src = storyboard.url();
    Preview.el.onload = function() {
      $(Preview.el).css({
        width: (storyboard.frameWidth * this.naturalWidth / storyboard.width),
        height: (storyboard.frameheight * this.naturalHeight / storyboard.height),
        position: "relative"
      });
      if (Preview.id === storyboard.id) {
        setTimeout(function(){ Preview.framesPlaying(storyboard); }, Preview.interval);
      }
    };
  },
  framesPlaying: function (storyboard) {
    if (storyboard.page() !== Preview.currentPage) {
      Preview.currentPage = storyboard.page();
      Preview.loadPreviewImg(storyboard);
      return false;
    }

    $(Preview.el).css({
      left: -1 * storyboard.frameWidth * (storyboard.count % storyboard.col),
      top: -1 * storyboard.frameheight * (Math.floor((storyboard.count / storyboard.row)) % storyboard.row)
    });
    storyboard.count += 1;
    if (Preview.id === storyboard.id) {
      setTimeout(function(){ Preview.framesPlaying(storyboard); }, Preview.interval);
    }
  }

};

Preview.Storyboard = function (str, baseUrl) {
  var arr = str.split("#");

  this.baseUrl = baseUrl;
  this.width = Number(arr[0]);
  this.height = Number(arr[1]);
  this.frameWidth = Number(arr[0]);
  this.frameheight = Number(arr[1]);
  this.totalFrames = Number(arr[2]);
  this.row = Number(arr[3]);
  this.col = Number(arr[4]);
  this.ms = Number(arr[5]);
  this.unit = Number(arr[6]);
  this.sigh = arr[7];
  this.maxPage = Math.ceil(this.totalFrames/ (this.row * this.col));
  this.count = 0;

  return this;
};
Preview.Storyboard.prototype.page = function() {
  var page = Math.floor(this.count / (this.col * this.row));
  return page % this.maxPage;
};
Preview.Storyboard.prototype.url = function(l, m) {
  l = l || 2;
  m = m || this.page();
  return this.baseUrl.replace(/\\/g, "").replace("$L", l).replace("$N", "M" + m) + "?sigh=" + this.sigh;
};

Preview.initialize();

}(jQuery));