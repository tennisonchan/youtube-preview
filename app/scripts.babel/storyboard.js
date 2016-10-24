var Storyboard = function(target) {
  this.baseUrl = null;
  this.col = null;
  this.count = null;
  this.el = null;
  this.frameheight = null;
  this.frameWidth = null;
  this.height = null;
  this.index = null;
  this.isPlaying = false;
  this.maxPage = null;
  this.ms = null;
  this.row = null;
  this.sigh = null;
  this.totalFrames = null;
  this.unit = null;
  this.width = null;
  this.isNoPreview = false;

  this.target = target;
  this.progressBar = new ProgressBar().insertAfter(target);
};

Storyboard.prototype.setStory = function({ isNoPreview, str, baseUrl, index }) {
  this.completeLoading();

  if (isNoPreview) {
    this.isNoPreview = true;

    return this;
  }

  var arr = str.split('#');

  this.baseUrl = baseUrl;
  this.col = Number(arr[4]);
  this.count = 0;
  this.frameheight = Number(arr[1]);
  this.frameWidth = Number(arr[0]);
  this.height = Number(arr[1]);
  this.index = index;
  this.ms = Number(arr[5]);
  this.row = Number(arr[3]);
  this.sigh = arr[7];
  this.totalFrames = Number(arr[2]);
  this.unit = arr[6];
  this.width = Number(arr[0]);
  this.isPlaying = false;

  this.maxPage = Math.ceil(this.totalFrames / (this.row * this.col));

  return this;
};

Storyboard.prototype.set = function(key, value) {
  if (key !== undefined && value !== undefined) {
    this[key] = value;
  }
  return this;
};

Storyboard.prototype.appendThumbTo = function() {
  if (!this.el &&
      this.target.prevAll('.no-preview, .storyboard').length === 0) {

    if(this.isNoPreview) {
      this.el = $('<div/>', {
        class: 'no-preview',
        text: 'No Preview'
      })
      .css({
        lineHeight: this.frameheight + 'px',
        width: this.frameWidth,
        height: this.frameheight,
      }).insertBefore(this.target);
    } else {
      this.el = $('<div/>', {
        class: 'storyboard'
      })
      .css({
        width: this.frameWidth,
        height: this.frameheight,
      })
      .insertBefore(this.target);
    }
  }

  return this.el;
};

Storyboard.prototype.playingFrames = function(target) {
  if (!this.el || this.isNoPreview) return false;

  var pos = this.getPosition();
  this.el.css({
    backgroundImage: 'url(' + this.url() + ')',
    backgroundPosition: pos.left + 'px ' + pos.top + 'px',
    backgroundSize: pos.width + 'px ' + pos.height + 'px'
  });

  this.increaseCount();
  this.progressBar.update(this.count / this.totalFrames);

  return true;
};

Storyboard.prototype.page = function() {
  var page = Math.floor(this.count / (this.col * this.row));
  return page % this.maxPage;
};

Storyboard.prototype.url = function(l, m) {
  l = this.index || 2;
  m = m || this.page();
  return this.baseUrl.replace(/\\/g, '').replace('$L', l).replace('$N', 'M' + m) + '?sigh=' + this.sigh;
};

Storyboard.prototype.getPosition = function() {
  console.log('getPosition', this.count);
  var row = this.row;
  if(this.maxPage === this.page() + 1) {
    var rest = this.totalFrames % (this.col * this.row);
    row = Math.ceil(rest / this.col);
  }
  return {
    left: -1 * this.frameWidth * (this.count % this.col),
    top: -1 * this.frameheight * (Math.floor((this.count / row)) % row),
    width: (this.frameWidth * (this.width * this.col) / this.width),
    height: (this.frameheight * row)
  };
};

Storyboard.prototype.increaseCount = function() {
  this.count = (this.count + 1) % this.totalFrames;
  return this.count;
};

Storyboard.prototype.reset = function() {
  this.count = 0;
};

Storyboard.prototype.completeLoading = function() {
  this.progressBar.completeLoading();
};

Storyboard.prototype.setFrame = function(progress) {
  this.count = Math.floor(this.totalFrames * progress);
};