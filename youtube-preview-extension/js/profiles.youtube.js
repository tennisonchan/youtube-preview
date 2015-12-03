var Profiles = {};

Profiles.youtube = function() {
  var _target = null, _img = null,
      imageIdRegEx = new RegExp("vi(_webp)?\\/([a-z0-9-_=]+)\\/([a-z]*default)\\.([a-z]+)*", "i"),
      videoIdRegEx = new RegExp("v=([a-z0-9-_=]+)", "i"),
      channelImageIdRegEx = new RegExp("yts/img/pixel-([a-z0-9-_=]+)\\.([a-z]+)*", "i");

  var _this = {
    listenerSelector: "a[href^='/watch'], a[href*='/watch?v=']",
    getImgElement: function(el){
      var img = $(el).find("img");
      if(img.length) {
        _target = $(el);
        _img = img;
      }
      return img;
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
