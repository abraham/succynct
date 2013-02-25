console.log('background.js');


config.background = true;


/**
 * Create an app with the config and accounts
 */
app = new App({
  model: config,
  collection: accounts,
});


/**
* Wire events
*/
config.on('ready', app.ready);
accounts.on('ready', app.ready);
config.on('change:frequency', app.changeInterval);
app.on('interval', interactions.checkForNew);
app.on('interval', mentions.checkForNew);
interactions.on('add', interactions.renderNotification);
mentions.on('add', mentions.renderNotification);


/**
 * omnibox events
 */
chrome.omnibox.setDefaultSuggestion({ description: 'Post to App.net <match>%s</match>' });
chrome.omnibox.onInputEntered.addListener(window.omniboxview.onInputEntered);
chrome.omnibox.onInputChanged.addListener(window.omniboxview.onInputChanged);



// var n = new TextNotificationView({
//   url: account.buildAuthUrl(),
//   title: 'Connect your App.net account',
//   body: 'Click here to connect your App.net account and get started with the awesomeness of Succynct.',
//   image: chrome.extension.getURL('/img/angle.png')
// });
// n.render();