console.log('callback.js');


var initOnce = _.once(init);
var account = new Account();
config.on('ready', initOnce);
accounts.on('ready', initOnce);


function parseHashString(string) {
  var arr = string.split('&');
  var obj = {};
  for (index in arr) {
    var split = arr[index].split('=')
    obj[split[0]] = split[1]
  }
  return obj;
}


function parseAccessToken() {
  var hash = location.hash.split('#')[1]
  var params = parseHashString(hash)
  return params['access_token'];
}


function successCallback() {
  console.log('Account fetch succesful');
  accounts.add(account);
  // TODO: This is a bit of a hack.
  // Redirects tend to cache weird for extension files so open and close tabs instead
  setTimeout(function() {
    window.open(chrome.extension.getURL('/options.html'));
    window.close();
  }, 2500)
}


function errorCallback() {
  alert('Oops. Unable to get full account details. Please try again or say wut, wut to @abraham');
}

function init() {
  if (!accounts.ready && !config.ready) {
    return;
  }
  var accessToken = parseAccessToken();
  if (!accessToken) {
    alert('Oops. Unable to get access_token. Please try again or say wut, wut to @abraham');
  } else {
    console.log('access_token set and fetching account');
    account.set('access_token', accessToken);
    account.fetch({
      success: successCallback,
      error: errorCallback,
      headers: {'Authorization': 'Bearer ' + account.get('access_token')}
    });
  }
}
