console.log('background.js');


config.on('ready', function(){
  console.log('ready');
})





// if (localStorage.getItem('accessToken')) {
//   window.account.set({ accessToken: localStorage.getItem('accessToken') });
//   window.account.fetch();
// } else {
//   var n = new TextNotificationView({
//     url: account.buildAuthUrl(),
//     title: 'Authenticate with your App.net account',
//     body: 'Click here to authenticate your App.net account and get started with Succynct.',
//     image: chrome.extension.getURL('/img/angle.png')
//   });
//   n.render();
// }