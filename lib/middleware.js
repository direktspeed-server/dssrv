var path            = require('path')
var fs              = require('fs')
var helpers         = require('./helpers')
var mime            = require('mime')
var prerender       = require('dssrv-prerender')
var pkg             = require('../package.json')
var skin            = require('./skin')
// var connect         = require('connect')
var express         = require('express')
var cbasicAuth      = require('basic-auth');
var send            = require('send')
var utilsPause      = require('pause')
var utilsEscape     = require('escape-html')
var parse           = require('parseurl')
var url             = require('url')


var middleware = {}

  middleware.configureVhosts = function (app,options) {
    // var debug = app.debug
    // debug('Instance express Router')

    
    // var options = options || [ '../sites', false]
    // var single = options[1]
    // var folderpath = options[0]

    app.options = options || {}
    app.options.ip = options.ip || '0.0.0.0'
    app.options.port = options.port || 9966 // 9000
    app.options.config = options.config || {}
    
    // TODO: Dont DO
    return app
    
    if (Object.keys(app.options.config).length > 1) {
      app.debug = require('debug')('dssrv:worker:'+process.pid);
      app.debug('   >> Worker Started');  
        
      // here we should have a list of vhosts so we can require the app
      // we pass in our vhost config.
      app.options.config.vhosts = app.options.config.vhosts || [ 'default' ]
      app.locals.hostDictionary = app.locals.hostDictionary || {}
      
      Object.keys(app.options.config.vhosts).forEach(function(application) {
          var appname = application
          var appinstance = require(app.options.config.vhosts[appname].app)(app.options.config.vhosts[appname].config)
          app.options.config.vhosts[appname].hosts.forEach(function(domain){ 
            app.locals.hostDictionary[domain] = appinstance
            app.debug('vhosts Registered: %s , %s from: %s', domain , application, app.options.config.vhosts[appname].app)
          })
      })
      return app 
    } else return app
  }


middelware.notMultihostURL = function(req, rsp, next){
  var host      = req.headers.host
  var hostname  = host.split(':')[0]
  var arr       = hostname.split(".")
  var port      = host.split(':')[1] ? ':' + host.split(':')[1] : ''
  return next()
  if(hostname == "127.0.0.1" || hostname == "localhost"){
    rsp.statusCode = 307
    rsp.setHeader('Location', 'http://dssrv.nu' + port)
    rsp.end("redirecting you to http://dssrv.nu" + port)
  }else if(arr.length == 3){
    arr.pop()
    arr.push('io')
    var link = 'http://' + arr.join('.') + port
    var body = "Local server does not support history. Perhaps you are looking for <href='" + link + "'>" + link + "</a>."
    rsp.statusCode = 307
    rsp.end(body)
  }else if(arr.length > 4){
    arr.shift()
    var link = 'http://' + arr.join('.') + port
    rsp.statusCode = 307
    rsp.setHeader('Location', link)
    rsp.end("redirecting you to " + link)
  }else{
    next()
  }
}

var reservedDomains = ["local","dssrv.io", "dssrvdev.io", "dssrvapp.io"];
middelware.index = function(dirPath){
  return function(req, rsp, next){
    // TODO: Show Index only in Dev Mode With Local Domains
    return next()
    var host      = req.headers.host;
    var hostname  = host.split(':')[0];
    var arr       = hostname.split(".");
    var port      = host.split(':')[1] ? ':' + host.split(':')[1] : '';
    var poly      = prerender.root(__dirname + "/templates");

    if(arr.length == 2){
      fs.readdir(dirPath, function(err, files){
        var projects = [];

        files.forEach(function(file){
          var local = file.split('.');

          var appPart = local.join("_");

          if (local.length > 2) {
            var domain = local.slice(Math.max(local.length - 2, 1)).join(".");
            if (reservedDomains.indexOf(domain) != -1) {
              appPart =  local[0];
            }
          }

          // DOT files are ignored.
          if (file[0] !== ".") {
            projects.push({
              "name"      : file,
              "localUrl"  : 'http://' + appPart + "." + host,
              "localPath" : path.resolve(dirPath, file)
            });
          }
        });

        poly.render("index.jade", { pkg: pkg, projects: projects, layout: "_layout.jade" }, function(error, body){
          rsp.end(body)
        });
      })
    } else {
      next();
    }
  }
}

