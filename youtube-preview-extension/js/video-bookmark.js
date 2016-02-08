function displayTime(time) {
  var h = ~~(time / 3600);
  var m = ("0" + ~~((time % 3600) / 60)).substr(-2);
  var s = ("0" + time % 60).substr(-2);
  return [h, m, s].filter(function(val) { return val; }).join(":");
};

var BookmarkStorage = function(videoId) {
  var _storage = {};

  function initialize () {
    _storage.videoId = videoId;
    _storage.localStorageKey = "yt-preview::" + videoId;
    _storage.bookmarks = _storage.loadBookmarks(videoId);
  }

  function updateStorage(data) {
    _storage.bookmarks = data;

    localStorage[_storage.localStorageKey] = JSON.stringify({ data: data });
  };

  _storage.loadBookmarks = function() {
    var stringData = localStorage[_storage.localStorageKey];

    if(stringData) {
      return JSON.parse(stringData).data || [];
    } else {
      return [];
    }
  };

  _storage.addBookmark = function(object) {
    var notes = _storage.bookmarks;

    notes.push(object);

    notes.sort(function(a, b) {
      return a.atTime - b.atTime;
    });

    updateStorage(notes);
  };

  _storage.removeBookmark = function(timestamp) {
    var notes = $.map(_storage.bookmarks, function(val, i) {
      if(val.timestamp !== timestamp) {
        return val;
      }
    });

    notes.sort(function(a, b) {
      return a.atTime - b.atTime;
    });

    updateStorage(notes);
  };

  initialize();

  return _storage;
};

