console.log('options.js');
var options = {};
var _gaq = _gaq || [];
_gaq.push(['_setAccount', config.get('googleAnalyticsAccount')]);
_gaq.push(['_trackPageview']);

document.addEventListener('DOMContentLoaded', function () {
  init();
});

function openAuthUrl() {
  openAndCloseTab(account.buildAuthUrl());
}

function endAuth() {
  // TODO: clear options and sendMessage to bg
  localStorage.clear();
  openAndCloseTab('/options.html');
}

function init() {
  window.account = new Account();
  
  $('#content').on('click', '.end-auth', endAuth);
  $('#content').on('click', '.start-auth', openAuthUrl);
  $('#content').on('click', 'input[type="checkbox"]', toggleCheckbox);
  $('#content').on('change', 'input[type="number"]', changeNumber);
  $('#content').on('click', 'a', function(event) {
    $(event.target).attr('target', '_blank');
  });
  
  // TODO: move callback to different html file
  if (isCallback()) {
    $('#account').html('<div><img src="img/loader.gif"/></div>');
    window.accessToken = saveAccessToken(parseAccessToken());
    openAndCloseTab('/options.html');
    return;
  }
  
  chrome.extension.sendMessage({ method: 'get', action: 'options'}, function(response) {
    config.set(response);
    displayOptions(response);
  });
  
  if (localStorage.getItem('accessToken')) {
    $('#account').html('<div><img src="img/loader.gif"/></div>');
    window.accessToken = localStorage.getItem('accessToken');
    window.account.set({ accessToken: window.accessToken });
    window.account.fetch({ success: accountFetch, error: errorCallback });
    return;
  }
}

function displayOptions(options) {
  $('input[type="checkbox"]').each(function(index, element) {
    var $element = $(element);
    var name = $element.closest('.control-group').data('option-name');
    $element.prop('checked', options[name]);
  });
  $('input[type="number"]').each(function(index, element) {
    var $element = $(element);
    var $control = $element.closest('.control-group');
    var name = $control.data('option-name');
    var defaultName = $control.data('option-default');
    if ($control.data('format') === 'minutes') {
      $element.prop('value', options[name] / 1000 / 60 || options[defaultName] / 1000 / 60);
    } else if($control.data('format') === 'seconds') {
      $element.prop('value', options[name] / 1000 || options[defaultName] / 1000);
    } else {
      $element.prop('value', options[name] || options[defaultName]);
    }
  });
}

function toggleCheckbox(event, value) {
  var $target = $(event.target);
  var newOptions = { };
  newOptions[$target.closest('.control-group').data('option-name')] = $target.prop('checked');
  chrome.extension.sendMessage({ method: 'put', action: 'options', data: $.extend(options, newOptions) });
}

function changeNumber(event) {
  var $target = $(event.target);
  var $control = $target.closest('.control-group');
  var val = parseInt($target.val());
  if ($control.data('format') === 'minutes') {
    val = val * 60 * 1000;
  } else if ($control.data('format') === 'seconds') {
    val = val * 1000;
  }
  var newOptions = { };
  newOptions[$control.data('option-name')] = val;
  chrome.extension.sendMessage({ method: 'put', action: 'options', data: $.extend(options, newOptions) });
}

function accountFetch(account) {
  chrome.extension.sendMessage({ method: 'put', action: 'oauth/authenticate'}, function(response) { });
  $('#account').html('<div><span><a href="https://alpha.app.net/' + account.get('username') + '">@' + account.get('username') + '</a></span> <button class="btn end-auth btn-danger">Sign out</button></div>');
}

function errorCallback(account) {
  $('#account').html('<div><span class="alert alert-danger">Error authenticating with App.net</span> <button class="btn btn-danger start-auth" id="account-btn">Authenticate App.net account</button></div>');
}

function saveAccessToken(accessToken) {
  localStorage.setItem('accessToken', accessToken);
  return accessToken;
}

function parseAccessToken() {
  var hash = location.hash;
  // TODO: refactor this hack
  return location.hash.split('#')[1].split('=')[1];
}

function isCallback() {
  return location.hash.indexOf('#access_token=') === 0;
}

function openAndCloseTab(url) {
  chrome.tabs.create({ url: url });
  window.close();
}

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();