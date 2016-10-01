var should      = require("should")
var request     = require('request')
var path        = require("path")
var fs          = require("fs")
var exec        = require("child_process").exec
var dssrv        = require("../")()

describe("basic", function(){
  var projectPath = path.join(__dirname, "apps/basic")
  var outputPath  = path.join(__dirname, "out/basic")

  var config;

  before(function(done){
    dssrv.compile(projectPath, outputPath, function(errors, output){
      config = output
      dssrv.server(projectPath, { port: 8100 }, done)
    })
  })

  it("should have node version in config", function(done){
    console.log(config.dssrv_version)
    config.should.have.property("dssrv_version")
    done()
  })

  it("should have global vars", function(done){
    var staticGlobals = require(path.join(outputPath, "globals.json"))
    staticGlobals.should.have.property("environment", "production")
    staticGlobals.should.have.property("public")
    request('http://localhost:8100/globals.json', function (e, r, b) {
      console.log(e,b)
      r.statusCode.should.eql(200)
      var dynamicGlobals = JSON.parse(b)
      dynamicGlobals.should.have.property("environment", "development")
      dynamicGlobals.should.have.property("public")
      done()
    })
  })

  it("should have current vars", function(done){
    var staticCurrent = require(path.join(outputPath, "current.json"))
    
    staticCurrent.should.have.keys("path","source")
    // needs check if path = ['current.json']
    
    request('http://localhost:8100/current.json', function (e, r, b) {
      r.statusCode.should.eql(200)
      var dynamicCurrent = JSON.parse(b)
      dynamicCurrent.should.have.keys("path", "source") 
          // needs check if path = ['current.json'] 
      done()
    })
  })

  it("should have index file that uses the layout", function(done){
    fs.readFile(path.join(outputPath, "index.html"), function(err, contents){
      contents.toString().should.be.an.String().and.not.empty().and.match(/Kitchen Sink/);//fixed
      contents.toString().should.be.an.String().and.not.empty().and.match(/Home/);//fixed
      //contents.toString().should.include("Kitchen Sink")
      // contents.toString().should.include("Home")
      request('http://localhost:8100/', function (e, r, b) {
        r.statusCode.should.eql(200)
        b.should.be.an.String().and.not.empty().and.match(/Kitchen Sink/);//fixed
        b.should.be.an.String().and.not.empty().and.match(/Home/);//fixed
        //b.should.include("Kitchen Sink")
        // b.should.include("Home")
        done()
      })
    })
  })

  it("should have custom 404 page that does not use layout", function(done){
    fs.readFile(path.join(outputPath, "404.html"), function(err, contents){
      contents.toString().should.be.an.String().and.not.empty().and.not.match(/Kitchen Sink/);//fixed
      // contents.toString().should.not.include("Kitchen Sink")
      contents.toString().should.be.an.String().and.not.empty().and.match(/Custom, Page Not Found/);//fixed
      // contents.toString().should.include("Custom, Page Not Found")
      request('http://localhost:8100/some/missing/path', function (e, r, b) {
        r.statusCode.should.eql(404)
        r.headers.should.have.property("content-type", "text/html; charset=UTF-8")
        b.should.be.an.String().and.not.empty().and.not.match(/Kitchen Sink/);//fixed

        b.should.be.an.String().and.not.empty().and.match(/Custom, Page Not Found/);//fixed
        //b.should.not.include("Kitchen Sink")
        // b.should.include("Custom, Page Not Found")
        b.should.eql(contents.toString())
        done()
      })
    })
  })

  it("should return CSS file", function(done){
    fs.readFile(path.join(outputPath, "css", "main.css"), function(err, contents){
      contents.toString().should.be.an.String().and.not.empty().and.match(/background/);
      // contents.toString().should.include("background")
      request('http://localhost:8100/css/main.css', function (e, r, b) {
        r.statusCode.should.eql(200)
        // b.should.include("background")
        b.should.be.an.String().and.not.empty().and.match(/background/);
        b.should.eql(contents.toString())
        done()
      })
    })
  })

  it("should return proper mime type on 404 page", function(done){
    request('http://localhost:8100/some/missing/path.css', function (e, r, b) {
      r.statusCode.should.eql(404)
      r.headers.should.have.property("content-type", "text/html; charset=UTF-8")
      done()
    })
  })

  it("should render HTML page without requiring extension", function(done){
    fs.readFile(path.join(outputPath, "basic.html"), function(err, contents){
      contents.toString().should.be.an.String().and.not.empty().and.not.match(/Kitchen Sink/)
      contents.toString().should.be.an.String().and.not.empty().and.match(/<h1>Basic HTML Page/)
      request('http://localhost:8100/basic', function(e,r,b){
        r.statusCode.should.eql(200)
        // b.should.not.include("Kitchen Sink")
        // b.should.include("<h1>Basic HTML Page</h1>")
        b.should.be.an.String().and.not.empty().and.not.match(/Kitchen Sink/)
        b.should.be.an.String().and.not.empty().and.match(/<h1>Basic HTML Page/)
        b.should.eql(contents.toString())
        done()
      })
    })
  })

  it("should not return file starting with underscore", function(done){
    request('http://localhost:8100/shared/_nav.jade', function(e,r,b){
      r.statusCode.should.eql(404)
      done()
    })
  })

  it("should render HTML page with spaces in the file name", function(done){
    request('http://localhost:8100/articles/with%20spaces', function(e,r,b){
      r.statusCode.should.eql(200)
      b.should.be.an.String().and.not.empty().and.match(/foo article/)
      done()
    })
  })

  after(function(done){
    exec("rm -rf " + outputPath, function(){
      done()
    })
  })

})
