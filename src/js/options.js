console.log('options.js');

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


