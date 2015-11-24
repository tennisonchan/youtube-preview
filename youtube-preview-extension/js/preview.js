(function($){

"use strict";

var Preview = {
  currentPage: 0,
  interval: 200,
  mouseover: false,
  initialize: function() {
    $("a[href^='/watch']")
      .mouseenter(this.mouseEnterEvent)
      .mouseleave(this.mouseLeaveEvent);
  },
  mouseEnterEvent: function() {
    Preview.mouseover = true;
    var obj = $(this);
    $.ajax({
      dataType: "html",
      url: obj.attr("href"),
      success: function(html) {
        var l2 = Preview.getStoryboardDetails(html)[2];
        var width = l2.width, height = l2.height;
        var el = obj.find("img").get(0);
        var thumb = obj.find(".yt-thumb");
        if (thumb.length) {
          l2.width = thumb.width();
          l2.height = thumb.height();
          thumb.css({ width: l2.width, height: l2.height, overflow: "hidden" });
        }

        el.src = l2.url();
        el.onload = function(e) {
          $(el).css({
            width: (l2.width * this.naturalWidth / width),
            height: (l2.height * this.naturalHeight / height),
            position: "relative"
          });
          setTimeout(function(){ Preview.framesPlaying(el, l2); }, Preview.interval);
        };
      }
    });
  },
  mouseLeaveEvent: function(){
    console.log("mouseleave");
    Preview.mouseover = false;
  },
  getStoryboardDetails: function(data) {
    var l = {}, url;
    var getStoryboardRegExp = new RegExp("\"storyboard_spec\": ?\"(.*?)\"", "g");
    var storyboard_spec = getStoryboardRegExp.exec(data);
    var result = storyboard_spec[1].split("|");
    url = result.shift();

    for(var i = 1; i < result.length; i++){
      l[i] = new Preview.Storyboard(result[i], url);
    }
    console.log("l", l);

    return l;
  },
  framesPlaying: function (el, data) {
    if (data.page() !== Preview.currentPage) {
      Preview.currentPage = data.page();
      el.src = data.url();
      el.onload = function() {
        setTimeout(function(){ Preview.framesPlaying(el, data); }, Preview.interval);
      };
      return false;
    }

    $(el).css({
      left: -1 * data.width * (data.count % data.col),
      top: -1 * data.height * (Math.floor((data.count / data.row)) % data.row)
    });
    data.count += 1;
    if(Preview.mouseover) {
      setTimeout(function(){ Preview.framesPlaying(el, data); }, Preview.interval);
    }
  }

};

Preview.Storyboard = function (str, baseUrl) {
  var arr = str.split("#");

  this.baseUrl = baseUrl;
  this.width = arr[0];
  this.height = arr[1];
  this.totalFrames = arr[2];
  this.row = arr[3];
  this.col = arr[4];
  this.ms = arr[5];
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

Preview.initialize();

}(jQuery));