middelware.hostByDomainProjectFinder = function(dirPath){
  return function(req, rsp, next){
    var host        = req.headers.host;
    var hostname    = host.split(':')[0];
    var matches     = [];
    req.projectPath = dirPath +'/'+hostname
    next()
}


middelware.hostProjectFinder = function(dirPath){
  return function(req, rsp, next){
    var host        = req.headers.host;
    var hostname    = host.split(':')[0];
    var matches     = [];

    fs.readdir(dirPath, function(err, files){
    
      var appPart = hostname.split(".")[0];
      files.forEach(function(file){
        var fp = file.split('.');
        var filePart;
        // Check against Reserved Domains first.
        if (fp.length > 2) {
          var domain = fp.slice(Math.max(fp.length - 2, 1)).join(".");
          if (reservedDomains.indexOf(domain) != -1) {
            fp = fp.slice(0, Math.max(fp.length - 2))
          }
        }

        filePart = fp.join("_");
        if (appPart == filePart) {
          matches.push(file);
        }
      });

      if(matches.length > 0){
        req.projectPath = path.resolve(dirPath, matches[0]);
        next();
      } else {
        rsp.end("Cannot find project")
      }

    });
          
  }
}



/**
 * Fallbacks
 *
 * This is the logic behind rendering fallback files.
 *
 *  1. return static 200.html file
 *  2. compile and return 200.xxx
 *  3. return static 404.html file
 *  4. compile and return 404.xxx file
 *  5. default 404
 *
 * It is broken into two public functions `fallback`, and `notFound`
 *
 */

var fallback = middelware.fallback = [custom200static, custom200dynamic, notFound]
/*
function(req, rsp, next){
  skin(req, rsp, [custom200static, custom200dynamic, notFound], next)
}
*/

middelware.db = function(req, rsp, next){
  skin(req, rsp, [
    poly,
    function(req, rsp, next){   
      req.setup.config.globals.title="DAMN!"
      /*
      const sourceFile= {
        "projectPath" : "/path/to/app",
        "publicPath"  : "/path/to/app/public",
        "config"      : { "globals": req.setup.config.globals }
      }
      */
      
      
      
      var sourceFile = 'index.ejs'
      // Will look automaticly for layout of that ejs file :)
      
      var planet = prerender.root(req.projectPath+'/videos', { "title": "Bitchin" })

      planet.render(sourceFile, { "title": "Override the global title" }, function(error, body){
        // console.log(error,body)
        if(error){
          // TODO: make this better
          rsp.statusCode = 404;
          rsp.end("There is an error in your " + sourceFile + " file")
        }else{
          if(!body) return next()
          // console.log(JSON.stringify(body))
          // Option for setting headers in data json
          if (req.setup.config.headers) console.log(req.setup.config.headers)
          
          var type    = helpers.mimeType("html")
          var charset = mime.charsets.lookup(type)
          rsp.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
          rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
          rsp.statusCode = 200;
          rsp.end(body)
        }

      })


    }
  ], next)
}


var notFound = middelware.notFound = [custom404static, custom404dynamic, default404]
/*
function(req, rsp, next){
  skin(req, rsp, [custom404static, custom404dynamic, default404], next)
}
*/

/**
 * Custom 200
 *
 *  1. return static 200.html file
 *  2. compile and return 200.xxx file
 *
 */

var custom200static = function(req, rsp, next){
  fs.readFile(path.resolve(req.setup.publicPath, "200.html"), function(err, contents){
    if(contents){
      var body    = contents.toString()
      var type    = helpers.mimeType("html")
      var charset = mime.charsets.lookup(type)
      rsp.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''))
      rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
      rsp.statusCode = 200
      rsp.end(body)
    }else{
      next()
    }
  })
}

