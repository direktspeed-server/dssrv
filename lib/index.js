const 
  path        = require('path'),
  fs          = require('fs-extra'),
  express     = require('express'),
  prerender   = require('dssrv-srv-prerender')(),
  async       = require('async'),
//  connect     = require('connect')
  mime        = require('mime'),
  helpers     = prerender.helpers,
//  helpers     = require('./helpers'),
  middleware  = prerender.middleware,
//  middleware  = require('./middleware'),
  pkg         = require('../package.json')
  
var
  app         = express()
  

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

  /*
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
*/
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

  this.server =  prerender.server


  /**
   * Multihost
   *
   * Host multiple DIREKTSPEED Server applications.
   *
   */

  this.multihost = prerender.multihost

  /**
   * Mount
   *
   * Offer the asset pipeline as connect middleware
   *
   */
  this.mount = prerender.mount


  /**
   * Pipeline
   *
   * Offer the asset pipeline as connect middleware
   *


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
   */
  this.pkg = pkg

  /**
   * Export middleware
   *
   * Make sure middleware is accessible
   * when using dssrv as a library
   *
   */
  this.middleware = preremder.middleware;

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

