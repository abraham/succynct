console.log('background.js');
window.RateLimit = [];
window.env = 'background';

window.account = new window.Account();
if (localStorage.getItem('accessToken')) {
  window.account.set({ accessToken: localStorage.getItem('accessToken') });
} else {
  chrome.tabs.create({ url: chrome.extension.getURL('options.html') });
}

window.mentions = new window.Stream({ url: 'https://alpha-api.app.net/stream/0/users/me/mentions' });
window.followers = new window.Followers({ url: 'https://alpha-api.app.net/stream/0/users/me/followers' });

window.omniboxview = new window.OmniboxView();

function onMessage(request, sender, sendResponse) {
  if (request.method === 'put' && request.action === 'oauth/authenticate') {
    window.account.set({ accessToken: localStorage.getItem('accessToken') });
    window.account.fetch();
    sendResponse({ });
  } else if (request.method === 'post' && request.action === 'posts'){
    var post = new Post({ text: request.data.status });
    post.save();
    sendResponse({ });
  } else {
    sendResponse({ });
  }
}

chrome.extension.onMessage.addListener(onMessage);
chrome.omnibox.setDefaultSuggestion({ description: 'Post to App.net <match>%s</match>' });
chrome.omnibox.onInputEntered.addListener(window.omniboxview.onInputEntered);
chrome.omnibox.onInputChanged.addListener(window.omniboxview.onInputChanged);