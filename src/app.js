window.Account = Backbone.Model.extend({
  initialize: function() {
    _.bindAll(this);
    if (this.get('accessToken')) {
      this.fetch();
    }
  },
  url: function() {
    // TODO: The access_token shouldn't be needed anymore
    return 'https://alpha-api.app.net/stream/0/users/me?access_token=' + this.get('accessToken');
  },
  checkAuth: function() {
    if (!this.get('accessToken') && localStorage.getItem('accessToken')) {
      this.set({ accessToken: localStorage.getItem('accessToken') });
      this.fetch();
    }
  },
  buildAuthUrl: function() {
    return config.authorizeUrl + '?client_id=' + config.clientId + '&response_type=token&redirect_uri=' + chrome.extension.getURL('/options.html') + '&scope=' + config.apiScope;
  }
});

window.OmniboxView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);
  },
  events: { },
  onInputEntered: function(text) {
    if (text.indexOf('@@') === 0) {
      chrome.tabs.create({ url: 'https://alpha.app.net/' + text.substring(2) });
      return;
    }
    
    if (text.indexOf('##') === 0) {
      chrome.tabs.create({ url: 'https://alpha.app.net/hashtags/' + text.substring(2) });
      return;
    }
    
    if (text.indexOf('::') === 0) {
      text = text.substring(2);
    }
    var post = new Post();
    post.set({ text: text });
    // TODO: catch errors
    post.save();
  },
  onInputChanged: function(text, suggest) {
    var suggestions = [];
    suggestions.push({ content: '::' + text, description: (256 - text.length) + ' characters remaning' });
    
    if (text.indexOf(' ') > -1 || text.length === 0) {
      suggest(suggestions);
      return;
    }
    if (text.indexOf('#') === 0 || text.indexOf('@') === 0) {
      text = text.substring(1);
    }
    
    suggestions.push({ content: '@@' + text, description: 'View the @<match>' + text + "</match> profile on App.net" });
    suggestions.push({ content: '##' + text, description: 'Search the #<match>' + text + "</match> hashtag on App.net" });
    suggest(suggestions);
  }
});

/**
* Params: image, title, body, url, and timeout;
*/
window.TextNotificationView = Backbone.View.extend({
  initialize: function(options) {
    // TODO: Move to a model?
    _.bindAll(this);
    this.options = options;
    // TODO: move to Notifications. They support tags but not images yet?
    this.notification = webkitNotifications.createNotification(
      this.options.image,
      this.options.title,
      this.options.body
    );
  },
  render: function() {
    var notification = this.notification;
    if (this.options.url) {
      notification.url = this.options.url;
    }
    notification.onclick = function() {
      if (this.url) {
        chrome.tabs.create({ url: this.url });
      }
      this.close();
    }
    if (this.options.timeout) {
      setTimeout(function(){
        notification.close();
      }, this.options.timeout);
      
    }
    notification.show();
  }
});

// TODO: abstract NotificationViews
window.FollowerNotificationView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);
  },
  render: function() {
    var notification = webkitNotifications.createNotification(
      this.model.get('avatar_image').url,
      '@' + this.model.get('username') + ' followed you on ADN',
      this.model.get('description') ? this.model.get('description').text : ''
    );
    notification.url = 'https://alpha.app.net/' + this.model.get('username');
    notification.onclick = function() {
      chrome.tabs.create({ url: this.url });
      this.close();
    }
    notification.show();
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
    var notification = webkitNotifications.createNotification(
      response.user.avatar_image.url,
      'Successfully posted to App.net',
      response.text
    );
    notification.url = 'https://alpha.app.net/' + response.user.username + '/post/' + response.id;
    notification.onclick = function() {
      chrome.tabs.create({ url: this.url });
      this.close();
    }
    // TODO: store the post locally
    setTimeout(function(){
      notification.close();
    }, 5 * 1000);
    notification.show();
  },
  error: function() {
    var notification = new TextNotificationView({
      image: chrome.extension.getURL('/img/angle.png'),
      title: 'Posting to App.net failed',
      body: 'Please try agian. This notification will close in 10 seconds.',
      timeout: 10 * 1000
    });
    notification.render();
  }
});

