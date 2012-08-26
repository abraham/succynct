console.log('background.js');
/**
* Enable usage tracking
*/
var _gaq = _gaq || [];
_gaq.push(['_setAccount', config.get('googleAnalyticsAccount')]);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/**
* Create objects
*/
// TODO: move ratelimit to config
window.RateLimit = [];
window.account = new window.Account();
// window.mentions = new window.Stream({ url: 'https://alpha-api.app.net/stream/0/users/me/mentions' });
window.mentions = new Posts({
  url: 'https://alpha-api.app.net/stream/0/users/me/mentions',
  configName: 'mentionNotifications',
  configFrequencyName: 'mentionFrequency',
  configDefaultFrequencyName: 'defaultMentionFrequency',
  notificationType: 'mentions'
});
window.followers = new window.Followers({ url: 'https://alpha-api.app.net/stream/0/users/me/followers' });
// TODO: start tracking friends too
window.omniboxview = new window.OmniboxView();

/**
* Set attributes
*/
config.set('environment', 'background');
chrome.omnibox.setDefaultSuggestion({ description: 'Post to App.net <match>%s</match>' });

/**
* Wire events
*/
config.on('change:mentionNotifications', mentions.toggleNotifications);
config.on('change:mentionFrequency', mentions.changeFrequency);
chrome.extension.onMessage.addListener(onMessage);
chrome.omnibox.onInputEntered.addListener(window.omniboxview.onInputEntered);
chrome.omnibox.onInputChanged.addListener(window.omniboxview.onInputChanged);
mentions.on('reset', mentions.filterNewPosts);

if (localStorage.getItem('accessToken')) {
  window.account.set({ accessToken: localStorage.getItem('accessToken') });
  window.account.fetch();
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
mentions.update();
mentions.setInterval();

function onMessage(request, sender, sendResponse) {
  if (request.method === 'put' && request.action === 'oauth/authenticate') {
    window.account.set({ accessToken: localStorage.getItem('accessToken') });
    window.account.fetch();
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