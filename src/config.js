window.config = new Config({
  clientId: 'UnSbSEb6EFHUZt3ygTwPSTdcdGd8Lvey',
  googleAnalyticsAccount: 'UA-2706568-45',
  authorizeUrl: 'https://alpha.app.net/oauth/authenticate',
  accessTokenUrl: 'https://alpha.app.net/oauth/access_token',
  apiBaseUrl: 'https://alpha-api.app.net',
  baseUrl: 'https://alpha.app.net',
  apiScope: 'stream,write_post,follow,messages',
  apiRequestFrequency: 15 * 1000,
  apiFollowersRequestFrequency: 15 * 60 * 1000,
  autoDismissNotifications: false,
  mentionNotifications: true,
  followerNotifications: true
});