var Profiles = {};

Profiles.youtube = function() {
  var _target = null, _imgEl = null,
      imageIdRegEx = new RegExp("vi(_webp)?\\/([a-z0-9-_=]+)\\/([a-z]*default)\\.([a-z]+)*", "i"),
      videoIdRegEx = new RegExp("v=([a-z0-9-_=]+)", "i"),
      channelImageIdRegEx = new RegExp("yts/img/pixel-([a-z0-9-_=]+)\\.([a-z]+)*", "i");

  var _this = {
    listenerSelector: "a[href^='/watch'], a[href*='/watch?v=']",
    moviePlayer: "#movie_player, .html5-video-player",
    hideVideoControlClass: "ytp-autohide",
    progressBarList: ".ytp-progress-bar .ytp-progress-list",
    videoThumb: ".video-thumb, .yt-uix-simple-thumb-wrap",
    mainVideo: "video",
    bookmarkPanelHook: "#watch7-content",
    bookmarksScrollbox: ".bookmarks-scrollbox",
    imgElement: "img, .videowall-still-image",
    secondaryActions: "#watch8-secondary-actions, .watch-secondary-actions",
    bookmarkMarks: ".bookmark-mark.mark-color",
    bookmarksToggled: "action-button-bookmarks-toggled",
    bookmarkInput: "#add-bookmark-input",
    bookmarkBtn: "#add-bookmark-btn",
    bookmarkPanelTrigger: ".action-panel-trigger-bookmarks",
    bookmarkPanelDismissBtn: ".bookmark-panel-dismiss-btn",
    bookmarkPanel: ".bookmark-panel",
    bookmarkLineCloseBtn: ".bookmark-line-close-btn",
    ytpTimeCurrent: ".ytp-time-current",
    ytpScrubberButton: ".ytp-scrubber-button",
    ytpPlayProgress: ".ytp-play-progress",
    getImgElement: function(el){
      var imgEl = $(el).find("img, .videowall-still-image");
      if(imgEl.length) {
        _target = $(el);
        _imgEl = imgEl;
      }
      return imgEl;
    },
    getVideoURL: function(el) {
      el = el || _target;
      return $(el).attr("href");
    },
    getVideoId: function(videoEl) {
      var result, videoId = null,
          imgSrc = this.getImgElement(videoEl).attr("data-thumb") ||this.getImgElement(videoEl).attr("src");
      if (imageIdRegEx.test(imgSrc)) {
        result = imageIdRegEx.exec(imgSrc);
        videoId = result[2];
      } else if (videoIdRegEx.test(imgSrc)) {
        result = videoIdRegEx.exec(imgSrc);
        videoId = result[1];
      } else if (channelImageIdRegEx.test(imgSrc)){
        result = channelImageIdRegEx.exec(imgSrc);
        videoId = result[1];
      }
      return videoId;
    },
    getVideoThumbs: function(el) {
      return $(el).find(".video-thumb, .yt-uix-simple-thumb-wrap");
    },
    getVideoThumb: function(el) {
      return $(el).parents(".video-thumb, .yt-uix-simple-thumb-wrap");
    }
  };

  return _this;
};
