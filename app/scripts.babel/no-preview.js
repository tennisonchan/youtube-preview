var NoPreview = function() {
  this.el = null;
  this.frameheight = 0;
  this.frameWidth = 0;
  this.height = 0;
  this.width = 0;
  this.isNoPreview = true;

  return this;
};

NoPreview.prototype.set = function(key, value) {
  if (key !== undefined && value !== undefined) {
    this[key] = value;
  }
  return this;
};

NoPreview.prototype.url = function(l, m) {
  return '#';
};

NoPreview.prototype.appendThumbTo = function(target) {
   var overlay = $('<div/>', {
      class: 'no-preview',
      text: 'No Preview'
    })
    .css({
      lineHeight: this.frameheight + 'px',
      width: this.frameWidth,
      height: this.frameheight,
    }).insertBefore(target);

  // overlay.append($('<span/>', {
  //   text: 'No Preview'
  // }))

  this.el = overlay;
  return this.el;
};

NoPreview.prototype.playingFrames = function(target) {
  return true;
};

NoPreview.prototype.remove = function() {
  this.count = 0;
  this.el && this.el.remove();
  this.el = null;
};