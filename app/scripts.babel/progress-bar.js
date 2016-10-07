var ProgressBar = function() {
  this.el = null;
  this.scrubber = null;
  this.progress = 0;
}

ProgressBar.prototype.getElement = function() {
  if (!this.el) {
    this.scrubber = $('<div/>', {
      class: 'scrubbed',
    }).css({ width: (this.progress * 100) + '%' })


    this.el = $('<div/>', {
      class: 'scrubber'
    }).wrapInner(this.scrubber);
  }

  return this.el;
};

ProgressBar.prototype.update = function(progress) {
  this.progress = progress;

  console.log('hello', progress);

  this.scrubber.css({
    width: (this.progress * 100) + '%'
  });
};
