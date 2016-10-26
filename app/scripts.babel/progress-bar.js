var ProgressBar = function() {
  this.el = null;
  this.scrubber = null;
  this.progress = 0;
}

ProgressBar.prototype.getElement = function() {
  if (!this.el) {
    this.scrubber = $('<div/>', {
      class: 'preview-scrubbed',
    }).css({ width: (this.progress * 100) + '%' })


    this.el = $('<div/>', {
      class: 'preview-scrubber loading'
    })
    .wrapInner(this.scrubber);
  }

  return this.el;
};

ProgressBar.prototype.update = function(progress) {
  this.progress = progress;

  this.scrubber.css({
    width: (this.progress * 100) + '%'
  });
};
