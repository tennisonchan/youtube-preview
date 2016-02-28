/*global Storyboard, VideoSparkbar, VideoBookmark, API_KEY */

var cache = {},
  timeout = null;

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

var Preview = function(Profile, config) {
  var _this = {
    storyboard: null,
    initialize: function() {
      console.log("Preview.init");

      document.addEventListener("DOMNodeInserted", _this.onDOMNodeInserted, true);
      _this.delegateOnVideoThumb();

      $(document)
        .off('mouseenter mouseleave')
        .on({
          mouseenter: debounce(_this.mouseEnterEvent, 200),
          mouseleave: _this.mouseLeaveEvent,
          mouseover: _this.mouseOverEvent,
          mouseout: _this.mouseOutEvent,
        }, Profile.listenerSelector);

      _this.videoBookmark = new VideoBookmark(Profile);

      return this;
    },
    onDOMNodeInserted: function(evt) {
      var el = evt.target, nodeName = el.nodeName.toLowerCase();

      if (nodeName === "video") {
        _this.videoBookmark.delegateOnVideoBookmark(el);
      }

      if (["#comment","#text","script","style","input","iframe","embed","button","video", "link"].indexOf(nodeName) === -1) {
        _this.delegateOnVideoThumb(el);
      }
      return false;
    },
    delegateOnVideoThumb: function(el) {
      var videoList = {};
      Profile.getVideoThumbs(el || document)
        .each(function(i, videoThumbEl){
          if (videoThumbEl.offsetWidth === 0 || videoThumbEl.offsetWidth > 50) {
            var id = Profile.getVideoIdByElement(videoThumbEl);
            if (id) {
              if (videoList[id]) {
                videoList[id].push(videoThumbEl);
              } else {
                videoList[id] = [videoThumbEl];
              }
            }
          }
        });
      _this.retrieveVideoData(videoList);
    },
    retrieveVideoData: function (videoList) {
      var videoIds = Object.keys(videoList);
      if(!videoIds.length) return false;

      $.ajax({
        url: requestUrl("//www.googleapis.com/youtube/v3/videos?", {
          part: "statistics",
          id: videoIds.splice(0, 50).join(","),
          key: API_KEY
        }),
        dataType: "json",
        success: function(resp) {
          resp.items.forEach(function(item, index) {
            (videoList[item.id] || []).forEach(function(el){
              var videoSparkbar = new VideoSparkbar(item.id, item.statistics);
              videoSparkbar.appendRatingTo($(el));
            });
            delete videoList[item.id];
          });

          _this.retrieveVideoData(videoList);
        }
      });
    },
    mouseEnterEvent: function() {
      console.log("mouseenter");
      var videoUrl = Profile.getVideoURL(this);
      var imgEl = Profile.getImgElement(this);
      _this.storyboard && _this.storyboard.remove();
      if (cache[videoUrl]) {
        _this.storyboard = cache[videoUrl];
        _this.loadPreviewImg(imgEl);
      } else {
        $.ajax({
          dataType: "html",
          url: videoUrl,
          success: function(html) {
            _this.storyboard = _this.getStoryboardDetails(html)[2];
            _this.loadPreviewImg(imgEl);
            cache[this.url] = _this.storyboard;
          }
        });
      }
    },
    mouseLeaveEvent: function() {
      console.log("mouseleave");
      _this.storyboard && _this.storyboard.remove();
      $('.storyboard').remove();
      clearTimeout(timeout);
    },
    mouseOverEvent: function() {
      console.log("mouseOverEvent");

    },
    mouseOutEvent: function() {
      console.log("mouseOutEvent");

    },
    getStoryboardDetails: function(html) {
      var storyboards = {};
      var getStoryboardRegExp = new RegExp("\"storyboard_spec\": ?\"(.*?)\"", "g");
      var storyboard_spec = getStoryboardRegExp.exec(html);
      var result = storyboard_spec[1].split("|");
      var baseURL = result.shift();

      for(var i = 1; i < result.length; i++){
        storyboards[i] = new Storyboard(result[i], baseURL);
      }
      console.log("storyboards", storyboards);

      return storyboards;
    },
    loadPreviewImg: function(imgEl) {
      var parent = Profile.getVideoThumb(imgEl);
      var img = new Image();
      img.src = _this.storyboard.url();
      _this.storyboard.set('frameWidth', parent.width() || imgEl.width());
      _this.storyboard.set('frameheight', parent.height() || imgEl.height());
      img.onload = function() {
        _this.storyboard.appendThumbTo(imgEl);
        _this.framesPlaying();
      };
    },
    framesPlaying: function () {
      clearTimeout(timeout);
      if(_this.storyboard.playingFrames()) {
        timeout = setTimeout(function(){ _this.framesPlaying(); }, config.previewInterval);
      }
    }
  };

  _this.initialize();
};