/**
 * Custom 200 (jade, md, ejs, pug)
 *
 *  1. return static 200.html file
 *  2. compile and return 404.xxx file
 *
 */

var custom200dynamic = [poly, function(){
    var priorityList  = prerender.helpers.buildPriorityList("200.html")
    var sourceFile    = prerender.helpers.findFirstFile(req.setup.publicPath, priorityList)
    if(!sourceFile) return next()

    req.poly.render(sourceFile, function(error, body){
      if(error){
        // TODO: make this better
        rsp.statusCode = 404;
        rsp.end("There is an error in your " + sourceFile + " file")
      }else{
        if(!body) return next()
        var type    = helpers.mimeType("html")
        var charset = mime.charsets.lookup(type)
        if (req.setup.config.headers) console.log(req.setup.config.headers)
        rsp.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
        rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
        rsp.statusCode = 200;
        rsp.end(body)
      }
    })
  }]

/*
function(req, rsp, next){
  
  skin(req, rsp, [poly], function(){
    var priorityList  = prerender.helpers.buildPriorityList("200.html")
    var sourceFile    = prerender.helpers.findFirstFile(req.setup.publicPath, priorityList)
    if(!sourceFile) return next()

    req.poly.render(sourceFile, function(error, body){
      if(error){
        // TODO: make this better
        rsp.statusCode = 404;
        rsp.end("There is an error in your " + sourceFile + " file")
      }else{
        if(!body) return next()
        var type    = helpers.mimeType("html")
        var charset = mime.charsets.lookup(type)
        if (req.setup.config.headers) console.log(req.setup.config.headers)
        rsp.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
        rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
        rsp.statusCode = 200;
        rsp.end(body)
      }
    })
  })

}
*/


/**
 * Custom 404 (html)
 *
 *  1. return static 404.html file
 *  2. compile and return 404.xxx file
 *
 * TODO: cache readFile IO
 *
 */

var custom404static = function(req, rsp, next){
  fs.readFile(path.resolve(req.setup.publicPath, "404.html"), function(err, contents){
    if(contents){
      var body    = contents.toString()
      var type    = helpers.mimeType("html")
      var charset = mime.charsets.lookup(type)
      rsp.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''))
      rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
      rsp.statusCode = 404
      rsp.end(body)
    }else{
      next()
    }
  })
}


/**
 * Custom 404 (pug,jade, md, ejs)
 *
 *  1. return static 404.html file
 *  2. compile and return 404.xxx file
 *
 */

var custom404dynamic = [poly, function(){
    var priorityList  = prerender.helpers.buildPriorityList("404.html")
    var sourceFile    = prerender.helpers.findFirstFile(req.setup.publicPath, priorityList)
    if(!sourceFile) return next()

    req.poly.render(sourceFile, function(error, body){
      if(error){
        // TODO: make this better
        rsp.statusCode = 404;
        rsp.end("There is an error in your " + sourceFile + " file")
      }else{
        if(!body) return next()
        var type    = helpers.mimeType("html")
        var charset = mime.charsets.lookup(type)
        rsp.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
        rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
        rsp.statusCode = 404;
        rsp.end(body)
      }
    })
  }]
/*
function(req, rsp, next){
  skin(req, rsp, [poly], function(){
    var priorityList  = prerender.helpers.buildPriorityList("404.html")
    var sourceFile    = prerender.helpers.findFirstFile(req.setup.publicPath, priorityList)
    if(!sourceFile) return next()

    req.poly.render(sourceFile, function(error, body){
      if(error){
        // TODO: make this better
        rsp.statusCode = 404;
        rsp.end("There is an error in your " + sourceFile + " file")
      }else{
        if(!body) return next()
        var type    = helpers.mimeType("html")
        var charset = mime.charsets.lookup(type)
        rsp.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
        rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
        rsp.statusCode = 404;
        rsp.end(body)
      }
    })
  })
}
*/

