console.log('headers.js');

/**
  * Add auth headers
  */
function attacheAuthHeader(xhr, settings) {
  if (!navigator.onLine) {
    return false;
  }
  if (!window.account || !window.account.get('accessToken')) {
    return;
  }
  if (settings.url.indexOf('https://alpha-api.app.net/') === 0) {
    xhr.setRequestHeader('Authorization', 'Bearer ' + window.account.get('accessToken'));
  }
  _gaq.push(['_trackPageview']);
}


function beforeSend(jqXHR, settings) {
  // Cancel request if no network connection
  console.log('beforeSend')
  if (!navigator.onLine) {
    return false;
  }
  console.log('online')
  var appDotNetApi = settings.url.indexOf('https://alpha-api.app.net/') === 0;
}


function complete(jqXHR, settings) {
  console.log('ajaxSetup:complete');
  // Usage tracking
  _gaq.push(['_trackPageview']);
}


$.ajaxSetup({
  // beforeSend: attacheAuthHeader,
  complete: complete
});
