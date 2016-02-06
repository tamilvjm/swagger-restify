var async = require('async');
var path = require('path');
var fs = require('fs');
var coffee = require('coffee-script');
var doctrine = require('doctrine');

function SpecAbstract(opt) {
    if (this.constructor == arguments.callee) {
      throw new Error("Can't instantiate abstract class!");
    }
    
    if (!opt) {
      throw new Error('\'option\' is required.');
    }

    this.validate = opt.validate !== false;
}

SpecAbstract.prototype._readYml = function(file, cb) {
  var resource = require(path.resolve(process.cwd(), file));
  
  var resourceDescriptor = {
    resourcePath: resource.resourcePath,
    description: resource.description
  };

  cb(null, resource, resourceDescriptor);
};

/**
 * Parse jsDoc from a js file
 * @api    private
 * @param  {String}   file
 * @param  {Function} cb
 */
SpecAbstract.prototype._parseJsDocs = function(file, cb) {
  fs.readFile(file, function (err, data) {
    if (err) {
      cb(err);
    }

    var js = data.toString();
    var regex = /\/\*\*([\s\S]*?)\*\//gm;
    var fragments = js.match(regex);
    var docs = [];

    if (!fragments || typeof(fragments) !== 'object') {
      cb(null, docs);
      return;
    }

    for (var i = 0; i < fragments.length; i++) {
      var fragment = fragments[i];
      var doc = doctrine.parse(fragment, { unwrap: true });

      docs.push(doc);

      if (i === fragments.length - 1) {
        cb(null, docs);
      }
    }
  });
};

/**
 * Parse coffeeDoc from a coffee file
 * @api    private
 * @param  {String}   file
 * @param  {Function} cb
 */
SpecAbstract.prototype._parseCoffeeDocs = function(file, cb) {
    fs.readFile(file, function (err, data) {
        if (err) {
            cb(err);
        }

        var js = coffee.compile(data.toString());
        var regex = /\/\**([\s\S]*?)\*\//gm;
        var fragments = js.match(regex);
        var docs = [];


        if (!fragments || typeof(fragments) !== 'object') {
          cb(null, docs);
          return;
        }

        for (var i = 0; i < fragments.length; i++) {
          var fragment = fragments[i];
          var doc = doctrine.parse(fragment, { unwrap: true });

          docs.push(doc);

          if (i === fragments.length - 1) {
              cb(null, docs);
          }
        }
    });
};

/**
 * Read from jsDoc
 * @api    private
 * @param  {String}  file
 * @param  {Function} cb
 */
SpecAbstract.prototype._readJsDoc = function(file, cb) {
  this._parseJsDocs(file, this._createHandleDoctrinesCb(cb));
};

/**
 * Read from coffeeDoc
 * @api    private
 * @param  {String}  file
 * @param  {Function} cb 
 */
SpecAbstract.prototype._readCoffee = function(file, cb) {
  this._parseCoffeeDocs(file, this._createHandleDoctrinesCb(cb));
};

/**
 * Read API from file
 * @api    private
 * @param  {String}   file
 * @param  {Function} cb
 */
SpecAbstract.prototype._readApi = function(file, cb) {
  var ext = path.extname(file);
  if ('.js' === ext) {
    this._readJsDoc(file, cb);
  } else if ('.yml' === ext) {
    this._readYml(file, cb);
  } else if ('.coffee' === ext) {
    this._readCoffee(file, cb);
  } else {
    throw new Error('Unsupported extension \'' + ext + '\'');
  }
};

exports = module.exports = SpecAbstract;