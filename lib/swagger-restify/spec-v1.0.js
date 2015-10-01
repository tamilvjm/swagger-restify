var _ = require('underscore');
var async = require('async');
var yaml = require('js-yaml');
var url = require('url');
var SpecAbstract = require('./spec_abstract');

function SpecV10 (opt) {
  SpecAbstract.apply(this, arguments);

  this.descriptor = {};
  this.apis = {};

  this._generate(opt);

  this._readApis(opt.apis, this._createHandleReadApisCb());
}
SpecV10.prototype = Object.create(SpecAbstract.prototype);
SpecV10.prototype.constructor = SpecV10;

SpecV10.prototype._generate = function(opt) {
    if (!opt.basePath) {
       throw new Error('Option \'basePath\' is required.');
    }

    this.descriptor.swaggerVersion = '1.0';
    this.descriptor.apiVersion = (opt.apiVersion) ? opt.apiVersion : '1.0';
    this.descriptor.basePath = opt.basePath;
    this.swaggerURL = opt.swaggerURL;
    this.swaggerJSON = (opt.swaggerJSON) ? opt.swaggerJSON : '/api-docs.json';
    this.descriptor.apis = [];

    if (opt.info) {
      this.descriptor.info = opt.info;
    }

    opt.apiVersion = this.descriptor.apiVersion;
    opt.swaggerVersion = this.descriptor.swaggerVersion;
};

SpecV10.prototype._createHandleReadApisCb = function () {
  var self = this;
  return function(err, resources, resourceDescriptors) {
    if (err) {
      throw err;
    }
  };
};

/**
 * Get jsDoc tag with title '@swagger'
 * @api    private
 * @param  {Object} fragment
 * @param  {Function} cb
 */
SpecV10.prototype._getSwagger = function(fragment, cb) {
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
SpecV10.prototype._createHandleSwaggerApiCb = function(_resourceRef, done) {
  return function (api) {
    if (!api) {
      return done();
    }

    if (api.resourcePath) {
      _resourceRef.resourcePath = api.resourcePath;
      _resourceRef.description = api.description;
    } else if (api.models) {
      _resourceRef.models = api.models;
    } else if (_.isArray(api.operations)) {
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

/**
 * Read from jsDoc
 * @api    private
 * @param  {Array}  docs
 * @param  {Function} cb
 */
SpecV10.prototype._createHandleDoctrinesCb = function(cb) {
  var self = this;

  return function(err, docs) {
    if (err) {
      cb(err);
    }

    var _resourceRef = {
      ref: true,
      resourcePath: null,
      description: null,
      apis: [],
      models: null
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
        self._readApi(api, function(err, swaggerApi) {
          if (err) {
            throw err;
          }

          if (swaggerApi.resourcePath) {
            var pathResource = self.apis[swaggerApi.resourcePath];

            if (swaggerApi.apis.length > 0) {
              if (pathResource) {
                swaggerApi.apis.forEach(function(api) {
                  var pathApi = pathResource.apis.filter(function(_api) { return _api.path == api.path; })[0];
                  if (pathApi) {
                    pathApi.operations = pathApi.operations.concat(api.operations);
                  } else {
                    pathResource.apis.push(api);
                  }
                });
              } else {
                self.apis[swaggerApi.resourcePath] = swaggerApi;
              }
            }

            if (swaggerApi.models) {
              if (pathResource && pathResource.models) {
                pathResource.models = pathResource.models.concat(swaggerApi.models);
              } else {
                self.apis[swaggerApi.resourcePath].models = swaggerApi.models;
              }
            }
          }
          done();
        });
    }, cb);
  }
};

SpecV10.prototype.getDescription = function(req, cb) {
    var self = this;
    var result = _.clone(this.descriptor);

    if (req.params[0]) {

      var swaggerApi = this.apis[req.params[0]];

      if (!swaggerApi) {
        return cb(false);
      }

      ['resourcePath', 'apis', 'models'].forEach(function (key) {
        result[key] = swaggerApi[key];
      });
    } else {

      result.apis = _.map(self.apis, function (api) {
        return {
          path: self.swaggerJSON + api.resourcePath,
          description: api.description
        };
      });
    }

    return cb(result);
};

exports = module.exports = SpecV10;