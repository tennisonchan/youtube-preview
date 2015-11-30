(function($){

"use strict";

var Preview = {
  currentPage: 0,
  interval: 200,
  cache: {},
  timeout: null,
  ImageIdReg: new RegExp("vi(_webp)?\\/([a-z0-9-_=]+)\\/([a-z]*default)\\.([a-z]+)*", "i"),
  videoIdReg: new RegExp("v=([a-z0-9-_=]+)", "i"),
  channelImageIdReg: new RegExp("yts/img/pixel-([a-z0-9-_=]+)\\.([a-z]+)*", "i"),
  ratingList: {},
  API_KEY: "AIzaSyAKHgX0wWr82Ko24rnJSBqs8FFvHns21a4",
  initialize: function() {
    console.log("Preview.init");

    document.addEventListener("DOMNodeInserted", Preview.onDOMNodeInserted, true);
    Preview.delegateOnVideoThumb();

    $(document)
      .off('mouseenter mouseleave')
      .on({
        mouseenter: Preview.debounce(Preview.mouseEnterEvent, 300),
        mouseleave: Preview.mouseLeaveEvent
      }, "a[href^='/watch'], a[href*='/watch?v='], [data-link*='youtube.com/watch?v=']");
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
    if (Preview.ImageIdReg.test(imgSrc)) {
      result = Preview.ImageIdReg.exec(imgSrc);
      videoId = result[2];
    } else if (Preview.videoIdReg.test(imgSrc)) {
      result = Preview.videoIdReg.exec(imgSrc);
      videoId = result[1];
    } else if (Preview.channelImageIdReg.test(imgSrc)){
      result = Preview.channelImageIdReg.exec(imgSrc);
      videoId = result[1];
    } else if($(parentEl).attr("data-vid")) {
      videoId = $(parentEl).attr("data-vid");
    }
    return videoId;
  },
  delegateOnVideoThumb: function(el) {
    var tempList = [];
    el = el || $("#body-container").get(0) || document;
    $(el).find(".video-thumb, .yt-uix-simple-thumb-wrap")
      .each(function(i, videoEl){
        if (videoEl.offsetWidth === 0 || videoEl.offsetWidth > 50) {
          var id = Preview.getVideoId(videoEl);
          if (id) {
            if (Preview.ratingList[id]) {
              Preview.ratingList[id].push(videoEl);
            } else {
              Preview.ratingList[id] = [videoEl];
            }

            tempList.push(id);
            Preview.debounce(Preview.retrieveVideoData, 20)(tempList);
          }
        }
      });
  },
  retrieveVideoData: function (videoIds) {
    do {
      var reqUrl = "https://www.googleapis.com/youtube/v3/videos" +
          "?part=statistics&id=" + videoIds.splice(0, 50).join(",") + "&key=" + Preview.API_KEY;
      $.ajax({
        url: reqUrl,
        dataType: "json",
        success: function(resp) {
          resp.items.forEach(function(item, index) {
            (Preview.ratingList[item.id] || []).forEach(function(el){
              var videoSparkbar = new Preview.VideoSparkbar(item.id, item.statistics);
              videoSparkbar.appendRatingTo(el);
            });
            delete Preview.ratingList[item.id];
          });
        }
      });
    } while(videoIds.length);
  },
  mouseEnterEvent: function() {
    var obj = $(this);
    Preview.id = obj.attr("data-link") || obj.attr("href");
    Preview.imgEl = obj.find("img").get(0) || obj.find('.videowall-still-image').get(0);
    if (Preview.cache[Preview.id]) {
      var storyboard = Preview.cache[Preview.id];
      storyboard.count = 0;
      Preview.loadStoryboard(storyboard);
    } else {
      $.ajax({
        dataType: "html",
        url: Preview.id,
        success: function(html) {
          var storyboard = Preview.getStoryboardDetails(html)[2];
          storyboard.id = this.url;
          Preview.cache[storyboard.id] = storyboard;
          Preview.loadStoryboard(storyboard);
        }
      });
    }
  },
  mouseLeaveEvent: function() {
    console.log("mouseleave");
    clearTimeout(Preview.timeout);
    Preview.id = null;
    Preview.imgEl = null;
    Preview.el && Preview.el.remove();
    Preview.el = null;
  },
  debounce: function (fn, delay) {
    return function () {
      var context = this,
          args = arguments;
      clearTimeout(Preview.timeout);
      Preview.timeout = setTimeout(function () {
        Preview.timeout = null;
        fn.apply(context, args);
      }, delay);
    };
  },
  loadStoryboard: function(storyboard) {
    if (!Preview.imgEl || Preview.id !== storyboard.id) return false;
    var parent = $(Preview.imgEl).parents('.video-thumb, .yt-uix-simple-thumb-wrap, .videowall-still');
    storyboard.frameWidth = parent.width() || Preview.imgEl.clientWidth || storyboard.frameWidth;
    storyboard.frameheight = parent.height() || Preview.imgEl.clientHeight || storyboard.frameheight;
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
    console.log("storyboards", storyboards);

    return storyboards;
  },
  loadPreviewImg: function(storyboard) {
    if (!Preview.imgEl || Preview.id !== storyboard.id) return false;
    var img = new Image();
    img.src = storyboard.url();
    img.onload = function() {
      Preview.el = Preview.el || $("<div/>", { class: "storyboard" })
      .css({
        width: storyboard.frameWidth,
        height: storyboard.frameheight,
      }).insertBefore($(Preview.imgEl));

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
    var left = -1 * storyboard.frameWidth * (storyboard.count % storyboard.col),
        top = -1 * storyboard.frameheight * (Math.floor((storyboard.count / storyboard.row)) % storyboard.row),
        backgroundImgWidth = (storyboard.frameWidth * (storyboard.width * storyboard.col) / storyboard.width),
        backgroundImgHeight = (storyboard.frameheight * (storyboard.height * storyboard.row) / storyboard.height);

    $(Preview.el).css({
      backgroundImage: "url(" + storyboard.url() + ")",
      backgroundPosition: left + "px " + top + "px",
      backgroundSize: backgroundImgWidth + "px " + backgroundImgHeight + "px"
    });
    storyboard.count = (storyboard.count + 1) % storyboard.totalFrames;
    if (Preview.id === storyboard.id) {
      setTimeout(function(){ Preview.framesPlaying(storyboard); }, Preview.interval);
    }
  }
};

Preview.VideoSparkbar = function(id, statistics) {
  this.id = id;
  this.viewCount = Number(statistics.viewCount);
  this.likeCount = Number(statistics.likeCount);
  this.dislikeCount = Number(statistics.dislikeCount);
  this.favoriteCount = Number(statistics.favoriteCount);
  this.commentCount = Number(statistics.commentCount);
};
Preview.VideoSparkbar.prototype.appendRatingTo = function(el) {
  var target = $(el).find("img").parents('.video-thumb, .yt-uix-simple-thumb-wrap');
  if (target.length) {
    var sparkbar = this.createSparkbar();
    sparkbar.insertAfter(target);
  }
};
Preview.VideoSparkbar.prototype.createSparkbar = function() {
  var ratingCount = this.likeCount + this.dislikeCount;

  return $("<div/>", { class: "preview-sparkbars"})
    .append($("<div/>", { class: "preview-sparkbar-likes", style: "width: "+(this.likeCount * 100 / ratingCount)+"%;"}))
    .append($("<div/>", { class: "preview-sparkbar-dislikes", style: "width: "+(this.dislikeCount * 100 / ratingCount)+"%;"}));
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
  this.unit = arr[6];
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