var VideoBookmark = function(Profile) {
  var _this = {},
      _storage = null;

  _this.bookmarkId = 0;

  _this.initialize = function() {
    _this.delegateOnVideoBookmark();

    $(document)
      .on({
        click: _this.submitBookmark
      }, Profile.bookmarkBtn)
      .on({
        focus: _this.addBookmarkInputFocus,
        blur: _this.addBookmarkInputBlur,
        keyup: _this.addBookmarkInputKeyup
      }, Profile.bookmarkInput)
      .on({
        click: _this.onTriggerBookmarks
      }, Profile.bookmarkPanelTrigger)
      .on({
        click: _this.onTriggerBookmarks
      }, Profile.bookmarkPanelDismissBtn);
  };

  _this.delegateOnVideoBookmark = function(el) {
    Profile.getMainVideo(el || document)
      .off("loadedmetadata")
      .on("loadedmetadata", _this.onLoadedMetaData);
  };

  _this.onLoadedMetaData = function(evt) {
    console.log("afterLoadedMetaData");

    _this.video = evt.target;
    _this.videoId = Profile.getVideoId();

    _storage = new BookmarkStorage(_this.videoId);

    $(_this.video)
      .off("timeupdate")
      .on("timeupdate", function() {
        var currentTime = Math.floor(_this.video.currentTime);
        var ratio = currentTime / Math.floor(_this.video.duration);
        $(Profile.ytpTimeCurrent).text(displayTime(currentTime));
        $(Profile.ytpScrubberButton).css("left", ratio * 100 + "%");
        $(Profile.ytpPlayProgress).css("transform", "scaleX(" + ratio + ")");
      });

    var bookmarkPanelHook = Profile.getBookmarkPanelHook();
    var secondaryActionsList = $(Profile.secondaryActions);

    if(bookmarkPanelHook.find(Profile.bookmarkPanel).length === 0) {
      _this.bookmarkPanel = _this.createBookmarkPanel();
      _this.bookmarksScrollbox = _this.bookmarkPanel.find(Profile.bookmarksScrollbox);
      _this.bookmarkPanel.prependTo(bookmarkPanelHook);
    }
    if(secondaryActionsList.find(Profile.bookmarkPanelTrigger).length === 0) {
      _this.bookmarkToggler = _this.createBookmarkToggler();
      _this.bookmarkToggler.appendTo(secondaryActionsList);
    }

    _this.removeBookmarks();
    _this.loadBookmarks(_storage.bookmarks);
  };

  _this.loadBookmarks = function(bookmarks) {
    bookmarks.forEach(function(bookmark) {
      _this.addMark(bookmark.note, bookmark.atTime, bookmark.timestamp);
    });
  };

  _this.removeBookmarks = function() {
    $(Profile.bookmarkMark).remove();
  };

  _this.addBookmarkInputFocus = function(evt) {
    console.log("focus");
    _this.isVideoPaused = _this.video.paused;
    _this.video.pause();
  };

  _this.addBookmarkInputBlur = function() {
    console.log("blur");
    if(!_this.isVideoPaused) {
      _this.video.play();
    }
  };

  _this.submitBookmark = function() {
    var addBookmarInput = $(Profile.bookmarkInput);
    var value = addBookmarInput.val();

    if(value) {
      _this.addBookmark(value);
      addBookmarInput.val("").blur();
    }
  };

  _this.addBookmarkInputKeyup = function(evt) {
    var value = evt.target.value;
    console.log("keyup");

    if(evt.keyCode === 13) {
      console.log("enter");
      _this.submitBookmark();
    } else {
      if(value.length > 2) {
        _this.render(new Fuse(_storage.bookmarks, {
          keys: ["note"]
        }).search(value));
      } else {
        _this.render(_storage.bookmarks);
      }
    }
  };

  _this.createBookmarkToggler = function() {
    var bookmarkToggler = $(
      '<button class="action-panel-trigger-bookmarks yt-uix-tooltip" type="button" title="Bookmarks" data-trigger-for="action-panel-bookmarks" data-tooltip-text="Bookmarks">'+
        '<span>Bookmarks</span>'+
      '</button>'
    );

    return bookmarkToggler;
  };

  _this.onTriggerBookmarks = function(evt) {
    if(_this.bookmarkToggler.hasClass(Profile.bookmarksToggled)) {
      _this.bookmarkPanel.hide();
      _this.bookmarkToggler.removeClass(Profile.bookmarksToggled);
    } else {
      _this.bookmarkPanel.show();
      _this.bookmarkToggler.addClass(Profile.bookmarksToggled);
    }
  };

  _this.createBookmarkPanel = function() {
    var bookmarksNotFound = "The bookmark could not be loaded.";
    var bookmarkPanelTitle = "Bookmark list";

    return $(
      '<div class="bookmark-panel yt-uix-button-panel yt-card yt-card-has-padding" style="display: none;">'+
        '<div id="bookmark-panel-content" class="bookmark-panel-content" data-panel-loaded="true">'+
          '<div id="bookmarks-loading" class="hid" style="display: none;">'+
            '<div class="bookmark-panel-loading">'+
              '<p class="yt-spinner">'+
                '<span title="Loading icon" class="yt-spinner-img yt-sprite"></span>'+
                '<span class="yt-spinner-message">Loading...</span>'+
              '</p>'+
            '</div>'+
          '</div>'+
          '<div id="bookmarks">'+
            '<h2 class="yt-card-title">'+ bookmarkPanelTitle +'</h2>'+
            '<div id="bookmarks-container" class="yt-scrollbar">'+
              '<div id="bookmarks-not-found" class="hid">'+ bookmarksNotFound +'</div>'+

              '<div class="bookmarks-menu">'+
                '<div id="bookmark-search" class="search-form consolidated-form">'+
                  '<button class="add-bookmark-btn yt-uix-button yt-uix-button-size-default yt-uix-button-default" type="submit">'+
                    '<span>'+
                      '<i class="search-btn-icon"></i>'+
                      '/'+
                      '<i class="add-btn-icon"></i>'+
                    '</span>'+
                  '</button>'+
                  '<div id="bookmark-search-terms" class="bookmark-search-terms-border">'+
                    '<input id="add-bookmark-input" autocomplete="off" class="search-term masthead-search-renderer-input yt-uix-form-input-bidi" name="search_query" value="" type="text" placeholder="Type to search / Enter to add bookmark" title="Type to search / Enter to add bookmark"/>'+
                  '</div>'+
                '</div>'+
              '</div>'+

              '<div class="bookmarks-scrollbox yt-uix-scroller"></div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<button class="bookmark-panel-dismiss-btn yt-uix-button" type="button" aria-label="Close"></button>'+
      '</div>'
    );
  };

  _this.addBookmark = function(note) {
    _storage.addBookmark({
      note: note,
      timestamp: +new Date(),
      atTime: Math.floor(_this.video.currentTime)
    });

    _this.render(_storage.bookmarks);
  };

  _this.render = function(bookmarks) {
    $(Profile.bookmarksScrollbox).html("");
    _this.loadBookmarks(bookmarks);
  };

  _this.addMark = function(note, atTime, timestamp) {
    var mark = new Mark(note, atTime, timestamp);
    var moviePlayer = $(Profile.moviePlayer);
    var progressBar = $(Profile.progressBarList);

    mark.item
      .on({
        click: function(evt){
          if (_this.video && _this.video.currentTime) {
            _this.video.currentTime = evt.currentTarget.dataset.time;
            _this.video.play();
          }
        },
        mouseover: function(){
          mark.highlight();
          moviePlayer.removeClass(Profile.hideVideoControlClass);
        },
        mouseout: function(){
          mark.lightout();
        }
      })
      .on("click", Profile.bookmarkLineCloseBtn, function(e) {
        e.stopPropagation();
        mark.remove();
        _storage.removeBookmark(mark.timestamp);
      });

    mark
      .appendToBar(progressBar, _this.video.duration)
      .appendToList(_this.bookmarksScrollbox);
  };

  _this.initialize();

  return _this;
};

var Mark = function(note, atTime, timestamp) {
  this.atTime = atTime;
  this.bookmarkHighlightClass = "bookmark-highlight";
  this.item = this.createBookmarkLine(note, atTime);
  this.mark = this.createMarkOnProcessbar();
  this.note = note;
  this.timestamp = timestamp;
};

Mark.prototype.appendToBar = function(target, duration) {
  this.mark
    .css({ left: this.atTime * 100 / duration + "%" })
    .appendTo(target);

  return this;
};

Mark.prototype.highlight = function() {
  this.mark.addClass(this.bookmarkHighlightClass);
};

Mark.prototype.lightout = function() {
  this.mark.removeClass(this.bookmarkHighlightClass);
};

Mark.prototype.appendToList = function(target) {
  this.item.appendTo(target);

  return this;
};

Mark.prototype.remove = function(target) {
  this.item.remove();

  return this;
};

Mark.prototype.createBookmarkLine = function(note, atTime) {
  return $(
    '<div class="bookmark-line" data-time="' + atTime + '">'+
      '<div class="bookmark-line-time">' + displayTime(atTime) +'</div>'+
      '<div class="bookmark-line-text">' + note + '</div>'+
      '<div class="bookmark-line-close-btn"></div>'+
    '</div>'
  );
};

Mark.prototype.createMarkOnProcessbar = function() {
  return $('<div/>', {
    class: "bookmark-mark"
  });
};
