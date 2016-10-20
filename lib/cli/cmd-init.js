var fs = require('fs');
var path = require('path');
var utils = require('../helpers.js');
var runBinary = require('./run-binary');
var mypkg = require(path.join(__dirname, '..', '..', 'package.json'));

module.exports = function(folder, opts) {
  return utils.mkdirp(folder)
    .then(function(folderPath) {
      var folderModules = path.join(folderPath, 'node_modules');

      // create an empty node_modules inside the target `folder`, this
      // will prevent npm to install the dependencies in any node_modules
      // folder but the one inside `folder`.
      if (!fs.existsSync(folderModules)) {
        fs.mkdirSync(folderModules);
      }

      console.log('Initializing new dssrv application at', folderPath);
      console.log('Installing dssrv-cli');

      return installCli(mypkg.version, { cwd: folderPath })
    });
};

// install dssrv-cli
function installCli(version, options) {
  var pkg = 'dssrv-cli@^' + utils.versionRange(version);
  var pkgManager
  try {
    //var child = spawn('npm', ['list', '-g', '-depth', '0'], { stdio: 'inherit' });
    pkgManager = 'yarn'
    
    // return 
    utils.spawn('yarn',[ 'add', pkg ], options);
    runCliInit(options.cwd, options)
    // return null, options
  } catch (e){
    console.log(e)
    pkgManager = 'npm'
    var npmArgs = [ 'install', pkg, '--loglevel', 'error' ];
    utils.spawn('npm', npmArgs, options);
    runCliInit(options.cwd, options)
  }



  /// var child = spawn('npm', ['list', '-g', '-depth', '0'], { stdio: 'inherit' });
  
}

// run dssrv-cli init
function runCliInit(folderPath, options) {
  var initArgs = ['init'];

  // cd into the newly created folder, this way runBinary
  // gets the root folder correctly.
  process.chdir(folderPath);

  if (options.skipInstall) {
    initArgs.push('--skip-install');
  }

  if (options.type) {
    initArgs.push('--type', options.type);
  }

  options.cwd = folderPath;
  return runBinary(initArgs, options);
}