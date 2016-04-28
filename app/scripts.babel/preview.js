 /*global Storyboard, VideoSparkbar, VideoBookmark, API_KEY */

var cache = {},
  timeout = null;

function debounce(fn, delay) {
  return function() {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      fn.apply(context, args);
    }, delay);
  };
}

function requestUrl(baseURL, paramsObject) {
  if (paramsObject) {
    baseURL += $.param(paramsObject);
  }
  return baseURL;
}

var Preview = function(Profile, config) {
  var _this = {
    isPlay: false,
    storyboard: null,
    imgEl: null,
    initialize: function() {
      document.addEventListener('DOMNodeInserted', _this.onDOMNodeInserted, true);
      _this.delegateOnVideoThumb();

      $(document)
        .off('mouseenter mouseleave')
        .on({
          mouseenter: debounce(_this.mouseEnterEvent, 200),
          mouseleave: _this.mouseLeaveEvent,
        }, Profile.listenerSelector);

      _this.videoBookmark = new VideoBookmark(Profile);

      return this;
    },
    onDOMNodeInserted: function(evt) {
      var el = evt.target,
        nodeName = el.nodeName.toLowerCase();

      if (nodeName === 'video') {
        _this.videoBookmark.delegateOnVideoBookmark(el);
      }

      if (['#comment', '#text', 'script', 'style', 'input', 'iframe', 'embed', 'button', 'video', 'link'].indexOf(nodeName) === -1) {
        _this.delegateOnVideoThumb(el);
      }
      return false;
    },
    delegateOnVideoThumb: function(el) {
      var videoList = {};
      Profile.getVideoThumbs(el || document)
        .each(function(i, videoThumbEl) {
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
    retrieveVideoData: function(videoList) {
      var videoIds = Object.keys(videoList);
      if (!videoIds.length) return false;

      $.ajax({
        url: requestUrl('//www.googleapis.com/youtube/v3/videos?', {
          part: 'statistics',
          id: videoIds.splice(0, 50).join(','),
          key: API_KEY
        }),
        dataType: 'json',
        success: function(resp) {
          resp.items.forEach(function(item, index) {
            (videoList[item.id] || []).forEach(function(el) {
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
      console.log('mouseenter');
      _this.isPlay = true;
      var videoUrl = Profile.getVideoURL(this);
      _this.imgEl = Profile.getImgElement(this);
      _this.storyboard && _this.storyboard.remove();
      // console.log('storyboards', _this.storyboard);
      if (cache[videoUrl]) {
        _this.storyboard = cache[videoUrl];
        _this.loadPreviewImg();
      } else {
        $.ajax({
          dataType: 'html',
          url: videoUrl,
          success: function(html) {
            var storyboard = _this.getStoryboardDetails(html);
            if (storyboard) {
              _this.storyboard = storyboard;
              cache[this.url] = storyboard;
              _this.loadPreviewImg();
            }
          },
          fail: function() {
            debugger;
          }
        });
      }
    },
    mouseLeaveEvent: function() {
      console.log('mouseleave');
      _this.isPlay = false;
      _this.storyboard && _this.storyboard.remove();
      $('.storyboard').remove();
      clearTimeout(timeout);
    },
    getStoryboardDetails: function(html) {
      var storyboard = null;
      var storyboardRegExp = new RegExp('\"storyboard_spec\": ?\"(.*?)\"');
      if (storyboardRegExp.test(html)) {
        var storyboard_spec = storyboardRegExp.exec(html);
        var result = storyboard_spec[1].split('|');
        var baseUrl = result.shift();
        var lastIndex = result.length - 1;
        storyboard = new Storyboard(result[lastIndex], baseUrl, lastIndex);
      } else {
        storyboard = new NoPreview();
      }

      return storyboard;
    },
    loadPreviewImg: function() {
      var imgEl = _this.imgEl;
      var parent = Profile.getVideoThumb(imgEl);
      _this.storyboard.set('frameWidth', parent.width() || imgEl.width());
      _this.storyboard.set('frameheight', parent.height() || imgEl.height());
      if (_this.storyboard.isNoPreview) {
        _this.storyboard.appendThumbTo(imgEl);
      } else {
        var img = new Image();
        img.src = _this.storyboard.url();
        img.onload = function() {
          _this.storyboard.appendThumbTo(imgEl);
          _this.framesPlaying();
        };
      }
    },
    framesPlaying: function() {
      clearTimeout(timeout);
      if (_this.isPlay && _this.storyboard.playingFrames()) {
        timeout = setTimeout(function() {
          _this.framesPlaying();
        }, config.previewInterval);
      } else {
        _this.mouseLeaveEvent();
      }
    }
  };

  _this.initialize();
};