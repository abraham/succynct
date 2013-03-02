console.log('posts');

/**
 * A single post
 */
window.Post = Backbone.Model.extend({


  initialize: function() {
    _.bindAll(this);
  },


  url: 'https://alpha-api.app.net/stream/0/posts',

  /**
   * Basic validations of a post
   */
  validate: function(attributes) {
    if (attributes.text.length > 256) {
      return 'text is too long';
    }
  },


  // save: function() {
  //   if (this.get('text') && this.get('text').length < 256) {
  //     // TODO: for some reason this is not adding the response to the model
  //     var jqXHR = $.post(this.url, this.attributes)
  //         .success(this.success)
  //         .error(this.error);
  //   } else {
  //     return false;
  //   }
  // },


  /**
   * Pull the post data out of the reponse object
   */
  parse: function(response) {
    return response.data;
  },


  success: function(model, textStatus, jqXHR) {
    var notification = new TextNotificationView({
      title: 'Successfully posted to App.net',
      body: model.get('text'),
      image: model.get('user').avatar_image.url,
      url: model.get('canonical_url'),
      timeout: 5 * 1000,
      type: 'PostSuccess'
    });
    notification.render();
  },


  error: function() {
    var notification = new TextNotificationView({
      image: chrome.extension.getURL('/img/angle.png'),
      title: 'Posting to App.net failed',
      body: 'Please try agian. This notification will close in 10 seconds.',
      timeout: 10 * 1000,
      type: 'PostError'
    });
    notification.render();
  }


});


/**
 * Generic collection for handling posts
 */
var Posts = Backbone.Collection.extend({


  initialize: function(options) {
    _.bindAll(this, 'error');
    _.extend(this, options);
  },


  // update: function() {
  //   if (window.account && window.account.get('accessToken') && config.get(this.configName)) {
  //     this.fetch({ error: this.error });
  //   }
  //   return this;
  // },


  error: function(collection, response, options) {
    // TODO: update copy of notifications
    if (response.status === 401) {
      console.log('Invalid access_token');
      var notification = new TextNotificationView({
        image: chrome.extension.getURL('/img/angle.png'),
        title: 'Authentication failed',
        body: 'Click here to sign in to App.net again.',
        url: chrome.extension.getURL('/options.html'),
        type: 'AuthError'
      });
      notification.render();
      // TODO: update this to support multiple accounts
      accounts.remove(accounts.at(0));
    } else {
      console.log('Unkown error');
      var notification = new TextNotificationView({
        image: chrome.extension.getURL('/img/angle.png'),
        title: 'Unkown error checking for posts',
        body: 'If you get this a lot please ping @abraham',
        url: 'https://alpha.app.net/abraham',
        type: 'UnknownError'
      });
      notification.render();
    }
    return this;
  }


});
