var restify = require('restify');

/**
 * init swagger
 * @api    public
 * @param  {Object} server
 * @param  {Object} opt
 * @return {Function}
 */
function init(server, opt) {
  var Spec;
  // get version specific swagger initializer
  try {
    Spec = require('./spec-v' + (opt.swaggerVersion || opt.swagger) +'.js');
  } catch (err) {
    console.log(err);
    throw new Error('Invalid swaggerVersion/swagger option: ' + opt.swaggerVersion);
  }

  if (!opt.swaggerJSON) {
     throw new Error('Option \'swaggerJSON\' is required.');
  }

  var spec = new Spec(opt);

  if (opt.swaggerURL && opt.swaggerUI) {
    // Serve up swagger ui interface.
    var swaggerURL = new RegExp('^\\' + opt.swaggerURL + '(\/.*)?$');

    server.get(opt.swaggerURL, function(req, res, next) {
        res.header('Location', opt.swaggerURL + '/index.html');
        res.send(301);
        next();
    });
    server.get(swaggerURL, restify.serveStatic({
      directory: opt.swaggerUI,
      default: 'index.html'
    }));
  }

  var regex = new RegExp('^' + opt.swaggerJSON + '(\/.*)?$');

  server.get(regex, function (req, res, next) {
    spec.getDescription(req, opt, function(description) {
      if (typeof(opt.middleware) == 'function') {

        if (opt.middleware.length === 3) {
          var sendCalled = false;
          var send = res.send;
          res.send = function() {
            sendCalled = true;
            return send.apply(res, arguments);
          };

          opt.middleware(req, res, function(err) {
            if (!sendCalled) {
              if (err) {
                res.send(400);
              } else if (!description) {
                res.send(404);
              } else {
                res.send(200, description);
              }
            }
            next();
          });

          return;
        }

        opt.middleware(req, res);
      }

      if (!description) res.send(404);
      else res.send(200, description);
      next();
    });
  });

}

exports = module.exports = {
  init: init
};
