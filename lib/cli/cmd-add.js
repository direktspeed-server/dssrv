var cmdInit = require('./cmd-init');
var runBinary = require('./run-binary');
var types = ['app', 'plugin', 'generator'];

// `dssrv add app [folder]`       => `donejs add app [folder]`       => `donejs-cli init [folder]`
// `dssrv add plugin [folder]`    => `donejs add plugin [folder]`    => `donejs-cli init [folder] --type=plugin`
// `dssrv add generator [name]`   => `donejs add generator [name]`   => `donejs-cli init [folder] --type=generator`
// `dssrv add <name> [params...]` => `donejs add <name> [params...]` => `donejs-cli add <name> [params...]`
module.exports = function(type, params, options) {

  // handles commands with the following shape `donejs add <type> [folder]`
  if (types.indexOf(type) !== -1) {
    var folder = params[0];

    if (type !== 'app') {
      options.type = type;
    }

    return cmdInit(folder, options);
  }
  // handles commands with the following shape `donejs add <name> [params...]`
  else {
    var args = ['add', type].concat(params);
    return runBinary(args, options, types);
  }
};

