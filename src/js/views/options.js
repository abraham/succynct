console.log('views/options.js');


/**
 * Handle the UI for options.html
 */
var OptionsView = Backbone.View.extend({
  /**
   * Template for single account in list
   * Doesn't use a template due to CSP restrictions
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
    'click input[type="checkbox"]': 'setCheckboxs',
    'change input[type="number"]': 'setNumbers',
    'keyup input[type="number"]': 'setNumbers',
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
    $('input[type="checkbox"]').each(function(index, element) {
      var $element = $(element);
      var name = $element.data('name');
      console.log(name, that.model.get(name));
      $element.prop('checked', that.model.get(name));
    });
    $('input[type="number"]').each(function(index, element) {
      var $element = $(element);
      var name = $element.data('name');
      console.log(name, that.model.get(name));
      $element.prop('value', that.model.get(name));
    });
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
    html += '<br><br><li class="muted" colspan="3">Support for multiple accounts coming soon.</li>';
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
    var url = this.collection.buildAuthUrl();
    $(event.currentTarget).attr('href', url);
    // TODO: this is a bit of a hack
    // Redirects tend to cache weird for extension files so open and close tabs instead
    setTimeout(function() {
      window.close();
    }, 50)
  },


  /**
   * Set checkbox values to config model
   */
  setCheckboxs: function(event) {
    var name = $(event.currentTarget).data('name');
    var value = $(event.currentTarget).prop('checked');
    this.model.set(name, value);
    return this;
  },


  /**
   * Set number values to config model
   */
   setNumbers: function(event) {
     var name = $(event.currentTarget).data('name');
     var value = $(event.currentTarget).prop('value');
     this.model.set(name, parseInt(value));
     console.log(name, value);
     return this;
   }


});
