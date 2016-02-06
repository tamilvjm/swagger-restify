{swagger-restify}
=========
This project is a fork of [swagger-restify](https://github.com/yourdelivery/swagger-restify)
project with Swagger compatibility improvements to make it possible to use it with
[restify](http://mcavage.me/node-restify/) framework. This implementation also makes use of [swagger-tools](https://github.com/apigee-127/swagger-tools) to validate generated swagger specs.

[Swagger](http://swagger.io/) is a specification and complete framework
implementation for describing, producing, consuming, and visualizing RESTful web services.
View [demo](http://petstore.swagger.io/).

__{swagger-restify}__ is a simple and clean solution to integrate swagger with restify.

### Supported Swagger versions
  - __1.0__
  - __1.2__ (with validation)
  - __2.0__ (with validation)

## Installation

    $ npm install vellotis/swagger-restify

## Quick Start Swagger
-  __[Quick Start Swagger v1.0 or v1.2](#quick-start-swagger-v1.X)__
-  __[Quick Start Swagger v2.0](#quick-start-swagger-v2.0)__

<a id="quick-start-swagger-v1.X"></a>
## Quick Start Swagger v1.0 or v1.2

Configure {swagger-restify}.


`apiVersion`      -> Your api version.

`swaggerVersion`  -> Swagger version.

`swaggerUI`       -> Where is your swagger-ui?

`swaggerURL`      -> Path to use for swagger ui web interface.

`swaggerJSON`     -> Path to use for swagger ui JSON.

`basePath`        -> The basePath for swagger.js

`info`            -> [Metadata][info] about the API

`apis`            -> Define your api array.

`middleware`      -> Function before response.

```js
var swagger = require('swagger-restify');

  ...
  swagger.init(server, {
    apiVersion: '1.0',
    swaggerVersion: '1.0', // or '1.2'
    basePath: 'http://localhost:8080',
    info: {
      title: 'swagger-restify sample app',
      description: 'Swagger + Restify = {swagger-restify}'
    },
    apis: ['./api.js', './api.yml'],
    middleware: function(req, res){},
    
    // swagger-restify specific configuration
    swaggerURL: '/swagger',
    swaggerJSON: '/api-docs.json',
    swaggerUI: './public'
  });

  server.listen(8080);
  ...
});
```

[info]: https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#513-info-object

### Read from JavaScript jsdoc

Example 'api.js'

```js

/**
 * @swagger
 * resourcePath: /api
 * description: All about API
 */

/**
 * @swagger
 * path: /login
 * operations:
 *   -  httpMethod: POST
 *      summary: Login with username and password
 *      notes: Returns a user based on username
 *      responseClass: User
 *      nickname: login
 *      consumes: 
 *        - text/html
 *      parameters:
 *        - name: username
 *          description: Your username
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: password
 *          description: Your password
 *          paramType: query
 *          required: true
 *          dataType: string
 */
exports.login = function (req, res) {
  var user = {};
  user.username = req.params.username;
  user.password = req.params.password;
  res.json(user);
}

/**
 * @swagger
 * models:
 *   User:
 *     id: User
 *     properties:
 *       username:
 *         type: String
 *       password:
 *         type: String    
 */
```

### Read from yaml file

Example 'api.yml'

```yml
resourcePath: /api
description: All about API
apis: 

- path: /login
  operations:

  - httpMethod: POST
    summary: Login with username and password
    notes: Returns a user based on username
    responseClass: User
    nickname: login
    consumes: 
      - text/html
    parameters:

    - name: username
      dataType: string
      paramType: query
      required: true
      description: Your username

    - name: password
      dataType: string
      paramType: query
      required: true
      description: Your password

models:
    User:
      id: User
      properties:
        username:
          type: String
        password:
          type: String    
```

### Read from CoffeeScript jsdoc

Example 'api.coffee'

```coffee

###
 * @swagger
 * resourcePath: /api
 * description: All about API
###

###
 * @swagger
 * path: /login
 * operations:
 *   -  httpMethod: POST
 *      summary: Login with username and password
 *      notes: Returns a user based on username
 *      responseClass: User
 *      nickname: login
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: username
 *          description: Your username
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: password
 *          description: Your password
 *          paramType: query
 *          required: true
 *          dataType: string
###

###
 * @swagger
 * models:
 *   User:
 *     id: User
 *     properties:
 *       username:
 *         type: String
 *       password:
 *         type: String
###
```

<a id="quick-start-swagger-v2.0"></a>
## Quick Start Swagger v2.0

Configure {swagger-restify}. All properties are as defined in [Swagger v2.0 Spec][user-content-swagger-object].

`swagger`  -> Swagger version.

`info`            -> [Metadata][info-v2.0] about the API. Only required properties showed here.

 > `version`      -> Your API version
 > 
 > `title`        -> Your API title

`host`            -> The host (name or ip) serving the API.

`basePath`        -> The base path on which the API is served, which is relative to the host.

`schemes`         -> The transfer protocol of the API. Look [Swagger v2.0 Spec][user-content-swagger-object].

`consumes`        -> A list of MIME types the APIs can consume. This is global to all APIs but
                     can be overridden on specific API calls.
                     
`produces`        -> A list of MIME types the APIs can produce. This is global to all APIs but
                     can be overridden on specific API calls.

`apis`            -> Array of relative or absolute paths for files to fetch annotations from. `paths` parameter
                     will be generated from these files. As well `definitions` and `tags` will get fetched into global
                     scope.
                     
`definitions`     -> An object to hold data types produced and consumed by operations. Look [Swagger Spec](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#definitionsObject) for more.

`parameters`      -> Look swagger spec [Parameters Definitions Object](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#parametersDefinitionsObject).

`responses`       -> Look swagger spec [Responses Definitions Object](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#responsesDefinitionsObject).

`securityDefinitions` -> Look swagger spec [Security Definitions Object](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#securityDefinitionsObject).

`security`        -> Look swagger spec [[Security Requirement Object]](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#securityRequirementObject).

`tags`            -> A list of [[Tag Object]][tags-v2.0] used by the specification with additional metadata.

`externalDocs`    -> Look swagger spec [External Documentation Object](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#externalDocumentationObject).

`swaggerUI`       -> Where is your swagger-ui?

`swaggerURL`      -> Path to use for swagger ui web interface.

`swaggerJSON`     -> Path to use for swagger ui JSON. (Non swagger spec parameter. Required)

`middleware`      -> Function that will be called before before Swagger serving. Can be a passport authentication.

```js
var swagger = require('swagger-restify');

  ...
  swagger.init(server, {
      swagger: '2.0', // or swaggerVersion as backward compatible
      info: {
          version: '1.0',
          title: 'Swagger 2.0 Restify example'
      },
      tags: [
          {
              name: 'example',
              description: 'Just an example API'
          }
      ],
      host: 'localhost:' + port,
      apis: ['./api.js', './api.coffee', './api.yml'],
      produces: [
          'application/json',
          'text/xml'
      ],
      consumes: [
          'application/json',
          'text/xml'
      ],
  
      // swagger-restify proprietary
      swaggerURL: '/swagger',
      swaggerJSON: '/api-docs.json',
      swaggerUI: './public'
  });

  server.listen(8080);
  ...
});
```
[user-content-swagger-object]: https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#user-content-swagger-object
[info-v2.0]: https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#infoObject
[tags-v2.0]: https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#tagObject

### Read from JavaScript jsdoc

Example 'api.js'

```js
/**
 * @swagger
 * tags:
 *   - name: exampleJs
 *     description: All about API using JavaScript annotations
 * parameters:
 *   - name: username
 *     in: query
 *     description: Your username
 *     required: true
 *     type: string
 *     in: query
 *     description: Your password
 *     required: true
 *     type: string
 */

/**
 * @swagger
 * path: /loginJs
 * httpMethod: POST
 * spec:
 *   summary: Login with username and password
 *   tags:
 *     - exampleJs
 *     - example
 *   description: Returns a user based on username
 *   operationId: loginJs
 *   consumes: 
 *     - text/html
 *   responses:
 *     200:
 *       description: Successful response.
 *       schema:
 *         '$ref': '#/definitions/User'
 */
exports.login = function (req, res, next) {
  var user = {};
  user.username = req.query.username;
  user.password = req.query.password;
  res.send(200, user);
  next();
};

/**
 * @swagger
 * path: /helloJs
 * httpMethod: GET
 * spec:
 *   summary: Get hello message
 *   tags:
 *     - exampleJs
 *     - example
 *   description: 'Return "Hello #{ name }!" string'
 *   operationId: helloJs
 *   consumes: 
 *     - text/html
 *   parameters:
 *     - name: name
 *       in: query
 *       description: Hello subject
 *       required: true
 *       type: string
 *   responses:
 *     200:
 *       description: Successful response.
 *       schema:
 *         type: string
*/
exports.hello = function (req, res, next) {
  var name = req.query.name || 'unknown';
  res.send(200, "Hello " + name + "!");
  next();
};

/**
 * @swagger
 * definitions:
 *   User:
 *     required:
 *       - username
 *       - password
 *     properties:
 *       username:
 *         type: string
 *       password:
 *         type: string    
 */
```

### Read from yaml file

Example 'api.yml'

```yml
tags:
  - name: exampleYml
    description: All about API using CoffeeScript annotations
parameters:
  - name: username
    in: query
    description: Your username
    required: true
    type: string
  - name: password
    in: query
    description: Your password
    required: true
    type: string




paths:
  '/loginYml':
    post:
      summary: Login with username and password
      tags:
        - exampleYml
        - example
      description: Returns a user based on username
      operationId: loginYml
      consumes: 
        - text/html
      responses:
        200:
          description: Successful response.
          schema:
            '$ref': '#/definitions/User'
  '/helloYml':
    get:
      summary: Get hello message
      tags:
        - exampleYml
        - example
      description: 'Return "Hello #{ name }!" string'
      operationId: helloYml
      consumes: 
        - text/html
      parameters:
        - name: name
          in: query
          description: Hello subject
          required: true
          type: string
      responses:
        200:
          description: 'Successful response'
          schema:
            type: string




definitions:
    User:
      required:
        - username
        - password
      properties:
        username:
          type: string
        password:
          type: string   
```

### Read from CoffeeScript jsdoc

Example 'api.coffee'

```coffee
###
 * @swagger
 * tags:
 *   - name: exampleCoffee
 *     description: All about API using CoffeeScript annotations
 * parameters:
 *   - name: username
 *     in: query
 *     description: Your username
 *     required: true
 *     type: string
 *   - name: password
 *     in: query
 *     description: Your password
 *     required: true
 *     type: string
###

###
 * @swagger
 * path: /loginCoffee
 * httpMethod: POST
 * spec:
 *   summary: Login with username and password
 *   tags:
 *     - exampleCoffee
 *     - example
 *   description: Returns a user based on username
 *   operationId: loginCoffee
 *   consumes: 
 *     - text/html
 *   responses:
 *     200:
 *       description: Successful response.
 *       schema:
 *         '$ref': '#/definitions/User'
 *       

###

###
 * @swagger
 * path: /helloCoffee
 * httpMethod: GET
 * spec:
 *   summary: Get hello message
 *   tags:
 *     - exampleCoffee
 *     - example
 *   description: 'Return "Hello #{ name }!" string'
 *   operationId: helloCoffee
 *   consumes: 
 *     - text/html
 *   parameters:
 *     - name: name
 *       in: query
 *       description: Hello subject
 *       required: true
 *       type: string
 *   responses:
 *     200:
 *       description: Successful response.
 *       schema:
 *         type: string

###

###
 * @swagger
 * definitions:
 *   User:
 *     required:
 *       - username
 *       - password
 *     properties:
 *       username:
 *         type: string
 *       password:
 *         type: string    
###
```

## Examples

Clone the {swagger-express} repo, then install the dev dependencies:

    $ git clone git://github.com/vellotis/swagger-restify.git --depth 1
    $ cd swagger-restify
    $ npm install

and run the example, where {version} is one of '1.0', '1.2', or '2.0':

    $ cd examples
    $ cd example_v{version}
    $ node app.js
    
# Credits

- [swagger-express](https://github.com/fliptoo/swagger-express)
- [swagger-restify](https://github.com/yourdelivery/swagger-restify)
- [swagger-tools](https://github.com/apigee-127/swagger-tools)
- [Restify](http://mcavage.me/node-restify/)
- [Express](https://github.com/visionmedia/express)
- [swagger-jack](https://github.com/feugy/swagger-jack)

## License

(The MIT License)

Copyright (c) 2013 Fliptoo &lt;fliptoo.studio@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
