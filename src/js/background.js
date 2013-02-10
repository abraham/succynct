console.log('background.js');

/**
* Upgrade old extensions to use chrome.storage.sync
* TODO: Remove after October 2012
*/
if (localStorage.getItem('accessToken')) {
  console.log('upgrade');
  chrome.storage.sync.set({'accessToken': localStorage.getItem('accessToken')});
  // TODO: pick up extra localStorage data if needed
  // TODO: clear localStorage
  // localStorage.clear();
}

/**
* Create objects
*/
omniboxview = new OmniboxView();
account = new Account();
followers = new Accounts({
  url: 'https://alpha-api.app.net/stream/0/users/me/followers',
  configName: 'followerNotifications',
  configFrequencyName: 'followerFrequency',
  configDefaultFrequencyName: 'defaultFollowerFrequency',
  notificationType: 'followers'
});
// TODO: start tracking friends too
window.mentions = new Posts({
  url: 'https://alpha-api.app.net/stream/0/users/me/mentions',
  configName: 'mentionNotifications',
  configFrequencyName: 'mentionFrequency',
  configDefaultFrequencyName: 'defaultMentionFrequency',
  notificationType: 'mentions'
});

/**
* Set attributes
*/
config.set('environment', 'background');
chrome.omnibox.setDefaultSuggestion({ description: 'Post to App.net <match>%s</match>' });

/**
* Wire events
*/
account.on('change:accessToken', account.fetch);
config.on('change:mentionNotifications', mentions.toggleNotifications);
config.on('change:mentionFrequency', mentions.changeFrequency);
chrome.extension.onMessage.addListener(onMessage);
chrome.omnibox.onInputEntered.addListener(window.omniboxview.onInputEntered);
chrome.omnibox.onInputChanged.addListener(window.omniboxview.onInputChanged);
mentions.on('reset', mentions.filterNewPosts);
followers.on('reset', followers.filterNewFollowers);

// TODO: update to use chrome.storage
function onMessage(request, sender, sendResponse) {
  if (request.method === 'put' && request.action === 'oauth/authenticate') {
    window.account.set({ accessToken: localStorage.getItem('accessToken') });
    // window.account.fetch();
    sendResponse({ });
  } else if (request.method === 'post' && request.action === 'posts'){
    var post = new Post({ text: request.data.status });
    post.save();
    sendResponse({ });
  } else if (request.method === 'get' && request.action === 'options'){
    sendResponse(config.attributes);
  } else if (request.method === 'put' && request.action === 'options'){
    config.set(request.data);
    // TODO: save options to localStorage
    sendResponse({ });
  } else {
    sendResponse({ });
  }
}

chrome.storage.sync.get(null, function(items) {
  if (items.accessToken) {
    account.set({ accessToken: items.accessToken }, { silent: true });
    // Manually calling because for some reason parse isn't working with on('change:accessToken')
    account.fetch();
  } else {
    var n = new TextNotificationView({
      url: account.buildAuthUrl(),
      title: 'Authenticate with your App.net account',
      body: 'Click here to authenticate your App.net account and get started with Succynct.',
      image: chrome.extension.getURL('/img/angle.png')
    });
    n.render();
  }
  /**
  * Enable features
  */
  mentions.update().setInterval();
  followers.update().setInterval();
  config.saveRateLimit().setInterval();
});

// if (localStorage.getItem('accessToken')) {
//   window.account.set({ accessToken: localStorage.getItem('accessToken') });
//   window.account.fetch();
// } else {
//   var n = new TextNotificationView({
//     url: account.buildAuthUrl(),
//     title: 'Authenticate with your App.net account',
//     body: 'Click here to authenticate your App.net account and get started with Succynct.',
//     image: chrome.extension.getURL('/img/angle.png')
//   });
//   n.render();
// }