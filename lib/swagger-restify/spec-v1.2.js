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
    var resources = Object.keys(self.resources).map(function(key) {
      return self._getResource(key);
    });

    spec_v1_2.validate(resourceListing, resources, function(err, result) {
      if (err || result) {
        throw (err || ("Invalid swagger: \n" + util.inspect(result, true, 7, true)) );
      }
    });
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

SpecV12.prototype._getResourceListing = function() {
  var self = this;
  var result = _.clone(this.descriptor);

  result.apis = _.map(result.apis, function (api) {
    return {
      path: self.swaggerJSON + api.resourcePath,
      description: api.description
    };
  });

  return result;
};

SpecV12.prototype._getResource = function(resourcePath) {
  var result = _.clone(this.descriptor);

  var resource = _.clone(this.resources[resourcePath]);

  if (!resource) return;

  if (!resource) {
    return cb(false);
  }

  result.resourcePath = this.swaggerJSON + resource.resourcePath;
  result.apis = resource.apis;

  if (_.isArray(result.apis)) {
    _.each(result.apis, function (api) {
      if (_.isArray(api.operations)) {
        _.each(api.operations, function (operation) {
          if (operation.httpMethod) {
            operation.method = operation.httpMethod;
            delete operation.httpMethod;
          }
          if (operation.responseType) {
            operation.type = operation.responseType;
            delete operation.responseType;
          }

          if (_.isArray(operation.parameters)) {
            _.each(operation.parameters, function (parameter) {
              if (parameter.dataType) {
                parameter.type = parameter.dataType;
                delete parameter.dataType;
              }
            });
          }

        });
      }
    });
  }

  result.models = resource.models;
  ['produces', 'consumes', 'authorizations'].forEach(function (key) {
    if (resource[key]) {
      result[key] = resource[key];
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