/**
 * Default 404
 *
 * No 200 nor 404 files were found.
 *
 */

var default404 = function(req, rsp, next){
  var locals = {
    project: req.headers.host,
    name: "Page Not Found",
    pkg: pkg
  }
  prerender.root(__dirname + "/templates").render("404.jade", locals, function(err, body){
    var type    = helpers.mimeType("html")
    var charset = mime.charsets.lookup(type)
    console.log(rsp.header())
    rsp.set('Content-Type', type + (charset ? '; charset=' + charset : ''));
    rsp.statusCode = 404
    rsp.set('Content-Length', Buffer.byteLength(body, charset));
    rsp.end(body)
  })
}


/**
 * Underscore
 *
 * Returns 404 if path contains beginning underscore or other ignored files
 *
 */
middelware.underscore = function(req, rsp, next){
  if(prerender.helpers.shouldIgnore(req.url)){
    console.log('FIRE NOT FOUND')
    notFound(req, rsp, next)
  }else{
    next()
  }
}

/**
 * Modern Web Language
 *
 * Returns 404 if file is a precompiled
 *
 */
middelware.mwl = function(req, rsp, next){
  var ext = path.extname(req.url).replace(/^\./, '')
  req.originalExt = ext

  // This prevents the source files from being served, but also
  // has to factor in that in this brave new world, sometimes
  // `.html` (Handlebars, others), `.css` (PostCSS), and
  // `.js` (Browserify) are actually being used to specify
  // source files

  if (['js'].indexOf(ext) === -1) {
    if (prerender.helpers.processors["html"].indexOf(ext) !== -1 || prerender.helpers.processors["css"].indexOf(ext) !== -1 || prerender.helpers.processors["js"].indexOf(ext) !== -1) {
      notFound(req, rsp, next)
    } else {
      next()
    }
  } else {
    next()
  }
}


/*
  SetHeaders


*/
middelware.setConfigHeaders = function() {
  if (req.setup.config.headers) console.log(req.setup.config.headers)
  // rsp.setHeader('Content-Type', mimeType + (charset ? '; charset=' + charset : ''))
  // rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
  // rsp.
}



/**
 * Static
 *
 * Serves up static page (if it exists).
 *
 */
middelware.static = function(req, res, next) {
      /*
      if (single) res.staticPath = folderpath
        else res.staticPath = folderpath + '/' + req.headers.host
      
      debug(res.staticPath,req.originalUrl)
      
      // worker.scServer.emit('rand', 555)
      
      try {
          // Query the entry
          stats = fs.lstatSync(res.staticPath + req.originalUrl);

          // Is it a directory?
          if (stats.isFile()) {
          // Apply Security Filters
          /*
          if (req.originalUrl.indexOf('.php') > -1 ) return res.end('404')
          if (req.originalUrl.indexOf('_views') > -1 ) return res.end('404')
          if (req.originalUrl.indexOf('_') == 1 ) return res.end('404')
          if (req.originalUrl.indexOf('.') == 1 ) return res.end('404')
          if (req.originalUrl.indexOf('.pug') > -1 ) return res.end('404')
          if (req.originalUrl.indexOf('.jade') > -1 ) return res.end('404')
          if (req.originalUrl.indexOf('.ejs') > -1 ) return res.end('404')
          /*
          express.static(res.staticPath)(req, res, next)
          
          
          
              
          return static(req, res, next)
          } else next()
      }
      catch (e) {
          // Call next middleware??
          next()
      }
      */

console.log('Static')
  var options  = {}
  var redirect = true

  if ('GET' != req.method && 'HEAD' != req.method) return next()
  
  // Fixes JS Delivery
  // if (['js'].indexOf(path.extname(req.url).replace(/^\./, '')) !== -1) return next()
  
  var pathn = parse(req).pathname;
  var pause = utilsPause(req);
  
  function resume() {
    next();
    pause.resume();
  }

  function directory() {
    if (!redirect) return resume();
    var pathname = url.parse(req.originalUrl).pathname;
    res.statusCode = 301;
    res.setHeader('Location', pathname + '/');
    res.end('Redirecting to ' + utilsEscape(pathname) + '/');
  }

  function error(err) {
    if (404 == err.status){
      // look for implicit `*.html` if we get a 404
      return path.extname(err.path) === ''
        ? serve(pathn + ".html")
        : resume()
    }
    next(err);
  }

  var serve = function(pathn){
    
    send(req, pathn, {
        maxage: options.maxAge || 0,
        root: req.setup.publicPath,
        hidden: options.hidden
      })
      .on('directory', directory)
      .on('error', error)
      .pipe(res)
  }
  
  // return express.static(req.setup.publicPath)(req, res, next)
    serve(pathn)
}

