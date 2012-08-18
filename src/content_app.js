console.log('succynct:content_script.js');
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-2706568-45']);
_gaq.push(['_trackPageview']);

var observer = new MutationSummary({
  callback: handlePostMutations,
  queries: [
    { element: 'div.post-container' }
  ]
});

$('.post-container').each(function(index, post) { addShareLink(post); });
function handlePostMutations(summaries) {
  summaries[0].added.forEach(addShareLink);
}

function addShareLink(post) {
  var $post = $(post);
  $post.find('.post-details ul').append('<li class="show-on-hover"><a href="#" data-reply-to="" data-share=""><i class="icon-retweet"></i> Share</a></li>');
  $post.on('click', '[data-share]', handleClick);
}

function handleClick(event) {
  event.preventdefault;
  var $post = $(this).closest('.post-container');
  var text = 'Shared @' + $post.data('post-author-username') + ': ' + $post.find('[itemscope="https://join.app.net/schemas/Post"]').text() + ' ';
  $('[name="post"]').data('succynct-text', text);
  // Delay execution until after App.net adds text to the post textarea
  window.setTimeout(function() {
    $('[name="post"]').val($('[name="post"]').data('succynct-text'));
  }, 0);
}