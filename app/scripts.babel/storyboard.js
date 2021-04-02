var Storyboard = function(storyboardSpec) {
  var result = storyboardSpec.split('|');
  var baseUrl = result.shift();
  var index = result.length - 1;
  var arr = result[index].split('#');

  this.init(arr, baseUrl, index);

  return this;
};

Storyboard.prototype.init = function(arr, baseUrl, index) {
  this.baseUrl = baseUrl;
  this.col = Number(arr[4]);
  this.count = 0;
  this.el = null;
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
  this.progressBar = null;
  this.isPlaying = false;

  this.maxPage = Math.ceil(this.totalFrames / (this.row * this.col));
};

Storyboard.prototype.set = function(key, value) {
  if (key !== undefined && value !== undefined) {
    this[key] = value;
  }
  return this;
};

Storyboard.prototype.appendThumbTo = function(target) {
  if (!this.el) {
    const prevElment = target.prevAll('.no-preview, .storyboard');
    this.el = prevElment.length ? prevElment : $('<div/>', {
      class: 'storyboard'
    }).css({
      width: this.frameWidth,
      height: this.frameheight,
    });
    
    this.el
      .append(this.getProgressBar().getElement())
      .insertBefore(target);
  }

  return this.el;
};

Storyboard.prototype.playingFrames = function() {
  if (!this.el) return false;

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
  return this.baseUrl.replace(/\\/g, '').replace('$L', l).replace('$N', 'M' + m) + '&sigh=' + this.sigh;
};

Storyboard.prototype.getPosition = function() {
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

Storyboard.prototype.getProgressBar = function() {
  if(!this.progressBar) {
    this.progressBar = new ProgressBar();
  }

  return this.progressBar;
};

Storyboard.prototype.setFrame = function(progress) {
  this.count = Math.floor(this.totalFrames * progress);
};