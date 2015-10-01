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
 *   - name: password
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