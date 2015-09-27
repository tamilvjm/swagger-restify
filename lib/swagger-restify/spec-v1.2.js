var _ = require('underscore');
var url = require('url');
var SpecV10 = require('./spec-v1.0');

function SpecV12 (opt) {
  this.defaults = {};
  SpecV10.apply(this, arguments);
}
SpecV12.prototype = Object.create(SpecV10.prototype);
SpecV12.prototype.constructor = SpecV12;

SpecV12.prototype._generate = function(opt) {
    SpecV10.prototype._generate.call(this, opt);
    this.descriptor.swaggerVersion = '1.2';

    if (opt.authorizations) {
      this.descriptor.authorizations = opt.authorizations;
    }
    if (opt.produces) {
      this.defaults.produces = opt.produces;
    }
    if (opt.consumes) {
      this.defaults.consumes = opt.consumes;
    }
};

/**
 * Crate swagger API object handler
 * @api    private
 * @param  {String}   resource
 * @param  {Function} cb
 */
SpecV12.prototype._createHandleSwaggerApiCb = function(_resourceRef, done) {
  var self = this;

  return function (api) {
    if (!api) {
      return done();
    }

    if (api.resourcePath) {
      _resourceRef.resourceDescriptor = api;

      _resourceRef.resource.resourcePath = api.resourcePath;
      if (api.authorizations) {
        _resourceRef.resource.authorizations = api.authorizations;
      }

      if (!_resourceRef.resource.produces && self.defaults.produces) {
        _resourceRef.resource.produces = self.defaults.produces;
      }
      if (!_resourceRef.resource.consumes && self.defaults.consumes) {
        _resourceRef.resource.consumes = self.defaults.consumes;
      }
    } else if (api.models) {
      _resourceRef.resource.models = api.models;
    } else {
      _resourceRef.resource.apis.push(api);
    }

    done();
  };
};

/**
 * Get resource description asynchronously
 * @api    private
 * @param  {String}   resource
 * @param  {Function} cb
 */
SpecV12.prototype.getDescription = function(req, opt, cb) {
    var result = _.clone(this.descriptor);

    if (req.params[0]) {

      var resource = this.resources[req.params[0]];

      if (!resource) {
        return cb(false);
      }

      result.resourcePath = resource.resourcePath;
      result.apis = resource.apis;
      result.models = resource.models;
      ['produces', 'consumes', 'authorizations'].forEach(function (key) {
        if (resource[key]) {
          result[key] = resource[key];
        }
      });
    } else {
      result.apis = _.map(result.apis, function (api) {
        return {
          path: opt.swaggerJSON + api.resourcePath,
          description: api.description
        };
      });
    }

    return cb(result);
};

exports = module.exports = SpecV12;