var should      = require("should")
var dssrv = require('../lib');
var middleware = require('../lib/middleware');

describe("dssrv as a library", function() {

  it("should expose a mount function", function() {
    should(dssrv.mount).be.type('function');
  });

  it("should expose the middleware", function() {
    should(dssrv.middleware).be.equal(middleware);
  });

});
