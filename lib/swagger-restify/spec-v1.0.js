var _ = require('underscore');
var async = require('async');
var yaml = require('js-yaml');
var url = require('url');
var SpecAbstract = require('./spec_abstract');

function SpecV10 (opt) {
  SpecAbstract.apply(this, arguments);

  this.descriptor = {};
  this.resources = {};

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

    self.resources = resources;
    self.descriptor.apis = resourceDescriptors;
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
      _resourceRef.resourceDescriptor = api;
      _resourceRef.resource.resourcePath = api.resourcePath;
    } else if (api.models) {
      _resourceRef.resource.models = api.models;
    } else {
      _resourceRef.resource.apis.push(api);
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
      resource: {
        apis: []
      },
      resourceDescriptor: null
    };

    async.eachSeries(docs, function (doc, done) {
      self._getSwagger(doc, self._createHandleSwaggerApiCb(_resourceRef, done));
    }, function (err) {
      cb(null, _resourceRef.resource, _resourceRef.resourceDescriptor);
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
    var resources = {};
    var resourceDescriptors = [];

    async.eachSeries(apis, function (api, done) {
        self._readApi(api, function(err, resource, resourceDescriptor) {
          if (err) {
            throw err;
          }

          resourceDescriptors.push(resourceDescriptor);
          resources[resource.resourcePath] = resource;
          done();
        });
    }, function (err) {
        if (err) {
          return cb(err);
        }

        cb(null, resources, resourceDescriptors);
    });
  }
};

SpecV10.prototype.getDescription = function(req, cb) {
    var self = this;
    var result = _.clone(this.descriptor);

    if (req.params[0]) {

      var resource = this.resources[req.params[0]];

      if (!resource) {
        return cb(false);
      }

      ['resourcePath', 'apis', 'models'].forEach(function (key) {
        result[key] = resource[key];
      });
    } else {
      result.apis = _.map(result.apis, function (api) {
        return {
          path: self.swaggerJSON + api.resourcePath,
          description: api.description
        };
      });
    }

    return cb(result);
};

exports = module.exports = SpecV10;