# YouTube Preview
A chrome extension shows likes and dislikes rating bar on all video thumbnail and previewing YouTube video like a gif, helping you decide if it is worth watching.
[Download from Chrome Store](https://chrome.google.com/webstore/detail/youtube-preview/gbkgikkleehfibaknfmdphhhacjfkdap)

### Screenshots
![YouTube Preview Demo](https://cloud.githubusercontent.com/assets/719938/11446392/23ac7314-9504-11e5-9e93-f97d7e61aedb.gif)

![youtube-preview-screenshots-1-640x400](https://cloud.githubusercontent.com/assets/719938/11464236/919846f8-96fa-11e5-8a8f-69210ddb1982.png)

### Setup
Run the commands below and then place your YouTube API key inside that file:
```bash
cp youtube-preview-extension/js/env-example.js youtube-preview-extension/js/env.js
npm install
```

To generate a minified version of the extension:
```bash
grunt
```

To generate a zip file of the minified extension:
```bash
grunt pack
```

# Coming Soon
- [ ] YouTube Bookmark.
  - Have you even need to mark an-hour-long videos and just want to jump right back those marks? I do!
  - For execution, first step would be let user to save their bookmark on videos locally. Then let user to share their bookmark so that others know where to get what they want!