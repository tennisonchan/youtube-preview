var Storyboard = function(storyboardSpec) {
  var result = storyboardSpec.split('|');
  var baseUrl = result.shift();
  var index = result.length - 1;
  var resolution = result[index].split('#');

  this.init(resolution, baseUrl, index);

  console.log(this);
  return this;
};

Storyboard.prototype.init = function(resolution, baseUrl, index) {
  this.baseUrl = baseUrl;
  this.col = Number(resolution[4]);
  this.count = 0;
  this.el = null;
  this.resolution = resolution;
  this.frameWidth = Number(resolution[0]);
  this.frameHeight = Number(resolution[1]);
  this.height = Number(resolution[1]);
  this.index = index;
  this.ms = Number(resolution[5]);
  this.row = Number(resolution[3]);
  this.sigh = resolution[7];
  this.totalFrames = Number(resolution[2]);
  this.unit = resolution[6];
  this.width = Number(resolution[0]);
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

Storyboard.prototype.getScale = function() {
  const proportionWidth = this.frameWidth / this.width;
  const proportionHeight = this.frameHeight / this.height;
  return Math.min(proportionWidth, proportionHeight);
};

Storyboard.prototype.appendThumbTo = function(target) {
  if (!this.el) {
    const scale = this.getScale();
    const prevElment = target.prevAll('.no-preview, .storyboard');
    this.el = prevElment.length ? prevElment : $('<div/>', {
      class: 'storyboard'
    }).css({
      width: this.width * scale,
      height: this.height * scale,
      margin: 'auto',
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

Storyboard.prototype.url = function() {
  const $L = this.index;
  const $M = this.page();
  const $N = this.unit.replace('$M', $M);
  return this.baseUrl.replace(/\\/g, '').replace('$L', $L).replace('$N', $N) + '&sigh=' + this.sigh;
};

Storyboard.prototype.getPosition = function() {
  var row = this.row;
  const scale = this.getScale();

  if(this.maxPage === this.page() + 1) {
    var rest = this.totalFrames % (this.col * this.row);
    row = Math.ceil(rest / this.col);
  }
  return {
    scale,
    left: -1 * this.width * scale * (this.count % this.col),
    top: -1 * this.height * scale * (Math.floor((this.count / row)) % row),
    width: this.width * this.col * scale,
    height: this.height * row * scale,
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