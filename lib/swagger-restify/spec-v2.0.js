var _ = require('underscore');
var async = require('async');
var util = require('util');
var fs = require('fs');
var yaml = require('js-yaml');
var url = require('url');
var spec_v2_0 = require('swagger-tools').specs.v2_0;
var SpecAbstract = require('./spec_abstract');

function SpecV20 (opt) {
  SpecAbstract.apply(this, arguments);
  var self = this;

  this.spec = {
    paths: {},
    tags: [],
    definitions: {}
  };

  this._generate(opt);

  this._readApis(opt.apis, function(err, paths, definitions, tags) {
    if (err) {
      throw err;
    }

    if (self.validate) {
      spec_v2_0.validate(self.spec, function(err, result) {
        if (err || result) {
          console.log(util.inspect(result, false, 10, true));
          throw (err || ("Invalid swagger: \n" + util.inspect(result, false, 7, true)) );
        }
      });
    }
  });
}
SpecV20.prototype = Object.create(SpecAbstract.prototype);
SpecV20.prototype.constructor = SpecV20;

SpecV20.prototype._generate = function(opt) {
    var self = this;
    this.spec.swagger = '2.0';

    if (!opt.info) {
       throw new Error('\'info\' is required.');
    }
    this.spec.info = opt.info;

    [
      'host', 'basePath', 'schemes', 'consumes', 'produces',
      'paths', 'definitions', 'parameters', 'responses',
      'securityDefinitions', 'security', 'tags', 'externalDocs'
    ].forEach(function(key){
      if (opt[key]) {
        self.spec[key] = opt[key];
      }
    });

    this.swaggerURL = opt.swaggerURL;
    this.swaggerJSON = (opt.swaggerJSON) ? opt.swaggerJSON : '/api-docs.json';
};

/**
 * Get jsDoc tag with title '@swagger'
 * @api    private
 * @param  {Object} fragment
 * @param  {Function} cb
 */
SpecV20.prototype._getSwagger = function(fragment, cb) {
  for (var i = 0; i < fragment.tags.length; i++) {
    var tag = fragment.tags[i];
    if ('swagger' === tag.title) {
      return yaml.safeLoadAll(tag.description, cb);
    }
  }

  return cb(false);
};

/**
 * Handle swagger API object
 * @api    private
 * @param  {String}   resource
 * @param  {Function} cb
 */
SpecV20.prototype._createHandleSwaggerApiCb = function(_resourceRef, done) {
  return function (api) {
    if (!api) {
      return done();
    }

    if (api.parameters || api.tags) {
      if (api.parameters) _resourceRef.parameters = api.parameters;
      if (api.tags) _resourceRef.tags = api.tags;
    } else if (api.definitions) {
      _resourceRef.definitions = api.definitions;
    } else {
      var method = (api.httpMethod || api.method).toLowerCase();
      if (!_resourceRef.paths[api.path]) {
        _resourceRef.paths[api.path] = {};
      }

      _resourceRef.paths[api.path][method] = api.spec;
    }

    done();
  };
};

/**
 * Read from jsDoc
 * @api    private
 * @param  {Array}  docs
 * @param  {Function} cb
 */
SpecV20.prototype._createHandleDoctrinesCb = function(cb) {
  var self = this;

  return function(err, docs) {
    if (err) {
      cb(err);
    }

    var _resourceRef = {
      ref: true,
      paths: {},
      definitions: {},
      parameters: null,
      tags: null
    };

    async.eachSeries(docs, function (doc, done) {
      self._getSwagger(doc, self._createHandleSwaggerApiCb(_resourceRef, done));
    }, function (err) {
      cb(null, _resourceRef);
    });
  };
};

/**
 * Read all API from files
 * @api    private
 * @param  {Object} opt
 */
SpecAbstract.prototype._readApis = function(apis, cb) {
  if (apis) {
    var self = this;

    async.eachSeries(apis, function (api, done) {
        self._readApi(api, function(err, resource) {
          if (err) {
            throw err;
          }

          if (!resource.ref) {
            _.each(resource.paths, function(methods, pathName) {
              if (!self.spec.paths[pathName]) {
                self.spec.paths[pathName] = {};
              }

              _.each(methods, function(descriptor, method) {
                method = method.toLowerCase();
                self.spec.paths[pathName][method] = descriptor;
              });
            });

            if (resource.parameters) {
              _.each(resource.paths, function(methods, pathName) {
                methods.parameters = resource.parameters;
              });
            }
          } else {
            _.each(resource.paths, function(methods, pathName) {
              if (!self.spec.paths[pathName]) {
                self.spec.paths[pathName] = {};
              }
              if (resource.parameters) {
                self.spec.paths[pathName].parameters = resource.parameters;
              }

              _.each(methods, function(descriptor, method) {
                method = method.toLowerCase();
                self.spec.paths[pathName][method] = descriptor;
              });
            });
          }

          if (_.isArray(resource.tags)) {
            self.spec.tags = self.spec.tags.concat(resource.tags);
          }
          _.extend(self.spec.definitions, resource.definitions);

          done();
        });
    }, cb);
  }
};

SpecV20.prototype.getDescription = function(req, cb) {
    if (req.params[0]) {
      return cb(false);
    }

    var result = _.clone(this.spec);
    result['x-swaggerJSON'] = this.swaggerJSON;
    if (this.swaggerURL) {
      result['x-swaggerURL'] = this.swaggerURL;
    }

    return cb(result);
};

exports = module.exports = SpecV20;