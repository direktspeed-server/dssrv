const 
  path        = require('path'),
  fs          = require('fs-extra'),
  express     = require('express'),
  prerender   = require('dssrv-prerender'),
  async       = require('async'),
//  connect     = require('connect')
  mime        = require('mime'),
  helpers     = require('./helpers'),
  middleware  = require('./middleware'),
  pkg         = require('../package.json')
  
var
  app         = express()
  
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

  middleware.routerMount = function(mountPoint, root){

    if(!root){
      root = mountPoint
      mountPoint = null
    }else{
      var rx = new RegExp("^" + mountPoint)
    }

    var finder = middleware.regProjectFinder(root)

    app.use([
      middleware.headerProcessing,
      middleware.replaceDevHosts,
      function(req, rsp, next){

        if(rx){
          if(!req.url.match(rx)) return next()
          var originalUrl = req.url
          req.url         = req.url.replace(rx, "/")
        }

        finder(req, rsp, function(){
          middleware.setup(req, rsp, function(){
            middleware.staticExpress(req, rsp, function(){
              middleware.static(req, rsp, function(){
                middleware.poly(req, rsp, function(){
                  middleware.process(req, rsp, function(){
                    if(originalUrl) req.url = originalUrl
                    next()
                  })
                })
              })
            })
          })
        })
      
      }
    ])
    
    return app
  }

  middleware.headerProcessing = function(req, res, next) {
      
        res.header("X-powered-by", "DIREKTSPEED Server - Blood, sweat, and tears")

        if (req.headers['X-debug']) {
          // d
        } else if (req.headers['X-target']) {
          // d
        } else next()
      }
      
  middleware.replaceDevHosts = function (req, res, next) {
        // replace dev test hosts
        if (req.headers.Host) {
          req.headers.host = req.headers.Host
          delete req.headers.Host
        }
        
        req.originalHost = req.headers.host
        req.headers.host = req.headers.host.toLowerCase()
        req.headers.host = req.headers.host.replace('.new','')
        req.headers['host'] = req.headers.host.replace('.local','')
        req.headers.host = req.headers.host.replace('proxy.','').split(':')[0]
        
        next()
      } 

  middleware.appByVhost = function (req, res, next){

          if (!req.headers.host) return next();
          var host = req.headers.host.split(':')[0]; // I prefer to trim ports aways

          // Implament Routing on URL    
          var debug = require('debug')('vhostrouter:'+process.pid);
          debug('VHOSTS EXEC: ' + JSON.stringify(req.headers))
          // debug('VHOSTS EXEC: ' + JSON.stringify(req.app.locals.hostDictionary))
          // console.log(req.app.locals.hostDictionary)
          if (req.trustProxy && req.headers["x-forwarded-host"]) {
            host = req.headers["x-forwarded-host"].split(':')[0];
          }
          
          if (req.originalUrl.indexOf('/apps') > -1) {
            var server = req.app.locals.hostDictionary['apps.domain.tld']
          }
          
          if (!server) {
           var server = req.app.locals.hostDictionary[host];
          }
          if (!server){
            server = req.app.locals.hostDictionary['*' + host.substr(host.indexOf('.'))];
          }

          if (!server){ 
            server = req.app.locals.hostDictionary['default'];
          }

          // console.log(JSON.stringify(Vhost.hostDictionary))
          // console.log()

          if (!server) return next();
          
          if ('function' == typeof server) return server(req, res, next);
          server.emit('request', req, res);
          // next()
      }






  // TODO: integrate this

    middleware.checkPHP = function (req,res,next) {
    
        res.header("X-powered-by", "DIREKTSPEED Server - Blood, sweat, and tears")
        res.header("Vary", "Accept-Encoding")
    
      if (req.originalUrl.indexOf('.php') > -1 ) {
        // req.target = ''
        require('../proxy')(req,res,next)
      } else next()
    
    }

    middleware.serveSites_handler = function (req, res, next) {
      // var options = options || [ '../sites', false]
      // var single = options[1]
      // var folderpath = options[0]
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
          */
          var static = express.static(res.staticPath)
          

          
              
          return static(req, res, next)
          } else next()
      }
      catch (e) {
          // Call next middleware??
          next()
      }
      

    }
    
  middleware.ejs_js = function (req,res,next) {
      if (req.originalUrl.indexOf('.js.') > -1) {
      try {
            // Query the entry
            stats = fs.lstatSync(res.staticPath + req.originalUrl+'.ejs');

            // Is it a directory?
            if (stats.isFile()) {
            // Render ejs as js
              var static = express.static(res.staticPath)
            return static(req, res, next)
            
            } else next()
        }catch (e) {
            // Call next middleware??
            next()
        }
      } else next()
    }
    
    
  middleware.staticExpress = function(req,res,next) {
    express.static(req.setup.publicPath)(req, res, next)    
  }
  middleware.mid_dssrv = function (req, res,next) {
      // dssrv.middleware.db        
      // call if res end if not called already should normaly not happen
      if (res.headerSent) return  res.end()
      var mime = require('mime')
      var path = require('path')
      var pathname = req.originalUrl;
      var mimeType = mime.lookup(pathname);
      var extension = path.extname(pathname);
      // set header 
      if (mimeType == 'application/octet-stream') mimeType = mime.lookup('htm')
      res.set('Content-Type', mimeType);
      middleware.routerMount(res.staticPath)(req, res, next)
    }

var endMid = [
      middleware.setup,
      middleware.basicAuth,
      middleware.underscore,
      middleware.mwl,
      middleware.staticExpress,
      middleware.static,
      middleware.poly,
      middleware.process,
      middleware.fallback
    ]


