﻿ /*global Storyboard, VideoSparkbar, VideoBookmark, API_KEY */

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
    rewindButton: null,
    updateConfigs: function(changes) {
      for (var key in changes) {
        config[key] = changes[key].newValue;
      }

      _this.injectRewindButton();
      _this.delegateOnVideoThumb();
    },
    initialize: function() {
      document.addEventListener('DOMNodeInserted', _this.onDOMNodeInserted, true);
      _this.delegateOnVideoThumb();
      _this.injectRewindButton();

      $(document)
        .off('mouseenter mouseleave mousemove click')
        .on(scrubberEventHandler, Profile.scrubber)
        .on(thumbLinkEventHandler, Profile.thumbLinkSelector);

      _this.videoBookmark = new VideoBookmark(Profile);
    },
    injectRewindButton: function() {
      if (config.showRewindButton) {
          _this.rewindButton = new RewindButton(Profile);
          _this.rewindButton.create(Profile.ytpLeftControls);
      } else {
        _this.rewindButton && _this.rewindButton.remove();
      }
    },
    onDOMNodeInserted: function(evt) {
      var el = evt.target,
        nodeName = el.nodeName.toLowerCase();

      if (nodeName === 'video') {
        _this.videoBookmark.delegateOnVideoBookmark(el);

        _this.injectRewindButton();
      }

      if (['#comment', '#text', 'script', 'style', 'input', 'iframe', 'embed', 'button', 'video', 'link'].indexOf(nodeName) === -1) {
        _this.delegateOnVideoThumb(el);
      }
      return false;
    },
    delegateOnVideoThumb: function(el) {
      if (!config.showRatingBar) { return false; }

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
    getStoryboard: function(storyboardSpec) {
      return storyboardSpec ? new Storyboard(storyboardSpec) : new NoPreview();
    },
    loadPreviewImg: function(storyboard, imgEl) {
      var parent = Profile.getVideoThumb(imgEl);
      storyboard.set('target', imgEl);
      storyboard.set('frameWidth', parent.width() || imgEl.width());
      storyboard.set('frameheight', parent.height() || imgEl.height());
      if (storyboard.isNoPreview) {
        storyboard.appendThumbTo();
      } else {
        var img = new Image();
        img.src = storyboard.url();
        img.onload = function() {
          storyboard.appendThumbTo(parent);
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
        thumbLinkEventHandler.mouseleave();
      }
    }
  };

  var thumbLinkEventHandler = {
    mouseenter: debounce(function() {
      var videoUrl = Profile.getVideoURL(this);
      var imgEl = Profile.getImgElement(this);
      _this.isPlay = true;
      _this.storyboard && _this.storyboard.reset();

      if (cache[videoUrl]) {
        _this.storyboard = cache[videoUrl];
        _this.loadPreviewImg(_this.storyboard, imgEl);
      } else {
        $.ajax({
          url: videoUrl,
          dataType: 'text',
          success: function(html) {
            var storyboardSpec = Profile.getStoryboardSpec(html);
            var storyboard = _this.getStoryboard(storyboardSpec);
            if (storyboard && !cache[this.url]) {
              _this.storyboard = storyboard;
              cache[this.url] = storyboard;
              _this.loadPreviewImg(_this.storyboard, imgEl);
            }
          },
          fail: function() {
            var noPreview = new NoPreview();
            _this.storyboard = noPreview;
            cache[this.url] = noPreview;
            _this.loadPreviewImg(_this.storyboard, imgEl);
          }
        });
      }
    }, config.delayPreview),
    mouseleave: function() {
      _this.storyboard && _this.storyboard.reset();
      _this.isPlay = false;
      clearTimeout(timeout);
    },
  };

  var scrubberEventHandler = {
    mousemove: function(evt) {
      var progress = evt.offsetX / evt.currentTarget.clientWidth;
      _this.isPlay = false;
      _this.storyboard.setFrame(progress);
      _this.storyboard.playingFrames();
    },
    mouseleave: function() {
      _this.isPlay = true;
      _this.framesPlaying();
    },
    click: function(evt) {
      evt.preventDefault();
      var progress = evt.offsetX / evt.currentTarget.clientWidth;
      var listener = $(evt.currentTarget).parents(Profile.thumbLinkSelector);
      var videoTimeString = listener.find('.video-time').text() || listener.next('.video-time').text();
      if (videoTimeString) {
        var videoTimeArray = videoTimeString.split(':');
        var videoTimeInSec = 0;
        for(var i = 0; i < videoTimeArray.length; i++) {
          videoTimeInSec += videoTimeArray[i] * Math.pow(60, videoTimeArray.length - i - 1);
        }
        window.location.search = window.location.search + '&t=' + Math.floor(videoTimeInSec * progress) + 's';
      }
    }
  };

  _this.initialize();

  return _this;
};