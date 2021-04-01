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

var chunk = (arr, n) => arr.length ? [arr.slice(0, n), ...chunk(arr.slice(n), n)] : [];

var Preview = function(Profile, config) {
  var _this = {
    isPlay: false,
    storyboard: null,
    imgEl: null,
    rewindButton: null,
    videoList: {},
    updateConfigs: function(changes) {
      for (var key in changes) {
        config[key] = changes[key].newValue;
      }
      return config;
    },
    initialize: function() {
      // document.removeEventListener('DOMNodeInserted', _this.onDOMNodeInserted);
      // document.addEventListener('DOMNodeInserted', _this.onDOMNodeInserted, true);
      // _this.delegateOnVideoThumb();
      // _this.injectRewindButton();

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
    appendRatingTo: function(item) {
      var videoSparkbar = new VideoSparkbar(item.id, item.statistics);
      videoSparkbar.appendRatingTo($(item.el));
    },
    delegateOnVideoThumb: function(el) {
      if (!config.showRatingBar) { return false; }

      var videoElementIdMap = Array.from(Profile.getVideoThumbs(el || document))
        .filter((videoThumbEl) => videoThumbEl.offsetWidth === 0 || videoThumbEl.offsetWidth > 50)
        .reduce((acc, videoThumbEl) => {
          var id = Profile.getVideoIdByElement(videoThumbEl);
          if (id && _this.videoList[id]) {
            _this.appendRatingTo(_this.videoList[id]);
            return acc;
          }
          return id ? Object.assign(acc, { [id]: videoThumbEl }) : acc;
        }, {});

      var videoIds = Object.keys(videoElementIdMap);
      if (!videoIds.length) return;

      _this.retrieveVideoData(videoIds)
        .then((items) => {
          items
            .filter(item => !!item.statistics)
            .forEach(item => {
              _this.videoList[item.id] = {
                id: item.id,
                statistics: item.statistics,
                el: videoElementIdMap[item.id]
              };
              _this.appendRatingTo(_this.videoList[item.id]);
            })
        });
    },
    retrieveVideoData: function(videoIds) {
      return Promise.all(chunk(videoIds, 50)
        .map((chunkedVideoIds) =>
          $.ajax({
            url: requestUrl('//www.googleapis.com/youtube/v3/videos?', {
              part: 'statistics',
              id: chunkedVideoIds.join(','),
              key: API_KEY
            }),
            dataType: 'json',
          })
      )).then(promises => promises.reduce((acc, resp) => [...acc, ...resp.items], []));
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