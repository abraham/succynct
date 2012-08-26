console.log('options.js');
var options = {};
var _gaq = _gaq || [];
_gaq.push(['_setAccount', config.get('googleAnalyticsAccount')]);
_gaq.push(['_trackPageview']);

document.addEventListener('DOMContentLoaded', function () {
  init();
});

function openAuthUrl() {
  openAndCloseTab(account.buildAuthUrl());
}

function endAuth() {
  // TODO: clear options and sendMessage to bg
  localStorage.clear();
  openAndCloseTab('/options.html');
}

function init() {
  window.account = new Account();
  
  $('#content').on('click', '.end-auth', endAuth);
  $('#content').on('click', '.start-auth', openAuthUrl);
  $('#content').on('click', 'input[type="checkbox"]', toggleCheckbox);
  $('#content').on('change', 'input[type="number"]', changeNumber);
  $('#content').on('click', 'a', function(event) {
    $(event.target).attr('target', '_blank');
  });
  
  // TODO: move callback to different html file
  if (isCallback()) {
    $('#account').html('<div><img src="img/loader.gif"/></div>');
    window.accessToken = saveAccessToken(parseAccessToken());
    openAndCloseTab('/options.html');
    return;
  }
  
  chrome.extension.sendMessage({ method: 'get', action: 'options'}, function(response) {
    config.set(response);
    displayOptions(response);
    grph();
  });
  
  if (localStorage.getItem('accessToken')) {
    $('#account').html('<div><img src="img/loader.gif"/></div>');
    window.accessToken = localStorage.getItem('accessToken');
    window.account.set({ accessToken: window.accessToken });
    window.account.fetch({ success: accountFetch, error: errorCallback });
    return;
  }
}

function displayOptions(options) {
  $('input[type="checkbox"]').each(function(index, element) {
    var $element = $(element);
    var name = $element.closest('.control-group').data('option-name');
    $element.prop('checked', options[name]);
  });
  $('input[type="number"]').each(function(index, element) {
    var $element = $(element);
    var $control = $element.closest('.control-group');
    var name = $control.data('option-name');
    var defaultName = $control.data('option-default');
    if ($control.data('format') === 'minutes') {
      $element.prop('value', options[name] / 1000 / 60 || options[defaultName] / 1000 / 60);
    } else if($control.data('format') === 'seconds') {
      $element.prop('value', options[name] / 1000 || options[defaultName] / 1000);
    } else {
      $element.prop('value', options[name] || options[defaultName]);
    }
  });
}

function toggleCheckbox(event, value) {
  var $target = $(event.target);
  var newOptions = { };
  newOptions[$target.closest('.control-group').data('option-name')] = $target.prop('checked');
  chrome.extension.sendMessage({ method: 'put', action: 'options', data: $.extend(options, newOptions) });
}

function changeNumber(event) {
  var $target = $(event.target);
  var $control = $target.closest('.control-group');
  var val = parseInt($target.val());
  if ($control.data('format') === 'minutes') {
    val = val * 60 * 1000;
  } else if ($control.data('format') === 'seconds') {
    val = val * 1000;
  }
  var newOptions = { };
  newOptions[$control.data('option-name')] = val;
  chrome.extension.sendMessage({ method: 'put', action: 'options', data: $.extend(options, newOptions) });
}

function accountFetch(account) {
  chrome.extension.sendMessage({ method: 'put', action: 'oauth/authenticate'}, function(response) { });
  $('#account').html('<div><span><a href="https://alpha.app.net/' + account.get('username') + '">@' + account.get('username') + '</a></span> <button class="btn end-auth btn-danger">Sign out</button></div>');
}

function errorCallback(account) {
  $('#account').html('<div><span class="alert alert-danger">Error authenticating with App.net</span> <button class="btn btn-danger start-auth" id="account-btn">Authenticate App.net account</button></div>');
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

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


function grph() {
  // TODO: customize copied graph code
  
  // define dimensions of graph
  var m = [20, 20, 20, 80]; // margins
  var w = 1000 - m[1] - m[3]; // width
  var h = 400 - m[0] - m[2]; // height  
  
  // create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
  var data = _.pluck(config.get('rateLimitHistory'), 'remaining');
  // data.reverse();
  
  // X scale will fit all values from data[] within pixels 0-w
  var x = d3.scale.linear().domain([data.length, 0]).range([0, w]);
  // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
  var y = d3.scale.linear().domain([_.min(data) - 25, _.max(data) + 25]).range([h, 0]);
    // automatically determining max range can work something like this
    // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
  
  // create a line function that can convert data[] into x and y points
  var line = d3.svg.line()
    // assign the X function to plot our line as we wish
    .x(function(d,i) {
      // verbose logging to show what's actually being done
      console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
      // return the X coordinate where we want to plot this datapoint
      return x(i); 
    })
    .y(function(d) {
      // verbose logging to show what's actually being done
      console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
      // return the Y coordinate where we want to plot this datapoint
      return y(d);
    })
    
    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#graph").append("svg:svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
      .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    
    // create yAxis
    var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
    // Add the x-axis.
    graph.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);
    
    
    // create left yAxis
    var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
    // Add the y-axis to the left
    graph.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(-25,0)")
      .call(yAxisLeft);
    
    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    graph.append("svg:path").attr("d", line(data));
}