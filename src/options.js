console.log('options.js');
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-2706568-45']);
_gaq.push(['_trackPageview']);

document.addEventListener('DOMContentLoaded', function () {
  init();
  
  $('body').on('click', 'a', function(event) {
    $(event.target).attr('target', '_blank');
  });
});

function openAuthUrl() {
  openAndCloseTab(account.buildAuthUrl());
}

function endAuth() {
  localStorage.clear();
  openAndCloseTab('/options.html');
}

function init() {
  window.account = new Account();
  
  $('#content').on('click', '.end-auth', endAuth);
  $('#content').on('click', '.start-auth', openAuthUrl);
  
  if (isCallback()) {
    $('#account').html('<div><img src="img/loader.gif"/></div>');
    window.accessToken = saveAccessToken(parseAccessToken());
    openAndCloseTab('/options.html');
    return;
  }
  
  if (localStorage.getItem('accessToken')) {
    $('#account').html('<div><img src="img/loader.gif"/></div>');
    window.accessToken = localStorage.getItem('accessToken');
    window.account.set({ accessToken: window.accessToken });
    window.account.fetch({ success: accountFetch, error: errorCallback });
    return;
  }
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