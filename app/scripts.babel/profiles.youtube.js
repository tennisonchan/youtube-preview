var Profiles = {};

Profiles.youtube = function() {
  var _target = null,
    _imgEl = null,
    imageIdRegEx = new RegExp('vi(_webp)?\\/([a-z0-9-_=]+)\\/([a-z]*default)\\.([a-z]+)*', 'i'),
    imageIdRegExV2 = new RegExp('vi(_webp)?\\/([a-z0-9-_=]+)\\/*', 'i'),
    videoIdRegEx = new RegExp('v=([a-z0-9-_=]+)', 'i'),
    channelImageIdRegEx = new RegExp('yts/img/pixel-([a-z0-9-_=]+)\\.([a-z]+)*', 'i'),
    storyboardRegExp = new RegExp('playerStoryboardSpecRenderer":{"spec":"(.*?)\"', 'i');

  var _this = {
    bookmarkBtn: '.add-bookmark-btn',
    bookmarkInput: '#add-bookmark-input',
    bookmarkLineCloseBtn: '.bookmark-line-close-btn',
    bookmarkMark: '.bookmark-mark',
    bookmarkPanel: '.bookmark-panel',
    bookmarkPanelDismissBtn: '.bookmark-panel-dismiss-btn',
    bookmarkPanelHook: '#watch7-content',
    bookmarkPanelTrigger: '.action-panel-trigger-bookmarks',
    bookmarksScrollbox: '.bookmarks-scrollbox',
    bookmarksToggled: 'action-button-bookmarks-toggled',
    hideVideoControlClass: 'ytp-autohide',
    imgElement: 'img.yt-img-shadow, .ytp-videowall-still-image',
    thumbLinkSelector: 'a[href^=\'/watch\']:has(img), a[href*=\'/watch?v=\']:has(img), a[href*=\'/watch?v=\']:has(.ytp-videowall-still-image)',
    mainVideo: 'video',
    scrubber: '.preview-scrubber',
    moviePlayer: '#movie_player, .html5-video-player',
    progressBarList: '.ytp-progress-bar .ytp-progress-list',
    secondaryActions: '#watch8-secondary-actions, .watch-secondary-actions',
    videoThumb: 'yt-img-shadow.ytd-thumbnail, .video-thumb, .yt-uix-simple-thumb-wrap',
    ytpPlayProgress: '.ytp-play-progress',
    ytpScrubberButton: '.ytp-scrubber-button',
    ytpTimeCurrent: '.ytp-time-current',
    ytpLeftControls: '.ytp-left-controls',
    ytpRewindButton: '.ytp-rewind-button',
    getBookmarkPanelHook: function() {
      return $(this.bookmarkPanelHook);
    },
    getMainVideo: function(el) {
      return $(this.mainVideo);
    },
    getImgElement: function(el) {
      var imgEl = $(el).andSelf().find(this.imgElement);
      if (imgEl.length) {
        _target = $(el);
        _imgEl = imgEl;
      }
      return imgEl;
    },
    getVideoURL: function(el) {
      el = el || _target;
      return $(el).attr('href');
    },
    getVideoId: function(videoThumbEl) {
      return $('[itemprop=videoId]').attr('content') || $('[data-video-id]').attr('data-video-id');
    },
    getVideoIdByElement: function(videoThumbEl) {
      var result, videoId = null,
        imgSrc = this.getImgElement(videoThumbEl).attr('data-thumb') || this.getImgElement(videoThumbEl).attr('src');
      if (videoThumbEl.dataset.vid) {
        videoId = videoThumbEl.dataset.vid;
      } else if (imageIdRegEx.test(imgSrc)) {
        result = imageIdRegEx.exec(imgSrc);
        videoId = result[2];
      } else if (imageIdRegExV2.test(imgSrc)) {
        result = imageIdRegExV2.exec(imgSrc);
        videoId = result[2];
      } else if (videoIdRegEx.test(imgSrc)) {
        result = videoIdRegEx.exec(imgSrc);
        videoId = result[1];
      } else if (channelImageIdRegEx.test(imgSrc)) {
        result = channelImageIdRegEx.exec(imgSrc);
        videoId = result[1];
      }
      return videoId;
    },
    getVideoThumbs: function(el) {
      return $(el).find(this.videoThumb);
    },
    getVideoThumb: function(el) {
      return $(el).parents(this.videoThumb);
    },
    getStoryboardSpec: function(html) {
      return storyboardRegExp.test(html) ? storyboardRegExp.exec(html)[1] : null;
    },
  };

  return _this;
};