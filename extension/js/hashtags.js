console.log('hashtags');


/**
 * Generic collection for handling posts
 */
var Hashtags = Posts.extend({


  initialize: function(options) {
    _.bindAll(this, 'url');
    _.extend(this, options);
    app.on('interval', this.requestUpdates, this);
  },


  url: function() {
    return 'https://alpha-api.app.net/stream/0/posts/tag/' + this.hashtag;
  },


  _validate: function() {
    
  }


});


var HASHTAGS = Backbone.Collection.extend({


  model: Hashtags


});