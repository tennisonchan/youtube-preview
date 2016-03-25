(function($) {

var timeInterval;
var frame = 0;

$(function(){
  restore_options();
});

function restore_options() {
  chrome.storage.sync.get({
    previewInterval: 200
  }, function(data) {
    var previewInterval = Number(data.previewInterval);
    clearInterval(timeInterval);
    timeInterval = setInterval(animate, previewInterval);
    $('#preview-intervals-slide').val(previewInterval);
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
    backgroundPosition: '-'+ leftPosition +'px -'+ topPosition +'px',
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
    save_option('previewInterval', this.value, 'Saved preview interval as ' + this.value + ' ms.');
  });

})(jQuery);
