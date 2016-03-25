# YouTube Preview
A chrome extension shows likes and dislikes rating bar on all video thumbnail and previewing YouTube video like a gif, helping you decide if it is worth watching.
[Download from Chrome Store](https://chrome.google.com/webstore/detail/youtube-preview/gbkgikkleehfibaknfmdphhhacjfkdap)

### Screenshots
![YouTube Preview Demo](https://cloud.githubusercontent.com/assets/719938/11446392/23ac7314-9504-11e5-9e93-f97d7e61aedb.gif)

![youtube-preview-screenshots-1-640x400](https://cloud.githubusercontent.com/assets/719938/11464236/919846f8-96fa-11e5-8a8f-69210ddb1982.png)

### Setup
```sh
# Place your YouTube API key inside the env.js file
cp app/scripts.babel/env-example.js app/scripts.babel/env.js
npm install && bower install

# Re-compile the sources code automatically and Livereload(chromereload.js) reloads the extension
gulp watch

# Make a production version extension
gulp build
```

# Coming Soon
- [x] YouTube Bookmark.
  - Have you even need to mark an-hour-long videos and just want to jump right back those marks? I do!
  - For execution, first step would be let user to save their bookmark on videos locally. Then let user to share their bookmark so that others know where to get what they want!
