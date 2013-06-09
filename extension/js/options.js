console.log('options.js');


/**
 * Create an optionsview and bind it to the dom with the config and accounts
 */
optionsview = new OptionsView({
  el: $('#content'),
  model: config,
  collection: accounts,
});


/**
 * When both are readdy render the finished UI
 */
config.on('ready', optionsview.ready);
accounts.on('ready', optionsview.ready);
