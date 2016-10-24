var ProgressBar = function() {
  this.el = null;
  this.scrubber = null;
  this.progress = 0;
  this.complete = false;
}

ProgressBar.prototype.insertAfter = function(target) {
  this.getElement().insertAfter(target);

  return this;
};

ProgressBar.prototype.getElement = function() {
  if (!this.el) {
    this.scrubber = $('<div/>', {
      class: 'preview-scrubbed'
    }).css({ width: (this.progress * 100) + '%' })

    this.el = $('<div/>', {
      class: 'preview-scrubber preview-scrubber-loading'
    })
    .wrapInner(this.scrubber);
  }

  return this.el;
};

ProgressBar.prototype.completeLoading = function() {
  if (!this.el) {
    this.getElement();
  }
  this.complete = true;
  this.el.removeClass('preview-scrubber-loading');
};

ProgressBar.prototype.update = function(progress) {
  this.progress = progress;

  this.scrubber.css({
    width: (this.progress * 100) + '%'
  });
};