/**
 * Opens the (optional) dssrv.json file and sets the config settings.
 */

middelware.setup = function(req, rsp, next){
  if(req.hasOwnProperty('setup')) return next()

  try{
    req.setup = helpers.setup(req.projectPath)
    if (req.setup.config.headers) {
      //res.header("X-powered-by", "Blood, sweat, and tears")
      //res.header(req.setup.config.headers[0][0], req.setup.config.headers[0][1])
    }
    
  }catch(error){
    error.stack = helpers.stacktrace(error.stack, { lineno: error.lineno })

    var locals = {
      project: req.headers.host,
      error: error,
      pkg: pkg
    }

    return prerender.root(__dirname + "/templates").render("error.jade", locals, function(err, body){
      rsp.statusCode = 500
      rsp.end(body)
    })
  }

  next()
}

/**
 * Basic Auth
 */

middelware.basicAuth = function(req, res, next){

  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    
    return res.sendStatus(401);
  };

  // default empty
  var creds = []

  
  if(req.setup.config.hasOwnProperty("basicAuth") && req.setup.config["basicAuth"] instanceof Array) {
    // allow array
    creds = req.setup.config["basicAuth"]
  } else if(req.setup.config.hasOwnProperty("basicAuth") && typeof req.setup.config["basicAuth"] === 'string') {
    // allow string
    creds.push(req.setup.config["basicAuth"])
  }

  // move on if no creds
  if(creds.length === 0) return next();
  else {
      // return next()
      var user = cbasicAuth(req);

      if (!user || !user.name || !user.pass) {
        console.log(creds.length);
        // process.exit(creds)
        return unauthorized(res);
      };

      
      for (var i=0; i < creds.length; i++ ) {
        if (user.name === 'foo' && user.pass === 'bar') {
          return next();
        } else if (i == creds.length-1) return unauthorized(res);
      }
      //console.log(creds);process.exit(creds)

  }

  /* use auth lib iterate over all creds provided
  cbasicAuth(function(user, pass){
    return creds.some(function(cred){
      return cred === user + ":" + pass
    })
  })(req, res, next)
  */
}

/**
 * Sets up the poly object
 */

