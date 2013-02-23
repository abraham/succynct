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
 * optionsview.ready will only execute once
 */
config.on('ready', optionsview.ready);
accounts.on('ready', optionsview.ready);


