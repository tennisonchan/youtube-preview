# YouTube Preview
A chrome extension shows likes and dislikes rating bar on all video thumbnail and previewing YouTube video like a gif, helping you decide if it is worth watching.
[Download from Chrome Store](https://chrome.google.com/webstore/detail/youtube-preview/gbkgikkleehfibaknfmdphhhacjfkdap?utm_source=github)

Youtube just got easier. Fast-forward through videos all before you have to watch the complete video.  Jump to your favorite parts in a preview motion. Not to mention you can even rewind in 10-second intervals!

## Features
- Speed through Youtube Videos. Jump to your favorite part, even fast-forward to your favorite part, all before you have to watch the complete video.

[![YouTube Preview Demo](https://raw.githubusercontent.com/tennisonchan/youtube-preview/78ed272/assets/rainbow-cat-demo.gif)](https://chrome.google.com/webstore/detail/youtube-preview/gbkgikkleehfibaknfmdphhhacjfkdap?utm_source=github&utm_campaign=demo)

- Rating (Like / Dislike) bar. Look at the rating bar beforehand so you don't have to waste your time.

[![YouTube Preview Demo](https://raw.githubusercontent.com/tennisonchan/youtube-preview/78ed272/assets/funny-cat-rating-bar.png)](https://chrome.google.com/webstore/detail/youtube-preview/gbkgikkleehfibaknfmdphhhacjfkdap?utm_source=github&utm_campaign=demo)

- Rewind in 10-second intervals

[![YouTube Preview Demo](https://raw.githubusercontent.com/tennisonchan/youtube-preview/78ed272/assets/obama-10-sec-rewind-button.png)](https://chrome.google.com/webstore/detail/youtube-preview/gbkgikkleehfibaknfmdphhhacjfkdap?utm_source=github&utm_campaign=demo)

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
