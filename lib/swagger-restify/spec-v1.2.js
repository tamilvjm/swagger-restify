var _ = require('underscore');
var url = require('url');
var util = require('util');
var spec_v1_2 = require('swagger-tools').specs.v1_2;
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

SpecV12.prototype._createHandleReadApisCb = function () {
  var self = this;

  return function(err, resources, resourceDescriptors) {
    SpecV10.prototype._createHandleReadApisCb.call(self).apply(null, arguments);

    var resourceListing = self._getResourceListing();
    var resources = Object.keys(self.apis).map(function(resourcePath) {
      return self._getResource(resourcePath);
    });

    if (self.validate) {
      spec_v1_2.validate(resourceListing, resources, function(err, result) {
        if (err || result) {
          throw (err || ("Invalid swagger: \n" + util.inspect(result, true, 7, true)) );
        }
      });
    }
  };
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
      _resourceRef.resourcePath = api.resourcePath;
      _resourceRef.description = api.description;
      if (api.authorizations) {
        _resourceRef.authorizations = api.authorizations;
      }

      if (!_resourceRef.produces && self.defaults.produces) {
        _resourceRef.produces = self.defaults.produces;
      }
      if (!_resourceRef.consumes && self.defaults.consumes) {
        _resourceRef.consumes = self.defaults.consumes;
      }
    } else if (api.models) {
      _resourceRef.models = api.models;
    } else if (_.isArray(api.operations)) {
      _.each(api.operations, function(operation) {
        if (!_resourceRef.produces && operation.produces) {
          _resourceRef.produces = operation.produces;
        }
        if (!_resourceRef.consumes && operation.consumes) {
          _resourceRef.consumes = operation.consumes;
        }
      });

      var pathApi = _resourceRef.apis.filter(function(_api) { return _api.path == api.path; })[0];
      if (pathApi) {
        pathApi.operations = pathApi.operations.concat(api.operations);
      } else {
        _resourceRef.apis.push(api);
      }
    }

    done();
  };
};

SpecV12.prototype._getResourceListing = function() {
  var self = this;
  var result = _.clone(this.descriptor);

  result.apis = _.map(self.apis, function (api) {
    return {
      path: self.swaggerJSON + api.resourcePath,
      description: api.description
    };
  });

  return result;
};

SpecV12.prototype._getResource = function(resourcePath) {
  var result = _.clone(this.descriptor);

  var swaggerApi = _.clone(this.apis[resourcePath]);

  if (!swaggerApi) return;

  result.resourcePath = this.swaggerJSON + swaggerApi.resourcePath;
  result.apis = swaggerApi.apis;

  result.models = swaggerApi.models;
  ['produces', 'consumes', 'authorizations'].forEach(function (key) {
    if (swaggerApi[key]) {
      result[key] = swaggerApi[key];
    }
  });

  return result;
};

/**
 * Get resource description asynchronously
 * @api    private
 * @param  {String}   resource
 * @param  {Function} cb
 */
SpecV12.prototype.getDescription = function(req, cb) {
    var result, resourcePath;

    if ((resourcePath = req.params[0])) {
      result = this._getResource(resourcePath);

      if (!result) {
        return cb(false);
      }
    } else {
      result = this._getResourceListing();
      result.swaggerJSON = this.swaggerJSON;
      result.swaggerURL = this.swaggerURL;
    }

    return cb(result);
};

exports = module.exports = SpecV12;