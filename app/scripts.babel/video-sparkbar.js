var VideoSparkbar = function(id, statistics) {
  this.id = id;
  this.viewCount = Number(statistics.viewCount);
  this.likeCount = Number(statistics.likeCount) || 0;
  this.dislikeCount = Number(statistics.dislikeCount) || 0;
  this.ratingCount = this.likeCount + this.dislikeCount;
  this.favoriteCount = Number(statistics.favoriteCount);
  this.commentCount = Number(statistics.commentCount);
};

VideoSparkbar.prototype.appendRatingTo = function($target) {
  if (!$target.length || !this.ratingCount) return;

  var sparkbar = this.createSparkbar();
  this.upsertSparkbar($target, sparkbar);

  setTimeout(function() {
    sparkbar.removeClass('loading');
  }, 500);
};

VideoSparkbar.prototype.upsertSparkbar = function ($target, sparkbar) {
  if($target.siblings('.preview-sparkbars').length) {
    $target.siblings('.preview-sparkbars').replaceWith(sparkbar);
  } else {
    $target.after(sparkbar);
  }
};

VideoSparkbar.prototype.createSparkbar = function() {
  var likesWidth = (this.likeCount * 100 / this.ratingCount);

  return $('<div/>', {
      class: 'preview-sparkbars loading'
    })
    .append($('<div/>', {
      class: 'preview-sparkbar-likes',
      style: 'width: ' + likesWidth + '%;'
    }))
    .append($('<div/>', {
      class: 'preview-sparkbar-dislikes',
      style: 'width: ' + (100 - likesWidth) + '%;'
    }));
};