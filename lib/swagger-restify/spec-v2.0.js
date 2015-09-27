var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var yaml = require('js-yaml');
var url = require('url');
var schemaValidator = require('json-schema').validate;
var SpecAbstract = require('./spec_abstract');

function SpecV20 (opt) {
  SpecAbstract.apply(this, arguments);
  var self = this;

  this.spec = {};

  this._generate(opt);

  this._readApis(opt.apis, function(err, paths, definitions) {
    if (err) {
      throw err;
    }

    self.spec.paths = paths;
    self.spec.definitions = definitions;

    var validation = self.validate(self.spec);
    if (!validation.valid) {
      throw validation.errors;
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

    this.swaggerURL = (opt.swaggerURL) ? opt.swaggerURL : '/swagger';
    this.swaggerJSON = (opt.swaggerJSON) ? opt.swaggerJSON : '/api-docs.json';

    this.Schema = fs.readFileSync(__dirname + '/schemas/v2.0.json');
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

    debugger;
    if (api.parameters) {
      _resourceRef.apiParameters = api.parameters;
    } else if (api.definitions) {
      _resourceRef.apiDefinitions = api.definitions;
    } else {
      var method = (api.httpMethod || api.method).toLowerCase();
      if (!_resourceRef.apiPaths[api.path]) {
        _resourceRef.apiPaths[api.path] = {};
      }

      _resourceRef.apiPaths[api.path][method] = api.spec;
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
      apiPaths: {},
      apiDefinitions: {},
      apiParameters: null
    };

    async.eachSeries(docs, function (doc, done) {
      self._getSwagger(doc, self._createHandleSwaggerApiCb(_resourceRef, done));
    }, function (err) {
      cb(null, _resourceRef.apiPaths, _resourceRef.apiDefinitions, _resourceRef.apiParameters);
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
    var paths = {};
    var definitions = {};

    async.eachSeries(apis, function (api, done) {
        self._readApi(api, function(err, api, apiDefinitions, apiParameters) {
          if (err) {
            throw err;
          }

          if (api.paths) {
            paths = api.paths;
            if (api.parameters) {
              _.each(api.paths, function(methods, pathName) {
                methods.parameters = api.parameters;
              });
            }
            definitions = api.definitions;
          } else {
            _.each(api, function(methods, pathName) {
              if (!paths[pathName]) {
                paths[pathName] = {};
              }
              if (apiParameters) {
                paths[pathName].parameters = apiParameters;
              }

              _.each(methods, function(descriptor, method) {
                method = method.toLowerCase();
                paths[pathName][method] = descriptor;
              });
            });
          }

          done();
        });
    }, function (err) {
        if (err) {
          return cb(err);
        }

        cb(null, paths, definitions);
    });
  }
};

SpecV20.prototype.getDescription = function(req, opt, cb) {
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

SpecV20.prototype.validate = function(swagger) {
  return schemaValidator(swagger, this.Schema);
};

exports = module.exports = SpecV20;