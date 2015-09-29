var restify = require('restify');
var _ = require('underscore');

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

  var spec = new Spec(opt);

  if (opt.swaggerUI && spec.swaggerURL) {
    // Serve up swagger ui interface.
    var swaggerURL = new RegExp('^\\' + spec.swaggerURL + '(\/.*)?$');

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

  var regex = new RegExp('^' + spec.swaggerJSON + '(\/.*)?$');

  server.get(regex, [
    (_.isFunction(opt.middleware) && opt.middleware),
    function (req, res, next) {
      spec.getDescription(req, function(description) {
        if (!description) res.send(404);
        else res.send(200, description);
        next();
      });
    }
  ].filter( Boolean ));

}

exports = module.exports = {
  init: init
};
