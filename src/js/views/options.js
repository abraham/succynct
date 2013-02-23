console.log('views/options.js');


/**
 * Handle the UI for options.html
 */
var OptionsView = Backbone.View.extend({
  /**
   * Template for single account in list
   */
  template: function(account) {
    var html = '<li>';
    html += '<strong>' + account.username + '</strong> ';
    html += '<a href="https://alpha.app.net/' + account.username + '" target="_blank">' + account.name + '</a> ';
    html += '<button class="accounts-remove btn btn-mini btn-danger" type="button" data-action="remove" data-id="' + account.id + '">Remove</button>';
    // html += '<p>' + account.description.text + '</p>';
    return html + '</li>';
  },


  events: {
    "click .start-auth": "setAuthenticateHref",
    "click button.accounts-remove": 'removeAccount',
    'click input[type="checkbox"]': 'toggleCheckbox',
  },


  initialize: function() {
    console.log('views/options.js:initialize');
    _.bindAll(this);
    // this.listenTo(this.model, "change", this.render);
  },


  /**
   * Start rendering both options and accounts
   */
  render: function() {
    console.log('views/options.js:render');
    var that = this;
    that.$('#loader').fadeOut(function() {
      that.renderOptions();
      that.renderAccounts();
    });
  },


  /**
   * Render configured options
   */
  renderOptions: function() {
    var that = this;
    that.$('#options').fadeIn();
    return this;
  },


  /**
   * Render list of accounts
   */
  renderAccounts: function() {
    var that = this,
        html = '',
        accounts = that.collection.toJSON();
    that.$('#accounts').fadeIn();
    that.$('#accounts-list').empty().fadeOut();
    if (accounts.length === 0) {
      that.$('#accounts-add').fadeIn();
      return this;
    }
    for (index in accounts) {
      html += that.template(accounts[index]);
    }
    html += '<br><br><li class="muted" colspan="3">Support for multiple accounts coming soon</li>';
    that.$('#accounts-list').fadeIn();
    that.$('#accounts-list').html('<ul class="unstyled">' + html + '</ul>');
    return this;
  },


  /**
   * Remove account from list and from collection
   */
  removeAccount: function(event) {
    var id = $(event.currentTarget).data('id');
    this.collection.remove(id);
    this.renderAccounts();
    return this;
  },


  /**
   * Check to see if config and accounts data has been retrieved from chrome.storage
   */
  ready: function() {
    console.log('views ready');
    if (config.ready && accounts.ready) {
      this.render();
    }
  },


  /**
   * Set the href when a user clicks to add a new account
   */
  setAuthenticateHref: function(event) {
    url = 'https://account.app.net/oauth/authenticate'
      + '?client_id=' + config.get('clientId')
      + '&response_type=token'
      + '&redirect_uri=' + chrome.extension.getURL('/callback.html')
      + '&scope=' + config.get('apiScope');
    $(event.currentTarget).attr('href', url);
    // TODO: this is a bit of a hack
    // Redirects tend to cache weird for extension files so open and close tabs instead
    setTimeout(function() {
      window.close();
    }, 50)
  },


  toggleCheckbox: function(event) {
    
  },
});
