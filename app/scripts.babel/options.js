(function($) {

  var timeInterval;
  var frame = 0;

  $(function() {
    restore_options();
  });

  function restore_options() {
    chrome.storage.sync.get({
      previewInterval: 200,
      showRatingBar: true
    }, function(data) {
      var previewInterval = Number(data.previewInterval);
      var showRatingBar = Boolean(data.showRatingBar);
      clearInterval(timeInterval);
      timeInterval = setInterval(animate, previewInterval);
      $('#preview-intervals-slide').val(previewInterval);
      $('#rating-bar-switch').prop('checked', showRatingBar);
      if (showRatingBar) {
        $('.rating-bar').addClass('on');
      }
    });
  }

  function save_option(key, value, message) {
    var data = {};

    data[key] = value;

    chrome.storage.sync.set(data, function() {
      $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
        message: message || 'Saved!',
        timeout: 1000
      });
    });
  }

  function animate() {
    var topPosition = (frame % 16 / 4 | 0) * 236.5;
    var leftPosition = (frame % 16 % 4) * 322;

    $('.animated-background').css({
      backgroundPosition: '-' + leftPosition + 'px -' + topPosition + 'px',
    });

    frame++;
  }

  $('#preview-intervals-slide')
    .on('input', function(e) {
      clearInterval(timeInterval);
      timeInterval = setInterval(animate, this.value);
    })
    .on('change', function() {
      console.log('previewInterval', this.value);
      save_option('previewInterval', this.value, 'Saved preview interval as ' + this.value + ' ms');
    });

  $('#rating-bar-switch')
    .on('change', function() {
      console.log('showRatingBar', this.checked);
      let message = this.checked ? 'Show rating bar' : 'Hide rating bar';
      $('.rating-bar').toggleClass('on', this.checked);
      save_option('showRatingBar', this.checked, message);
    });

})(jQuery);