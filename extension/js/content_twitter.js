console.log('succynct:content_twitter.js');

$('input.submit').before('<input class="button selected submit succynct-submit" value="Post to ADN">');
$('.succynct-submit').click(function() {
  var message = {
    method: 'post',
    action: 'posts',
    data: { text: $('#status').val() }
  };
  chrome.runtime.sendMessage(message, function(response) { });
});
