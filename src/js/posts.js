console.log('posts');

/**
 * A single post
 */
window.Post = Backbone.Model.extend({


  initialize: function() {
    _.bindAll(this);
  },


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
    _.bindAll(this);
    _.extend(this, options);
  },


  url: 'https://alpha-api.app.net/stream/0/posts',


  /**
   * Poll API for updates
   */
  requestUpdates: function() {
    // If there is not any authenticated users or network request, exit
    if (accounts.length === 0 || !navigator.onLine) {
      return false;
    }
    this.fetch({
      error: this.error,
      update: true,
      data: {
        count: 20 // TODO: start using since_id
      },
      headers: {
        'Authorization': 'Bearer ' + accounts.at(0).get('access_token'),
        // HACK: should be applied globally
        'X-ADN-Migration-Overrides': 'response_envelope=1&disable_min_max_id=1&follow_pagination=1&pagination_ids=1'
      }
    });
  },


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
