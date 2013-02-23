console.log('views/options.js');


var OptionsView = Backbone.View.extend({
  template: function(account) {
    var html = '<li>';
    html += '<strong>' + account.username + '</strong> ';
    html += '<a href="https://alpha.app.net/' + account.username + '" target="_blank">' + account.name + '</a> ';
    html += '<button class="btn btn-mini btn-danger" type="button">Remove</button>';
    // html += '<p>' + account.description.text + '</p>';
    return html + '</li>';
  },


  events: {
    "click .start-auth": "setAuthenticateHref",
    // "click .button.edit":   "openEditDialog",
    // "click .button.delete": "destroy"
  },


  initialize: function() {
    console.log('views/options.js:initialize');
    _.bindAll(this);
    // this.listenTo(this.model, "change", this.render);
  },


  render: function() {
    console.log('views/options.js:render');
    var that = this;
    that.$('#loader').fadeOut(function() {
      that.renderOptions();
      that.renderAccounts();
    });
  },


  renderOptions: function() {
    var that = this;
    that.$('#options').fadeIn();
    return this;
  },


  renderAccounts: function() {
    var that = this,
        html = '',
        accounts = that.collection.toJSON();
    that.$('#accounts').fadeIn();
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


  ready: function() {
    console.log('views ready');
    if (config.ready && accounts.ready) {
      this.render();
    }
  },


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
    }, 500)
    
  },


});
