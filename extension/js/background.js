console.log('background.js');


config.background = true;


/**
 * Create an app with the config and accounts
 */
app = new App({
  model: config,
  collection: accounts,
});
app.ready();
setTimeout(promptAuth, 15 * 1000);

/**
* Wire events
*/
config.on('change:frequency', app.changeInterval, app);
app.on('interval', interactions.checkForNew, interactions);
app.on('interval', mentions.checkForNew, mentions);
interactions.on('add', interactions.renderNotification, interactions);
mentions.on('add', mentions.renderNotification, mentions);
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.method == "post" && request.action == 'posts') {
      var post = new Post();
      var save = post.save({ text: request.data.text }, {
        headers: {
          'Authorization': 'Bearer ' + accounts.at(0).get('access_token')
        },
        success: post.success,
        error: post.error,
      });
      if (save == false) {
        post.error('Post length was too long.');
      }
    }
  });

/**
 * omnibox events
 */
chrome.omnibox.setDefaultSuggestion({ description: 'Post to App.net <match>%s</match>' });
chrome.omnibox.onInputEntered.addListener(window.omniboxview.onInputEntered);
chrome.omnibox.onInputChanged.addListener(window.omniboxview.onInputChanged);


/**
 * If there are no accounts, prompt for auth
 */
accounts.on('ready', function() {
  promptAuth();
});

function promptAuth() {
  if (accounts.length === 0) {
    var n = new TextNotificationView({
      url: accounts.buildAuthUrl(),
      title: 'Connect your App.net account',
      body: 'Click to connect your App.net account and get started with the awesomeness of Succynct.',
      image: chrome.extension.getURL('/img/angle.png')
    });
    n.render();
  }
}
