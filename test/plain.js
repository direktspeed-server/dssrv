var should      = require("should")
var request     = require('request')
var path        = require("path")
var fs          = require("fs")
var exec        = require("child_process").exec
var dssrv        = require("../")

describe("plain", function(){
  var output = path.join(__dirname, "out/plain")

  describe("framework-style", function(){
    var projectPath = path.join(__dirname, "apps/plain/framework-style")
    var outputPath  = path.join(__dirname, "out/plain/framework-style")

    var config;

    before(function(done){
      dssrv.compile(projectPath, outputPath, function(errors, output){
        config = output
        dssrv.server(projectPath, { port: 8102 }, done)
      })
    })

    it("should have node version in config", function(done){
      config.should.have.property("dssrv_version")
      done()
    })

    it("should serve index file", function(done){
      fs.readFile(path.join(outputPath, "index.html"), function(err, contents){
        request('http://localhost:8102/', function(e, r, b){
          r.statusCode.should.eql(200)
          b.should.eql(contents.toString())
          done()
        })
      })
    })

    it("should serve text file", function(done){
      fs.readFile(path.join(outputPath, "hello.txt"), function(err, contents){
        contents.toString().should.eql("text files are wonderful")
        request('http://localhost:8102/hello.txt', function(e, r, b){
          r.statusCode.should.eql(200)
          b.should.eql(contents.toString())
          done()
        })
      })
    })

    it("should have custom 404 page that is raw HTML", function(done){
      fs.readFile(path.join(outputPath, "404.html"), function(err, contents){
        request('http://localhost:8102/404.html', function(e, r, b){
          r.statusCode.should.eql(200)
          b.should.eql(contents.toString())
          request('http://localhost:8102/missing/path', function(e, r, b){
            r.statusCode.should.eql(404)
            b.should.eql(contents.toString())
            done()
          })
        })
      })
    })

  })

  describe("root-style", function(){
    var projectPath = path.join(__dirname, "apps/plain/root-style")
    var outputPath  = path.join(__dirname, "out/plain/root-style")

    var config;

    before(function(done){
      dssrv.compile(projectPath, outputPath, function(errors, output){
        config = output
        dssrv.server(projectPath, { port: 8103 }, done)
      })
    })

    it("should have node version in config", function(done){
      config.should.have.property("dssrv_version")
      done()
    })

    it("should serve index file", function(done){
      fs.readFile(path.join(outputPath, "index.html"), function(err, contents){
        request('http://localhost:8103/', function(e, r, b){
          r.statusCode.should.eql(200)
          b.should.eql(contents.toString())
          done()
        })
      })
    })

    it("should serve text file", function(done){
      fs.readFile(path.join(outputPath, "hello.txt"), function(err, contents){
        contents.toString().should.eql("text files are wonderful")
        request('http://localhost:8103/hello.txt', function(e, r, b){
          r.statusCode.should.eql(200)
          b.should.eql(contents.toString())
          done()
        })
      })
    })

    it("should have custom 404 page that is raw HTML", function(done){
      fs.readFile(path.join(outputPath, "404.html"), function(err, contents){
        request('http://localhost:8103/404.html', function(e, r, b){
          b.should.be.an.String().and.not.empty().and.match(new RegExp("<h1>404 in HTML"))
          r.statusCode.should.eql(200)
          b.should.eql(contents.toString())
          request('http://localhost:8103/missing/path', function(e, r, b){
            r.statusCode.should.eql(404)
            b.should.eql(contents.toString())
            done()
          })
        })
      })
    })

  })

  after(function(done){

    exec("rm -rf " + output, function(){
      done()
    })

  })

})
