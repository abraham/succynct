console.log('headers.js');

/**
  * Add auth headers
  */
function attacheAuthHeader(xhr, settings) {
  if (!navigator.onLine) {
    return false;
  }
  // Opt-in to new API features
  // if (settings.url.indexOf('https://alpha-api.app.net/') === 0) {
  //   xhr.setRequestHeader('X-ADN-Migration-Overrides', 'response_envelope=0');
  // }
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
  if (appDotNetApi) {
    // Opt-in to API migrations
    console.log('opt-in')
    jqXHR.setRequestHeader('X-ADN-Migration-Overrides', 'response_envelope=1&disable_min_max_id=1&follow_pagination=1&pagination_ids=1');
  }
}


function complete(jqXHR, settings) {
  console.log('ajaxSetup:complete');
  // Usage tracking
  _gaq.push(['_trackPageview']);
}


$.ajaxSetup({
  // beforeSend: attacheAuthHeader,
  complete: complete,
  headers: { // Applied globally and not just to alpha-api.app.net requests
    'X-ADN-Migration-Overrides': 'response_envelope=1&disable_min_max_id=1&follow_pagination=1&pagination_ids=1'
  }
});
