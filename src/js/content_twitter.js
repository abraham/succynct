console.log('succynct:content_twitter.js');
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-2706568-45']);
_gaq.push(['_trackPageview']);

$('input.submit').before('<input class="button selected submit succynct-submit" value="Post to ADN">');
$('.succynct-submit').click(function() {
  alert('@abraham was lazy and broke that. Yell at him to fix it.');
  return false;
  chrome.extension.sendMessage({
    method: 'post',
    action: 'posts',
    data: { status: $('#status').val() }
  }, function(response) { });
});