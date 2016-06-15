chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == 'install'){
      var thisVersion = chrome.runtime.getManifest().version;
      chrome.tabs.create({ url: 'options.html' });
    }
});