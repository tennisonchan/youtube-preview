(function(window){

var Preview = window.Preview;

Preview.Storyboard = function (str, baseUrl) {
  var arr = str.split("#");

  this.baseUrl = baseUrl;
  this.width = Number(arr[0]);
  this.height = Number(arr[1]);
  this.frameWidth = Number(arr[0]);
  this.frameheight = Number(arr[1]);
  this.totalFrames = Number(arr[2]);
  this.row = Number(arr[3]);
  this.col = Number(arr[4]);
  this.ms = Number(arr[5]);
  this.unit = arr[6];
  this.sigh = arr[7];
  this.maxPage = Math.ceil(this.totalFrames/ (this.row * this.col));
  this.count = 0;

  return this;
};

Preview.Storyboard.prototype.page = function() {
  var page = Math.floor(this.count / (this.col * this.row));
  return page % this.maxPage;
};

Preview.Storyboard.prototype.url = function(l, m) {
  l = l || 2;
  m = m || this.page();
  return this.baseUrl.replace(/\\/g, "").replace("$L", l).replace("$N", "M" + m) + "?sigh=" + this.sigh;
};

Preview.Storyboard.prototype.getPosition = function() {
  return {
    left: -1 * this.frameWidth * (this.count % this.col),
    top: -1 * this.frameheight * (Math.floor((this.count / this.row)) % this.row),
    width: (this.frameWidth * (this.width * this.col) / this.width),
    height: (this.frameheight * (this.height * this.row) / this.height)
  };
};

Preview.Storyboard.prototype.increaseCount = function() {
  this.count = (this.count + 1) % this.totalFrames;
  return this.count;
};

})(window);