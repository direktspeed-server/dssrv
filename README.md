# DIREKTSPEED Server


# add Installer Method via place symlink or anything to to ./target 
# this way we can start docker containers and other stuff that moves files to target
# we can also use target as exchange point via volumes from.

> zero-configuration Server Configuration Abstraction Fully Modular

### What is DIREKTSPEED Server?

DIREKTSPEED Server is a Server Configuration Abstraction Layer that is Modular 

it can for example run dssrv-srv-prerender to be used as Static Webserver that also serves DoneJS,Pug, Jade, Markdown, EJS, Less, Stylus, Sass, and CoffeeScript **as** HTML, CSS, and JavaScript without any configuration. It supports the beloved layout/partial paradigm and it has flexible metadata and global objects for traversing the file system and injecting custom data into templates. Optionally, dssrv-srv-prerender can also compile your project down to static assets for hosting behind any valid HTTP server.

Pre-compilers are becoming extremely powerful and shipping front-ends as static assets has many upsides. It's simple, it's easy to maintain, it's low risk, easy to scale, and requires low cognitive overhead. I wanted a lightweight web server that was powerful enough for me to abandon web frameworks for dead simple front-end publishing.

### Why?
Because today you need as Developer and Production User ways to maintain your projects.
on a Project base not on a per software base.

### Features

- easy installation, easy to use
- fast and lightweight
- robust (clean urls, intelligent path redirects)
- optional built in pre-processing
- optional first-class layout and partial support
- built in LRU caching in production mode
- optional can export assets to HTML/CSS/JS
- optional does not require a build steps or grunt task
- fun to use

### Resources

- **Server Documentation** - [server.dspeed.eu/docs/](https://server.dspeed.eu/docs/)
- **Platform Documentation** - [hosting.dspeed.eu/docs/dssrv](https://dssrv.io/docs)
- **Source Code** - [github.com/dssrv/dssrv](https://github.com/dssrv/dssrv)


####twitter
Authored and maintained by [@](http://twitter.com/). Made for the [@DIREKTSPEED](http://twitter.com/DIREKTSPEED ServerPlatform).

---

### Installation

    sudo npm install -g dssrv

### Quick Start

Creating a new dssrv application is a breeze...

    dssrv init myproj
    dssrv server myproj

Your DIREKTSPEED Server application is now running at [http://localhost:9000]()

---

## Documentation

DIREKTSPEED Server can be used as a library or as a command line utility.

### CLI Usage

    Usage: dssrv [command] [options]

    Commands:

      init [path]                 initalize new dssrv application (defaults to current directory)
      server [path] [options]     start dssrv server
      compile [path] [options]    compile project to static assets
      multihost [path] [options]  start dssrv server to host directory of dssrv apps

    Options:

      -h, --help     output usage information
      -V, --version  output the version number

Start the server in root of your application by running...

    dssrv server

You may optionally supply a port to listen on...

    dssrv server --port 8002

Compile an application from the root of your application by running...

    dssrv compile

You may optionally pass in a path to where you want the compiled assets to go...

    dssrv compile --output /path/to/cordova/project/www

### Lib Usage

You may also use dssrv as a node library for compiling or running as a server.

Serve up a dssrv application...

```js
var dssrv = require("dssrv")
dssrv.server(projectPath [,args] [,callback])
```

**Or** compile dssrv application

```js
var dssrv = require("dssrv")
dssrv.compile(projectPath [,outputPath] [, callback])
```

**Or** use as Connect/ExpressJS middleware

```js
var express = require("express");
var dssrv = require("dssrv");
var app = express();
```

```js 
// Express 3
app.configure(function(){ 
  app.use(express.static(__dirname + "/public"));
  app.use(dssrv.mount(__dirname + "/public"));
});
```

```js 
// Express 4

app.use(express.static(__dirname + "/public"));
app.use(dssrv.mount(__dirname + "/public"));

```


## License

Copyright © 2012–2014 [Chloi Inc](http://chloi.io). All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
