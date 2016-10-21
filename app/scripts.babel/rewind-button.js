var RewindButton = function(Profile) {
  var _this = {
    el: null,
    video: null
  };

  function initialize(Profile) {
    _this.video = Profile.getMainVideo(document).get(0);
  }

  _this.create = function(target) {
    $.ajax(chrome.extension.getURL('rewind-button.html'))
      .then(function(el) {
        if ($(Profile.ytpRewindButton).length === 0) {
          _this.el = $(el).on({
            click: function() {
              _this.video.currentTime = _this.video.currentTime - 10;
              _this.video.play();
            }
          }).appendTo(target);
        }
      });
  };

  _this.remove = function() {
    _this.el.remove();
  };

  initialize(Profile);

  return _this;
};