// TODO: abstract collections
var Stream = Backbone.Collection.extend({
  model: Post,
  initialize: function(options) {
    _.bindAll(this);
    this.url = options.url;
    this.on('reset', this.renderMentionNotification);
    this.update();
    // TODO: move timeing to an option
    window.setInterval(this.update, config.apiRequestFrequency);
  },
  update: function() {
    if (window.account && window.account.get('accessToken')) {
      this.fetch({ error: this.error });
    }
  },
  renderMentionNotification: function(models) {
    var lastId = localStorage.getItem('lastId');
    
    if (models.length > 0) {
      localStorage.setItem('lastId', models.at(0).get('id'));
    }
    
    models.each(function(model) {
      // TODO: can't rely on ids being ints
      if (lastId && parseInt(model.get('id')) > parseInt(this.lastId)) {
        // If lastId and newer
        var notification = new TextNotificationView({
          image: model.get('user').avatar_image.url,
          title: 'Mentionted by @' + model.get('user').username + ' on ADN',
          body: model.get('text'),
          url: 'https://alpha.app.net/' + model.get('user').username + '/post/' + model.get('id')
        });
        notification.render();
      } else {
        // Older notification or first fetch
      }
    }, { lastId: lastId });
  },
  error: function(collection, xhr) {
    if (xhr.status === 401) {
      console.log('Invalid access_token');
      var notification = new TextNotificationView({
        image: chrome.extension.getURL('/img/angle.png'),
        title: 'Authentication failed',
        body: 'Click here to sign in to App.net again.',
        url: chrome.extension.getURL('/options.html')
      });
      notification.render();
      window.account.unset('accessToken');
    }
  }
});

// TODO: abstract collections
var Followers = Backbone.Collection.extend({
  model: Account,
  initialize: function(options) {
    _.bindAll(this);
    this.url = options.url;
    this.on('reset', this.findNewFollowers);
    var followerIds = localStorage.getItem('followerIds');
    if (followerIds === null || followerIds.length === 0) {
      this.existingIds = [];
    } else {
      this.existingIds = followerIds.split(',');
    }
    this.update();
    // TODO: move timeing to an option
    window.setInterval(this.update, config.apiFollowersRequestFrequency);
  },
  update: function() {
    if (window.account && window.account.get('accessToken')) {
      this.fetch();
    }
  },
  findNewFollowers: function(models) {
    if (_.isEmpty(this.existingIds)) {
      // Now existingIds set so don't notify of any
    } else {
      var newIds = _.difference(models.pluck('id'), this.existingIds);
      _.each(newIds, function(id) {
        var view = new FollowerNotificationView({ model: models.get(id) });
        view.render();
      });
    }
    localStorage.setItem('followerIds', models.pluck('id'));
    this.existingIds = models.pluck('id');
  }
});

/**
  * Add auth headers
  */
function attacheAuthHeader(xhr, settings) {
  if (!window.account || !window.account.get('accessToken')) {
    return;
  }
  if (settings.url.indexOf('https://alpha-api.app.net/') === 0) {
    xhr.setRequestHeader('Authorization', 'Bearer ' + window.account.get('accessToken'));
  }
}
function trackRateLimit(jqXHR, settings) {
  return;
  if (!window.env || window.env !== 'background') {
    return;
  }
  var remaining = jqXHR.getResponseHeader('X-RateLimit-Remaining');
  if (remaining) {
    RateLimit.push({
      // TODO: clean up timestamp hack
      timestamp: parseInt((new Date()).getTime().toString().substring(0,10)),
      remaining: parseInt(remaining)
    })
  }
}
$.ajaxSetup({
  beforeSend: attacheAuthHeader,
  complete: trackRateLimit
});