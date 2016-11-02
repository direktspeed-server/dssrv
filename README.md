@page dssrv
@hide title
@hide sidebar
# DIREKTSPEED Server

# dssrv
DIREKTSPEED - SERVER a NODE.JS Application Server and Server Stack Framework using dssrv-engine a wrapper for Running NodeJS Servers and Manage the Routing as also Supplys Additions like socket Communication Channels and all that via SocketCluster Framework.



[![npm version](https://badge.fury.io/js/donejs.svg)](https://badge.fury.io/js/donejs)
[![Build Status](https://travis-ci.org/donejs/donejs.svg?branch=master)](https://travis-ci.org/donejs/donejs)
[![Build Status](https://ci.appveyor.com/api/projects/status/github/donejs/donejs?branch=master&svg=true)](https://ci.appveyor.com/project/daffl/donejs)
[![Coverage Status](https://coveralls.io/repos/github/donejs/donejs/badge.svg?branch=cli-refactor)](https://coveralls.io/github/donejs/donejs?branch=master)

DIREKTSPEED is the easiest way to get a high performance, real time, web and mobile application
done and Hosted! The framework provides a nearly comprehensive combination of technologies for
building complex JavaScript applications and Running them as Also Pack and Ship Them.

If you are looking for the fastest way to get a fully modern development environment setup
and produce a lightning fast application, you've come to the right place.

DIREKTSPEED is a combination of the following technologies:

- [StealJS](http://stealjs.com) - ES6, CJS, and AMD module loader and builder
- [steal-ssr](https://github.com/canjs/ssr) - Server-side rendering for Steal loaded Projects.
- [CanJS](https://canjs.com) - Custom elements and model-view-viewmodel (MVVM) utilities
- [jQuery](https://jquery.com/) - DOM helpers
- [jQuery++](http://jquerypp.com) - Extended DOM helpers
- [QUnit](https://qunitjs.com/) or [Mocha](https://mochajs.org/) - Assertion library
- [FuncUnit](https://funcunit.com/) - Functional tests
- [Testee](https://github.com/bitovi/testee) or [Karma](https://karma-runner.github.io/) - Test runner
- [DocumentJS](http://documentjs.com) - Documentation


DoneJS is a `npm` package that simply installs all the previous
technologies.  This site exists to explain the collective benefits of these technologies
and provides a [Guide guide] for using them together to build an "amazing" application.


### Features ([Features main article])

_Application features:_

- Isomorphic (same code on server and client).
- Pushstate routing
- Real time
- Run everywhere ( IE9+, Android, iOS, node-webkit )

_Performance features:_

- Progressive loaded optimized production builds
- Caching and minimal data requests
- Minimal DOM updates
- Application logic in worker thread

_Maintenance features:_

- Modlet workflow - tests, docs, and demo pages
- Use and create NPM packages
- Custom HTML elements
- MVVM single direction architecture
- Multi-versioned documentation
- Hot module swapping
- Functional tests



#### Getting Started Guide ([Guide main article])

DIREKTSPEED has Getting Started Guides walktroughts for you [PlaceMyOrder](http://place-my-order.com) application.

1. Install
   1. Set up server
   2. Set up client
2. Setting up server side rendering
   1. Create the main template
   2. [Create the application view model](docs/getting_started_outline.md#create-the-application-view-model)
   3. Render the main template on the server
   4. [Start the server](docs/getting_started_outline.md#start-the-server)
3. Setting up routing
   1. Create routes
   2. Create a homepage element
   3. Create a restaurant list element
   4. Switch between pages
   5. Create a header element
   6. Create a order history element
   7. Switch between three pages
4. Getting data from the server and showing it in the page.
5. Creating a unit-tested view model and demo page
   1. Identify the view model state properties
   2. Test the view model
      1. Setup the test
      2. Create fake data
      3. Use fake data for ajax requests
      4. Create a view model instance and test its behavior
   3. Write the view model
      1. Make dependent models
      2. Define stateful property behaviors
      3. Verify the test
   4. Create a demo page
   5. Write the template
      1. Verify the demo page and application works.
6. Setup continuous integration (CI) and tests.
6. Nested routes
7. Importing other projects
8. Creating data
9. Setup up a real-time connection
10. Production builds
    1. Bundling your app
    2. Building to iOS and Android
    3. Building to NW.js
11. Deploying



## Main Features
- Easy to use Application and Server Framework
- Easy to use HTTP static file server
- Option: OnDemand Compiling assets: less, dug (was jade), and more...
- Option: static compile assets on server run or via cli
- Option: harpJS compatible applications and templates and all that
- Option: Supports any protocol
- Running any NodeJS expressAPP and add domain Routing features as also Scaleability via WebSockets.
- Allows TCP Port Multiplexing via diffrent methods
- Allows Loadbalancing and Reverse Proxying of any protocol
- Rule Support for Loadbalancing Proxying and any protocoll
- Logging
- Caching via diffrent methods 
- DropIn Replacement for NGINX, Apache, Passanger, PHP, Hipache, HAPROXY, Varnish, CDN, Cloud Services.
- Powerfull Admin Abilitys Management, Deployment, Monitoring, Logging, Scaling



## This Repo:
Holds useable examples of dssrv if you need support reach us at https://dspeed.eu


```
Use as single domain Static Web Server -
Use as multi domain Static Only Web Server
Use as Mixed Multi domain Static/Dynamic Webserver
Use as Static web Server with loadbalancing
Use as GIT protocol and http server.
Use as Loadbalancer - TCP/UDP
Use as TCP Port sharing server
Use as Rule Based Firewall
Use as manager for iptables, git,docker, networking, users, folder permissions, task runner, cron, plugins supported
Use as software deploytool.
```


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

Copyright © 2016–2017 [DIREKTSPEED](http://dspeed.eu). All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
