console.log('app.js');

var App = Backbone.View.extend({
  
  
  initialize: function() {
    _.bindAll(this);
    this.model.on('ready', this.ready);
    this.collection.on('ready', this.ready);
  },


  /**
   * If config and accounts are ready start init
   */
  ready: function() {
    console.log('app ready');
    if (config.ready && accounts.ready) {
      this.init();
    }
  },


  /**
   * Config and accounts are ready to go
   */
  init: function() {
    console.log('app.init');
    if (this.model.get('frequency')) {
      this.setInterval(this.model.get('frequency'));
    }
    interactions.checkForNew({silent: true});
    mentions.checkForNew({silent: true});
  },


  /**
   * Set interval to poll API
   */
  setInterval: function(interval) {
    console.log('app.setInterval', interval);
    if (this.intervalId) {
      this.clearInterval(this.intervalId);
    }
    var intervalId = setInterval(this.triggerInterval, interval * 1000);
    this.intervalId = intervalId;
    return this;
  },


  /**
   * Clear existing interval
   */
  clearInterval: function() {
    console.log('app.clearInterval', this.intervalId);
    clearInterval(this.intervalId);
    delete this.intervalId
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


  /**
   * When config.frequency chanages clear the existing interval and set a new one
   */
  changeInterval: function(model, value) {
    console.log('app.changeInterval', model.changed.frequency);
    if (model.changed && model.changed.frequency) {
      this.clearInterval(this.intervalId);
    }
    if (value) {
      this.setInterval(value);
    }
    return this;
  }


});
