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
        .then(function() {
          return runCliInit(folderPath, opts);
        });
    });
};

// install dssrv-cli
function installCli(version, options) {
  var pkg = 'dssrv-cli@' + utils.versionRange(version);
  var npmArgs = [ 'install', pkg, '--loglevel', 'error' ];
  return utils.spawn('npm', npmArgs, options);
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