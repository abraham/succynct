/**
 * Handle config and automatically sync to other Chrome profiles
 */
window.Config = Backbone.Model.extend({
  /**
   * Blacklist of values that should never be user changeable
   */
  blacklist: {
    clientId: 'UnSbSEb6EFHUZt3ygTwPSTdcdGd8Lvey',
    googleAnalyticsAccount: 'UA-2706568-45',
    authorizeUrl: 'https://alpha.app.net/oauth/authenticate',
    accessTokenUrl: 'https://alpha.app.net/oauth/access_token',
    apiBaseUrl: 'https://alpha-api.app.net',
    baseUrl: 'https://alpha.app.net',
    apiScope: 'stream,write_post,follow,messages',
  },


  defaults: {
    apiRequestFrequency: 15 * 1000,
    apiFollowersRequestFrequency: 15 * 60 * 1000,
    mentionNotifications: true,
    defaultMentionFrequency: 15 * 1000,
    followerNotifications: true,
    defaultFollowerFrequency: 15 * 60 * 1000,
    autoDismissNotifications: false,
  },


  initialize: function() {
    _.bindAll(this);
    this.on('change', this.override);
    this.override();
    chrome.storage.onChanged.addListener(this.setChomeChangesToModel);
    this.getFromChrome();
    this.on('change', this.setModelChangesToChrome);
  },


  /**
   * Override config with values that should not change
   */
  override: function() {
    this.set(this.blacklist);
  },


  /**
   * Get config values from chrome.storage.sync
   */
  getFromChrome: function() {
    console.log('config.getFromChrome');
    chrome.storage.sync.get('config', this.getFromChromeCallback);
  },


  /**
   * Set changes of chrome.storage.sync to config model
   */
  getFromChromeCallback: function(items){
    console.log('config.getFromChromeCallback', items);
    this.set(items['config']);
  },


  /**
   * Set changes of chrome.storage.sync to config model
   */
  setChomeChangesToModel: function(changes, ns) {
    console.log('config.setChomeChangesToModel', changes, ns);
    // Ignore local changes
    if (ns != 'sync') {
      return this;
    }
    if (changes['config']) {
      console.log('config.setChomeChangesToModel:set', changes['config']);
      this.set(changes['config'].newValue);
    }
  },


  /**
   * Set changes of config model to chrome.storage.sync
   */
  setModelChangesToChrome: function(model, options) {
    console.log('config.setModelChangesToChrome', model, options);
    chrome.storage.sync.set({'config': this.attributes});
  },
});


window.config = new Config();
