/**
 * Handle config and automatically sync to other Chrome profiles
 *
 * Listens for changes to chrome.storage.sync coming from other envirements/computers,
 * overrides the changes with the blacklist. Automatically saves changes to chrome.storage.sync
 * after being overridden with the blacklist.
 */
window.Config = Backbone.Model.extend({


  /**
   * Convenience to know if chrome.storage values have been retrieved yet
   */
  ready: false,
  
  
  /**
   * If true, context is the background
   */
  background: false,

  /**
   * Blacklist of values that are not user changeable
   */
  blacklist: {
    clientId: 'Yfqy8sQ6DthWrqnpAyrK9aqSAR7gDcJd', // Succynct
    googleAnalyticsAccount: 'UA-2706568-45',
    authorizeBaseUrl: 'https://account.app.net/oauth/authorize',
    authenticateBaseUrl: 'https://account.app.net/oauth/authenticate',
    accessTokenUrl: 'https://account.app.net/oauth/access_token',
    apiBaseUrl: 'https://alpha-api.app.net',
    baseUrl: 'https://alpha.app.net',
    apiScope: 'basic,stream,email,write_post,follow,public_messages,messages',
  },


  /**
   * Default values that are user changeable
   */
  defaults: {
    frequency: 15,
    autoDismissDelay: 10,
    actions: true,
    autoDismiss: true,
    actionsFollow: true,
    actionsStar: true,
    actionsRepost: true,
    actionsMention: true,
    messages: false,
  },


  initialize: function() {
    // Set up `this` to work in every method
    _.bindAll(this);
    // When the model changes override blacklist values
    this.on('change', this.override);
    this.override();
    // Listen for changes to chrome.storage and propigate to model
    chrome.storage.onChanged.addListener(this.setChomeChangesToModel);
    // Get current values from chrome.storage
    this.getFromChrome();
    // On change save new values to chrome.storage
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
    this.ready = true;
    this.trigger('ready');
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
   *
   * Trigger at most once every five seconds
   */
   setModelChangesToChrome: _.debounce(function(model, options) {
    console.log('config.setModelChangesToChrome:set', model, options);
    chrome.storage.sync.set({'config': this.attributes});
  }, 1 * 1000),
});


window.config = new Config();
