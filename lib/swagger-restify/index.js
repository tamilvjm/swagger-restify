var restify = require('restify');
var _ = require('underscore');
var serveStatic = require('serve-static');
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
    throw new Error('Invalid swaggerVersion/swagger option: ' + opt.swaggerVersion);
  }

  var spec = new Spec(opt);

  if (spec.swaggerURL && opt.swaggerUI !== false) {
    // Serve up swagger ui interface.
    var swaggerURL = new RegExp('^\\' + spec.swaggerURL + '(\/.*)?$');

    server.get(opt.swaggerURL, function(req, res, next) {
        res.header('Location', opt.swaggerURL + '/index.html?url=' + spec.swaggerJSON);
        res.sendStatus(301);
        next();
    });

    server.get(swaggerURL, serveStatic(opt.swaggerUI || (__dirname + '/../../public'), {
      index: "index.html"
    }));
  }

  var regex = new RegExp('^' + spec.swaggerJSON + '(\/.*)?$');

  server.get(regex,
      ((_.isFunction(opt.middleware) || _.isArray(opt.middleware)) && opt.middleware) || [],
      function (req, res, next) {
        spec.getDescription(req, function(description) {
          if (!description) res.sendStatus(404);
          else res.status(200).send(description);
          next();
        });
      }
    );

}

exports = module.exports = {
  init: init
};
