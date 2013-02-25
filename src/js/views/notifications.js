console.log('views/notifications.js');


/**
* Display a simple text desktop notification
*/
window.TextNotificationView = Backbone.View.extend({


  initialize: function(options) {
    _.bindAll(this);
    // this.options = options;
  },


  /**
   * Trigger the actual display of a notification
   */
  render: function() {
    console.log('notification.render');
    var details = this.build()
    if (!this.notification) {
      return false;
    }
    console.log('notificaiton shown');
    if (details.url) {
      this.notification.url = details.url;
    }
    // this.notification.type = this.options.type;
    this.setTimeout();
    this.notification.onclick = this.onClick;
    this.notification.show();
    // _gaq.push(['_trackEvent', 'Notifications', 'Show', this.options.type]);
    return this;
  },


  /**
   * Open a url on click if present and close notificaiton
   */
  onClick: function() {
    if (this.notification.url) {
      chrome.tabs.create({ url: this.notification.url });
    }
    this.notification.close();
    // _gaq.push(['_trackEvent', 'Notifications', 'Click', this.type]);
  },


  /**
   * If autoDismiss is enabled setTimeout to close notifications
   */
  setTimeout: function() {
    var that = this;
    if (!config.get('autoDismiss') || !that.notification) {
      return that;
    }
    setTimeout(function(){
      that.notification.close();
      // _gaq.push(['_trackEvent', 'Notifications', 'Timeout', this.type]);
    }, config.get('autoDismissDelay') * 1000);
  },


  /**
   * Build webkitNotification so it is ready to show
   */
  build: function() {
    // TODO: Refactor this code
    if (this.options && this.options.title) {
      var details = this.options || this.selectDetails();
    } else {
      var details = this.selectDetails();
    }
    if (!details) {
      return false;
    }
    this.notification = webkitNotifications.createNotification(
      details.image,
      details.title,
      details.body
    );
    return details;
  },


  /**
   * Select the title, body, image, url based on the action type
   */
  selectDetails: function() {
    // TODO: refactor this
    console.log('notification.selectDetails');
    var action = this.model.get('action');
    if (!action && this.model.get('id')) {
      // A mention does not have the same structure as interactions
      if (!config.get('actionsMention')) {
        return false;
      }
      var user = this.model.get('user');
      var object = this.model.toJSON();
      var title = 'Mention from @' + user.username;
      if (object.reply_to) {
        title = 'Reply from @' + user.username + ' to your post';
      }
      return {
        image: user.avatar_image.url,
        title: title,
        body: object.text,
        url: object.canonical_url
      }
    }
    var user = this.model.get('users')[0];
    var object = this.model.get('objects')[0];
    if ('follow' === action) {
      var title = 'Followed by @' + user.username + ' on ADN';
      if (!config.get('actionsFollow')) {
        return false;
      }
      if (user.you_follow) {
        title = 'Followed back by @' + user.username + ' on ADN';
      }
      return {
        image: user.avatar_image.url,
        title: 'Followed by @' + user.username,
        body: user.description.text || '',
        url: user.canonical_url
      }
    } else if ('star' === action) {
      if (!config.get('actionsStar')) {
        return false;
      }
      return {
        image: user.avatar_image.url,
        title: 'Star by @' + user.username + ' on your post',
        body: object.text,
        url: object.canonical_url
      }
    } else if ('reply' === action) {
      // Does not include the reply post so ignore and use the mentions API instead
      return false;
      if (!config.get('actionsReply')) {
        return false;
      }
      return {
        image: user.avatar_image.url,
        title: 'Reply from @' + user.username + ' to your post',
        body: object.text,
        url: object.canonical_url
      }
    } else if ('repost' === action) {
      if (!config.get('actionsRepost')) {
        return false;
      }
      return {
        image: user.avatar_image.url,
        title: 'Repost by @' + user.username + ' of your post',
        body: object.text,
        url: object.canonical_url
      }
    } else {
      console.log("Unsupposted interaction type", action);
      return false
    }
  },


});
