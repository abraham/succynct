console.log('succynct:content_twitter.js');
$('input.submit').before('<input class="button selected submit succynct-submit" value="Post to ADN">');
$('.succynct-submit').click(function() {
  chrome.extension.sendMessage({
    method: 'post',
    action: 'posts',
    data: { status: $('#status').val() }
  }, function(response) { });
});