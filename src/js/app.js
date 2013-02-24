console.log('app.js');

var App = Backbone.Model.extend({
  
  
  initialize: function() {
    _.bindAll(this);
  },


  ready: function() {
    console.log('app ready');
    if (config.ready && accounts.ready) {
      this.init();
    }
  },


  init: function() {
    console.log('app.init');
  },


  /**
   * Set interval to poll API
   */
  setInterval: function(frequency) {
    var interval = this.model.get('frequency');
    var intervalId = setInterval(this.triggerInterval, interval);
    this.set('intervalId', intervalId)
    return this;
  },


  /**
   * Clear existing interval
   */
  clearInterval: function() {
    clearInterval(this.get('intervalId'));
    this.unset('intervalId');
    return this;
  },


  /**
   * Trigger invervals to check for data
   */
  triggerInterval: function() {
    console.log('app.triggerInterval');
    if (this.model.get('actions', false)) {
      this.trigger('interval');
    }
    return this;
  },


  changeInterval: function(x, y, z) {
    debugger;
  }


});


window.Post = Backbone.Model.extend({
  initialize: function() {
    _.bindAll(this);
  },
  url: 'https://alpha-api.app.net/stream/0/posts',
  validate: function(attributes) {
    if (attributes.text.length > 256) {
      return 'text is too long';
    }
  },
  save: function() {
    if (this.get('text') && this.get('text').length < 256) {
      // TODO: for some reason this is not adding the response to the model
      var jqXHR = $.post(this.url, this.attributes)
          .success(this.success)
          .error(this.error);
    } else {
      return false;
    }
  },
  success: function(response, textStatus, jqXHR) {
    var notification = new TextNotificationView({
      title: 'Successfully posted to App.net',
      body: response.text,
      image: response.user.avatar_image.url,
      url: 'https://alpha.app.net/' + response.user.username + '/post/' + response.id,
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

var Polling = Backbone.Collection.extend({
  initialize: function(options) {
    _.bindAll(this);
    _.extend(this, options);
  },
  toggleNotifications: function(model, enabled, other) {
    if (enabled) {
      this.setInterval();
    } else {
      this.clearInterval();
    }
  },
  changeFrequency: function(model, frequency, other) {
    this.clearInterval();
    if (frequency) {
      this.setInterval(frequency);
    }
  },
  update: function() {
    if (window.account && window.account.get('accessToken') && config.get(this.configName)) {
      this.fetch({ error: this.error });
    }
    return this;
  },
  error: function(collection, xhr) {
    if (xhr.status === 401) {
      console.log('Invalid access_token');
      var notification = new TextNotificationView({
        image: chrome.extension.getURL('/img/angle.png'),
        title: 'Authentication failed',
        body: 'Click here to sign in to App.net again.',
        url: chrome.extension.getURL('/options.html'),
        type: 'AuthError'
      });
      notification.render();
      window.account.unset('accessToken');
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

var Posts = Polling.extend({
  model: Post,
  renderNotification: function(model, index, array) {
    if (this.notificationType === 'mentions') {
      this.renderMentionNotification(model);
    } else {
      console.log('this.notificationType', this.notificationType);
    }
  },
  renderMentionNotification: function(model) {
    var notification = new TextNotificationView({
      image: model.get('user').avatar_image.url,
      title: 'Mentioned by @' + model.get('user').username + ' on ADN',
      body: model.get('text'),
      url: 'https://alpha.app.net/' + model.get('user').username + '/post/' + model.get('id'),
      type: 'Mention'
    });
    notification.render();
  },
  filterNewPosts: function() {
    var models = [];
    var lastCreatedAt = localStorage.getItem(this.configName + '_lastCreatedAt');
    // Don't notify for new polling channels
    if (!lastCreatedAt) {
      localStorage.setItem(this.configName + '_lastCreatedAt', (new Date()).getTime());
      return this;
    }
    
    // Reject posts by authenticated account
    models = this.reject(function(post){ return post.get('user').id === account.get('id'); });
    // Filter out old posts
    models = models.filter(function(post){ return (new Date(post.get('created_at'))).getTime() > parseInt(lastCreatedAt); });
    
    // Store latest created_at date for future matches
    if (_.first(models)) {
      localStorage.setItem(this.configName + '_lastCreatedAt', (new Date(_.first(models).get('created_at'))).getTime());
    }
    _.each(models, this.renderNotification);
  }
});