var poly = middelware.poly = function(req, res, next){
  // console.log('Poly')
  if(req.hasOwnProperty("poly")) return next()

  try{
    req.poly = prerender.root(req.setup.publicPath, req.setup.config.globals)
    next()
  }catch(error){
    
    if (error.message.split(':')[0] == 'ENOENT') {
      var locals = {
        project: req.headers.host,
        error: error,
        pkg: pkg
      }
      locals.error.name = '404'
      locals.error.message = 'Domain not Configured'
      return prerender.root(__dirname + "/templates").render("error_project_not_found.jade", locals, function(err, body){
      var type    = helpers.mimeType("html")
      var charset = mime.charsets.lookup(type)
      res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
      res.statusCode = 404
      res.setHeader('Content-Length', Buffer.byteLength(body, charset));
      res.end(body)
    });
    } else {

      error.stack = helpers.stacktrace(error.stack, { lineno: error.lineno })
      var locals = {
        project: req.headers.host,
        error: error,
        pkg: pkg
      }

      //  res.end("Cannot find project for: "+)
      
      return prerender.root(__dirname + "/templates").render("error.jade", locals, function(err, body){
        res.statusCode = 500
        res.end(body)
      })
    }
  }
  
}


/**
 * Asset Pipeline
 */

middelware.process = function(req, rsp, next){
  var normalizedPath  = helpers.normalizeUrl(req.url)
  var priorityList    = prerender.helpers.buildPriorityList(normalizedPath)
  var sourceFile      = prerender.helpers.findFirstFile(req.setup.publicPath, priorityList)


  /**
   * We GTFO if we don't have a source file.
   */

  if(!sourceFile){
    if (path.basename(normalizedPath) === "index.html") {
      var pathAr = normalizedPath.split(path.sep); pathAr.pop() // Pop index.html off the list
      var prospectCleanPath       = pathAr.join("/")
      var prospectNormalizedPath  = helpers.normalizeUrl(prospectCleanPath)
      var prospectPriorityList    = prerender.helpers.buildPriorityList(prospectNormalizedPath)
      prospectPriorityList.push(path.basename(prospectNormalizedPath + ".html"))

      sourceFile = prerender.helpers.findFirstFile(req.setup.publicPath, prospectPriorityList)

      if (!sourceFile) {
        return next()
      } else {
        // 301 redirect
        rsp.statusCode = 301
        rsp.setHeader('Location', prospectCleanPath)
        rsp.end('Redirecting to ' + utilsEscape(prospectCleanPath))
      }

    } else {
      return next()
    }
  } else {

    /**
     * Now we let prerender handle the asset pipeline.
     */

    req.poly.render(sourceFile, function(error, body){
      if(error){
        error.stack = helpers.stacktrace(error.stack, { lineno: error.lineno })

        var locals = {
          project: req.headers.host,
          error: error,
          pkg: pkg
        }
        if(prerender.helpers.outputType(sourceFile) == 'css'){
          var outputType = prerender.helpers.outputType(sourceFile)
          var mimeType   = helpers.mimeType(outputType)
          var charset    = mime.charsets.lookup(mimeType)
          var body       = helpers.cssError(locals)
          rsp.statusCode = 200
          // SetHeaders
          rsp.setHeader('Content-Type', mimeType + (charset ? '; charset=' + charset : ''))
          rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
          rsp.end(body)
        }else{

          // Make the paths relative but keep the root dir.
          // TODO: move to helper.
          //
          // var loc = req.projectPath.split(path.sep); loc.pop()
          // var loc = loc.join(path.sep) + path.sep
          // if(error.filename) error.filename = error.filename.replace(loc, "")

          prerender.root(__dirname + "/templates").render("error.jade", locals, function(err, body){
            var mimeType   = helpers.mimeType('html')
            var charset    = mime.charsets.lookup(mimeType)
            rsp.statusCode = 500
            rsp.setHeader('Content-Type', mimeType + (charset ? '; charset=' + charset : ''))
            rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
            rsp.end(body)
          })
        }
      }else{
        // 404
        if(!body) return next()

        var outputType = prerender.helpers.outputType(sourceFile)
        var mimeType   = helpers.mimeType(outputType)
        var charset    = mime.charsets.lookup(mimeType)
        rsp.statusCode = 200
        rsp.setHeader('Content-Type', mimeType + (charset ? '; charset=' + charset : ''))
        rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
        rsp.end(body);
      }
    })
  }

}


module.exports = middelware