console.log('interactions.js');

/**
 * A single Mention
 */
window.Mention = Backbone.Model.extend({


  initialize: function() {
    _.bindAll(this);
    this.view = new TextNotificationView({ model: this });
  },


  url: 'https://alpha-api.app.net/stream/0/users/me/mentions',


  // validate: function(attributes) {
  //   if (attributes.text.length > 256) {
  //     return 'text is too long';
  //   }
  // },
  // 
  // 
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


  // success: function(response, textStatus, jqXHR) {
  //   var notification = new TextNotificationView({
  //     title: 'Successfully posted to App.net',
  //     body: response.text,
  //     image: response.user.avatar_image.url,
  //     url: 'https://alpha.app.net/' + response.user.username + '/post/' + response.id,
  //     timeout: 5 * 1000,
  //     type: 'PostSuccess'
  //   });
  //   notification.render();
  // },
  // 
  // 
  // error: function() {
  //   var notification = new TextNotificationView({
  //     image: chrome.extension.getURL('/img/angle.png'),
  //     title: 'Posting to App.net failed',
  //     body: 'Please try agian. This notification will close in 10 seconds.',
  //     timeout: 10 * 1000,
  //     type: 'PostError'
  //   });
  //   notification.render();
  // }


});


/**
 * A collection of Mentions
 */
var Mentions = Polling.extend({


  model: Mention,


  url: 'https://alpha-api.app.net/stream/0/users/me/mentions',


  initialize: function() {
    _.bindAll(this, 'checkForNew');
  },


  checkForNew: function(options) {
    if (accounts.length === 0 || !navigator.onLine) {
      return false;
    }
    // TOOD: this.error is undefined
    var params = {
      error: this.error,
      update: true,
      data: {
        count: 20 // TODO: start using since_id
      },
      headers: {
        'Authorization': 'Bearer ' + accounts.at(0).get('access_token')
      }
    };
    _.extend(params, options);
    console.log('mentions.checkForNew', params);
    this.fetch(params);
  },


  parse: function(response) {
    return response.data;
  },


  renderNotification: function(model, collection, options) {
    console.log('mentions.renderNotification');
    model.view.render();
  },


  // renderMentionNotification: function(model) {
  //   var notification = new TextNotificationView({
  //     image: model.get('user').avatar_image.url,
  //     title: 'Mentioned by @' + model.get('user').username + ' on ADN',
  //     body: model.get('text'),
  //     url: 'https://alpha.app.net/' + model.get('user').username + '/post/' + model.get('id'),
  //     type: 'Mention'
  //   });
  //   notification.render();
  // },
  // filterNewPosts: function() {
  //   var models = [];
  //   var lastCreatedAt = localStorage.getItem(this.configName + '_lastCreatedAt');
  //   // Don't notify for new polling channels
  //   if (!lastCreatedAt) {
  //     localStorage.setItem(this.configName + '_lastCreatedAt', (new Date()).getTime());
  //     return this;
  //   }
  //   
  //   // Reject posts by authenticated account
  //   models = this.reject(function(post){ return post.get('user').id === account.get('id'); });
  //   // Filter out old posts
  //   models = models.filter(function(post){ return (new Date(post.get('created_at'))).getTime() > parseInt(lastCreatedAt); });
  //   
  //   // Store latest created_at date for future matches
  //   if (_.first(models)) {
  //     localStorage.setItem(this.configName + '_lastCreatedAt', (new Date(_.first(models).get('created_at'))).getTime());
  //   }
  //   _.each(models, this.renderNotification);
  // }


});


window.mentions = new Mentions();
