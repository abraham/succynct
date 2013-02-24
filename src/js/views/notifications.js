console.log('views/notifications.js');


/**
* Display a desktop notification
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


  /**
   * Trigger the actual display of a notification
   */
  render: function() {
    var notification = this.notification;
    notification.type = this.options.type;
    if (this.options.url) {
      notification.url = this.options.url;
    }
    notification.onclick = function() {
      if (this.url) {
        chrome.tabs.create({ url: this.url });
      }
      this.close();
      // _gaq.push(['_trackEvent', 'Notifications', 'Click', this.type]);
    }
    if (this.options.timeout) {
      setTimeout(function(){
        notification.close();
        // _gaq.push(['_trackEvent', 'Notifications', 'Timeout', this.type]);
      }, this.options.timeout);
      
    }
    notification.show();
    // _gaq.push(['_trackEvent', 'Notifications', 'Show', this.options.type]);
  }
});