module.exports = function Dssrv(){
    
  if (!(this instanceof Dssrv)) {
     return new Dssrv();
  }
  
  /**
   * Server
   *
   * Host a single DIREKTSPEED Server application.
   *
   */

  this.server = function(dirPath, options, callback){
    
    var options = options || {}
    
    app.use(function (req,res,next) {
      res.set('Access-Control-Allow-Origin', 'http://'+req.headers.host)
      next()
    })
    
    app = middleware.configureVhosts(app, options)


    app.use([
      middleware.headerProcessing,
      middleware.replaceDevHosts,
      middleware.regProjectFinder(dirPath)
    ])


    
    app.use(endMid)

    return app.listen(app.options.port, app.options.ip, function(){
      app.projectPath = dirPath
      callback.apply(app, arguments)
    })
  }


  /**
   * Multihost
   *
   * Host multiple DIREKTSPEED Server applications.
   *
   */

  this.multihost = function(dirPath, options, callback){
    var options = options || {}
    
    options.port = options.port || 9000
    app = middleware.configureVhosts(app, options)

    
    app.use([
      middleware.replaceDevHosts,
      middleware.headerProcessing,
      middleware.notMultihostURL,
      middleware.index(dirPath),
      middleware.hostProjectFinder(dirPath),
    ])

    app.use(endMid)
    
    return app.listen(options.port, options.ip, function(){
      app.projectPath = dirPath
      callback.apply(app, arguments)
    })
    // app.listen(options.port || 9000, callback)

  }

  /**
   * Mount
   *
   * Offer the asset pipeline as connect middleware
   *
   */
  this.mount = middleware.routerMount


  /**
   * Pipeline
   *
   * Offer the asset pipeline as connect middleware
   *
   */

  this.pipeline = function(root){
    console.log("Deprecated, please use MOUNT instead, this will be removed in a future version.");
    var publicPath = path.resolve(root)
    var terra = prerender.root(publicPath)

    return function(req, rsp, next){
      var normalizedPath  = helpers.normalizeUrl(req.url)
      var priorityList    = prerender.helpers.buildPriorityList(normalizedPath)
      var sourceFile      = prerender.helpers.findFirstFile(publicPath, priorityList)

      if(!sourceFile) return next()

      terra.render(sourceFile, function(error, body){
        if(error) return next(error)
        if(!body) return next() // 404

        var outputType = prerender.helpers.outputType(sourceFile)
        var mimeType   = helpers.mimeType(outputType)
        var charset    = mime.charsets.lookup(mimeType)
        
        rsp.statusCode = 200
        rsp.setHeader('Content-Type', mimeType + (charset ? '; charset=' + charset : ''))
        rsp.setHeader('Content-Length', Buffer.byteLength(body, charset));
        rsp.end(body)
      })

    }

  }

  this.pkg = pkg

  /**
   * Export middleware
   *
   * Make sure middleware is accessible
   * when using dssrv as a library
   *
   */
  this.middleware = middleware;

  /**
   * Compile
   *
   * Compiles Single DIREKTSPEED Server Application.
   *
   */

  this.compile = function(projectPath, outputPath, callback){

    /**
     * Both projectPath and outputPath are optional
     */

    if(!callback){
      callback   = outputPath
      outputPath = "www"
    }

    if(!outputPath){
      outputPath = "www"
    }


    /**
     * Setup all the paths and collect all the data
     */

    try{
      outputPath = path.resolve(projectPath, outputPath)
      var setup  = helpers.setup(projectPath, "production")
      var terra   = prerender.root(setup.publicPath, setup.config.globals)
    }catch(err){
      return callback(err)
    }


    /**
     * Protect the user (as much as possible) from compiling up the tree
     * resulting in the project deleting its own source code.
     */

    if(!helpers.willAllow(projectPath, outputPath)){
      return callback({
        type: "Invalid Output Path",
        message: "Output path cannot be greater then one level up from project path and must be in directory starting with `_` (underscore).",
        projectPath: projectPath,
        outputPath: outputPath
      })
    }


    /**
     * Compile and save file
     */

    var compileFile = function(file, done){
      process.nextTick(function () {
        terra.render(file, function(error, body){
          if(error){
            done(error)
          }else{
            if(body){
              var dest = path.resolve(outputPath, prerender.helpers.outputPath(file))
              fs.mkdirp(path.dirname(dest), function(err){
                fs.writeFile(dest, body, done)
              })
            }else{
              done()
            }
          }
        })
      })
    }


    /**
     * Copy File
     *
     * TODO: reference ignore extensions from a prerender helper.
     */
    var copyFile = function(file, done){
      var ext = path.extname(file)
      if(!prerender.helpers.shouldIgnore(file) && [".jade", ".ejs", ".md", ".styl", ".less", ".scss", ".sass", ".js", ".coffee", "pug"].indexOf(ext) === -1){
        var localPath = path.resolve(outputPath, file)
        fs.mkdirp(path.dirname(localPath), function(err){
          fs.copy(path.resolve(setup.publicPath, file), localPath, done)
        })
      }else{
        done()
      }
    }

    /**
     * Scan dir, Compile Less and Jade Pug, Copy the others
     */

    helpers.prime(outputPath, { ignore: projectPath }, function(err){
      if(err) console.log(err)

      helpers.ls(setup.publicPath, function(err, results){
        async.each(results, compileFile, function(err){
          if(err){
            callback(err)
          }else{
            async.each(results, copyFile, function(err){
              setup.config['dssrv_version'] = pkg.version
              // setup.config['dssrv_version'] = require('../package.json').version
              delete setup.config.globals
              callback(null, setup.config)
            })
          }
        })
      })
    })

  }

  return this

}

