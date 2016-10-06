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
  if(!this.el) {
    this.el = $('<div/>', {
      class: 'no-preview',
      text: 'No Preview'
    })
    .css({
      lineHeight: this.frameheight + 'px',
      width: this.frameWidth,
      height: this.frameheight,
    }).insertBefore(target);
  }

  return this.el;
};

NoPreview.prototype.playingFrames = function(target) {
  return true;
};

NoPreview.prototype.reset = function() {
  this.count = 0;
};