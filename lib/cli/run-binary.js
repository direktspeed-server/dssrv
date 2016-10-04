var Q = require('q');
var fs = require('fs');
var path = require('path');
var prerender     = require("dssrv-srv-prerender")()
var utils = prerender.helpers;

module.exports = function(args, options, types) {
  options = options || {};

  return utils.projectRoot()
    .then(function(root) {
      var dssrv = process.platform === 'win32' ? 'dssrv.cmd' : 'dssrv';
      var dsServerBinary = path.join(root, 'node_modules', '.bin', dssrv);

      if (!fs.existsSync(dsServerBinary)) {
        var msg = 'Could not find local dssrv binary (' + dsServerBinary + ')';

        if(args[0] === 'add') {
          msg += '\nAllowed types for a new project are: ' + (types || []).join(', ');
        }

        return Q.reject(new Error(msg));
      }

      if (!options.cwd) {
        options.cwd = root;
      }

      return utils.spawn(dsServerBinary, args, options);
    });
};