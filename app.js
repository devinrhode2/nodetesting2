
/**
 * Module dependencies.
 */

//as we get more utilities, we will want to get this out to it's own module
String.prototype.contains = function StringContains(substring){
  return this.indexOf(substring) > -1;
};

var express = require('express')
  , http = require('http');

require('colors');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3500);
  app.set('views', __dirname + '/views');
  
  // Removed view engine line because we're using .node files
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  
  // From --sessions build option
/*
  app.use(express.cookieParser('der I NEED MY DER WTF SECRET'));
  app.use(express.session({ secret: 'DER WHEERS MA ... SHIT IS THIS THE SECRET' }));
*/
  
  // For use .styl files in public and have it 'just work'
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


/**
 * Require 'mu' mustache module
 */
var mu = require('live-mu')
  , util = require('util');
mu.root = __dirname + '/views';

/**
 * Routing:
 *
 * '*' route filters all GET's. We do this so we can filter and handle .node files.
 */
app.get('*', function(req, res, expressNext) {
  
  /**
   * handleNodeRequest handles all the .node GET requests
   */
  var handleNodeRequest = function handleNodeRequest(req, res, file){
    file = file.toLowerCase();
    
    if (process.env.NODE_ENV == 'DEVELOPMENT') {
      mu.clearCache();
    }
    
    /**
     * route defaults (redirect the first key to second)
     */
    var redirects = {
      'emr/index.node': 'emr/appointments.node'
    };
    for (var redirect in redirects) {
      if (file === redirect) {
        file = redirects[redirect];
      }
    }
    
    // This streams the file to the client as it's rendered!
    util.pump(mu.compileAndRender(file, {req: req}), res);
    // ...and that's it!
  };

  // File is the requested file. (aka url)
  file = req.params[0].substr(1, req.params[0].length);
  if (file.contains('.node')) {
    handleNodeRequest(req, res, file);
  } else {
    if (file.contains('.')) {
      if (file.contains('?')) {
        throw 'woah, looks like you have a querystring for a non .node file. Please use a url to a .node file.';
      }
      
      // Forward request to /public folder.
      expressNext();
    } else {
      
      // If last character is a '/'
      if (file.charAt(file.length - 1) === '/') {
        
        // Point to index.node of that folder
        file = file + 'index.node';
      } else {
        
        // Very very root of whole site
        if (file === '') {
          
          // Point to 'index.node'
          file = 'index.node';
        } else {
          
          // Append '/index.node'
          file = file + '/index.node';
        }
      }
      handleNodeRequest(req, res, file);
    }
  }
});

/**
 * Require database. Once it's ready, start the server.
 */
require('./db.js').ready(function(db){
  
  global.db = db;
  
  /**
   * Start server
   */
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
});