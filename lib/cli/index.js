#!/usr/bin/env node
/*
 * @page index DSSRV
 * @tag home
 *
 * ###DIREKTSPEED Server
 *  
 * Our DSSRV only has two classes:
 *  
 * * server 
 * * server 
 */
// needs reading of $PWD for accepting .
var nodePath      = require("path")
var program       = require("commander")
var fse           = require("fs-extra")
var downloadRepo  = require("download-github-repo")
var pkg           = require("../../package.json")

var prerender     = require("dssrv-srv-prerender")()

//var helpers       = require("../helpers")
var log           = prerender.helpers.log
var chalk         = require('chalk')
var runBinary     = require('./run-binary')
// var dssrv         = require("../")()

var output = function(msg){
  var v = pkg.version
  console.log("------------")
  console.log("DIREKTSPEED Server v" + v + " – DIREKTSPEED. 2015–2017")
  if(msg){
    console.log(msg)
    console.log("Press Ctl+C to stop the server")
  }
  console.log("------------")
}

program
  .version(pkg.version)


program
  .command("server [path]")
  .option("-i, --ip <ip>", "Specify IP to bind to")
  .option("-p, --port <port>", "Specify a port to listen on")
  .option("-c, --config <path>", "Specify a port to listen on")
  .usage("starts a DIREKTSPEED Server in current directory, or in the specified directory.")
  .description("Start a DIREKTSPEED Server in current directory")
  .action(function(path, program){
    var projectPath = nodePath.resolve(process.cwd(), path || "")
    var ip          = program.ip || '0.0.0.0'
    var port        = program.port || 9000
    var options = { 
      ip: ip, 
      port: port 
    }
    
    prerender.server(projectPath, options, function(){
      var address = ''
      if(ip == '0.0.0.0' || ip == '127.0.0.1') {
        address = 'localhost'
      } else {
        address = ip
      }
      var hostUrl = "http://" + address + ":" + port + "/"
      output("Your server is listening at " + hostUrl)
    })
  })

program
  .command("multihost [path]")
  .option("-i, --ip <ip>", "Specify IP to bind to")
  .option("-p, --port <port>", "Specify a port to listen on")
  .option("-c, --config <path>", "Specify a port to listen on")
  .usage("starts a DIREKTSPEED Server to host a directory of DIREKTSPEED Server projects.")
  .description("Start a DIREKTSPEED Server to host a directory of DIREKTSPEED Server projects")
  .action(function(path, program){
    var projectPath = nodePath.resolve(process.cwd(), path || "")
    var port        = program.port || 9000
    var options = { 
      port: port 
    }
    
    prerender.multihost(projectPath, options, function(){
      if(port == "80"){
        var loc = "http://dssrv.nu"
      }else{
        var loc = "http://dssrv.nu:" + port
      }
      output("Your server is hosting multiple projects at " + loc)
    })
  })

program.on("--help", function(){
  console.log("  Use 'dssrv <command> --help' to get more information or visit http://server.dspeed.eu/ to learn more.")
  console.log('')
})






// commands
var add = require('./cmd-add');
var init = require('./cmd-init');
var help = require('./cmd-help');



// dssrv add
program.command('add <type> [params...]')
  .option('-S, --skip-install')
  .usage(cmdAddUsage())
  .action(function(type, params, options) {
    log(add(type, params, options));
  });

/* DEPRECATED: dssrv init
  program.command('init [folder]')
  .option('-S, --skip-install')
  .option('-T, --type [type]')
  .description('Initialize a new dssrv application in a new folder or the current one')
  .action(function(folder, options) {
    deprecationNotice('dssrv init [folder]', 'dssrv add app [folder]');
    log(init(folder, options));
  });

// DEPRECATED: dssrv plugin
program.command('plugin [folder]')
  .option('-S, --skip-install')
  .description('Initialize a new dssrv plugin in a new folder or the current one')
  .action(function(folder, opts) {
    deprecationNotice('dssrv plugin [folder]', 'dssrv add plugin [folder]');
    opts.type = 'plugin';
    log(init(folder, opts));
  });
*/

program.command('help')
  .description('Show all dssrv commands available for this application')
  .action(function() {
    log(help());
  });

// dssrv <anything else>
program.command('*')
  .description('Run dssrv commands using the current dssrv application')
  .action(function() {
    runBinary(program.rawArgs.slice(2));
  });

function deprecationNotice(deprecated, instead) {
  console.log();
  console.log(chalk.yellow('DEPRECATION NOTICE:'));
  console.log();
  console.log('     ' + chalk.gray(deprecated) + ' is deprecated');
  console.log();
  console.log('     Use ' + chalk.inverse(instead) + ' instead');
  console.log();
}

function cmdAddUsage() {
  var usage =
    '[options] app [folder] \n' +
    '\t add [options] plugin [folder] \n' +
    '\t add [options] generator [name] \n' +
    '\t add [options] <name> [params...] \n\n' +
    '  Types: \n\n' +
    '    app,       Initializes a new app\n' +
    '    plugin,    Initializes a new plugin\n' +
    '    generator, Initializes a basic generator\n' +
    '    <name>,    Runs built-in or third party dssrv generators\n'+
    'to get more information or visit http://server.dspeed.eu/ to learn more.';
  return usage;
}

module.exports = program