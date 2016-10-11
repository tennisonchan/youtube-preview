var RewindButton = function(Profile) {
  var _this = {
    el: null,
    video: null
  };

  function initialize(Profile) {
    _this.video = Profile.getMainVideo(document).get(0);
  }

  _this.create = function(target) {
    $.ajax(chrome.extension.getURL('rewind-button.html')).then((el) => {
      _this.el = $(el).on({
        click: function() {
          console.log('hello');
          _this.video.currentTime = _this.video.currentTime - 10;
          _this.video.play();
        }
      }).appendTo(target);
    });
  };

  initialize(Profile);

  return _this;
};
