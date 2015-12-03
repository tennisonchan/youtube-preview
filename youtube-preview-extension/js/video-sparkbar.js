var VideoSparkbar = function(id, statistics) {
  this.id = id;
  this.viewCount = Number(statistics.viewCount);
  this.likeCount = Number(statistics.likeCount);
  this.dislikeCount = Number(statistics.dislikeCount);
  this.favoriteCount = Number(statistics.favoriteCount);
  this.commentCount = Number(statistics.commentCount);
};

VideoSparkbar.prototype.appendRatingTo = function(target) {
  if (target.length) {
    var sparkbar = this.createSparkbar();
    sparkbar.insertAfter(target);
  }
};

VideoSparkbar.prototype.createSparkbar = function() {
  var ratingCount = this.likeCount + this.dislikeCount;
  var likesWidth = (this.likeCount * 100 / ratingCount);

  return $("<div/>", { class: "preview-sparkbars" })
    .append($("<div/>", { class: "preview-sparkbar-likes", style: "width: "+likesWidth+"%;"}))
    .append($("<div/>", { class: "preview-sparkbar-dislikes", style: "width: "+(100-likesWidth)+"%;"}));
};
