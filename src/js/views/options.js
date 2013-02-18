console.log('views/options.js');


var OptionsView = Backbone.View.extend({


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
    var that = this;
    that.$('#accounts').fadeIn();
    if (that.collection.length === 0) {
      that.$('#accounts-add').fadeIn();
      return this;
    }
    that.$('#accounts-list').fadeIn();
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
