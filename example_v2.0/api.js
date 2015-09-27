
/**
 * @swagger
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
 * path: /login
 * httpMethod: POST
 * spec:
 *   summary: Login with username and password
 *   description: Returns a user based on username
 *   operationId: login
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
  user.username = req.params.username;
  user.password = req.params.password;
  res.send(200, user);
  next();
};

/**
 * @swagger
 * path: /hello
 * httpMethod: GET
 * spec:
 *   summary: Login with username and password
 *   description: 'Return "Hello #{ name }!" string'
 *   operationId: hello
 *   consumes: 
 *     - text/html
 *   parameters:
 *     - name: name
 *       in: query
 *       description: Object name to say hello to.
 *       required: true
 *       type: string
*/
exports.hello = function (req, res, next) {
  var name = req.params.name || 'unknown';
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
 *         type: String
 *       password:
 *         type: String    
 */