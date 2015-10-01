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