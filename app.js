window.Account = Backbone.Model.extend({
  initialize: function() {
    _.bindAll(this);
    if (this.get('accessToken')) {
      this.fetch();
    }
  },
  url: function() {
    return 'https://alpha-api.app.net/stream/0/users/me?access_token=' + this.get('accessToken');
  },
  checkAuth: function() {
    if (!this.get('accessToken') && localStorage.getItem('accessToken')) {
      this.set({ accessToken: localStorage.getItem('accessToken') });
      this.fetch();
    }
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
    
    var post = new Post();
    post.set({ text: text });
    // TODO: catch errors
    post.save();
  },
  onInputChanged: function(text, suggest) {
    var suggestions = [];
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

window.NotificationView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);
  },
  events: { },
  render: function() {
    var notification = webkitNotifications.createNotification(
      this.model.get('user').avatar_image.url,
      '@' + this.model.get('user').username + ' mentioned you on ADN',
      this.model.get('text')
    );
    notification.url = 'https://alpha.app.net/' + this.model.get('user').username + '/post/' + this.model.get('id');
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
      $.post(this.url, this.attributes, this.parse);
    } else {
      return false;
    }
  }
});

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
      this.fetch();
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
        var view = new NotificationView({ model: model });
        view.render();
      } else {
      }
    }, { lastId: lastId });
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
$.ajaxSetup({
  beforeSend: attacheAuthHeader
});