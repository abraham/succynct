console.log('options.js');
document.addEventListener('DOMContentLoaded', function () {
  init();
});

function openAuthUrl() {
  console.log('openAuthUrl');
  openAndCloseTab(buildAuthUrl());
}

function endAuth() {
  localStorage.clear();
  openAndCloseTab('/options.html');
}

function buildAuthUrl() {
  return config.authorizeUrl + '?client_id=' + config.clientId + '&response_type=token&redirect_uri=' + location.href + '&scope=' + config.apiScope;
}

function init() {
  $('#content').on('click', '.end-auth', endAuth);
  $('#content').on('click', '.start-auth', openAuthUrl);
  
  if (isCallback()) {
    $('#account').html('<div><img src="img/loader.gif"/></div>');
    window.accessToken = saveAccessToken(parseAccessToken());
    openAndCloseTab('/options.html');
    return;
  }
  
  if (localStorage.getItem('accessToken')) {
    console.log('accessToken');
    $('#account').html('<div><img src="img/loader.gif"/></div>');
    window.accessToken = localStorage.getItem('accessToken');
    window.account = new Account();
    window.account.set({ accessToken: window.accessToken });
    window.account.fetch({ success: accountFetch });
    return;
  }
}

function accountFetch(account) {
  console.log('account')
  console.log(account)
  $('#account').html('<div>@<span><a href="https://alpha.app.net/' + account.get('username') + '">' + account.get('username') + '</a></span> <button class="btn end-auth btn-danger">Sign out</button></div>');
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