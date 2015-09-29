
###
 * @swagger
 * resourcePath: /apiCoffee
 * description: All about API using CoffeeScript annotations
###

###
 * @swagger
 * path: /loginCoffee
 * operations:
 *   -  method: POST
 *      summary: Login with username and password
 *      notes: Returns a user based on username
 *      type: User
 *      nickname: login
 *      consumes: 
 *        - text/html
 *      parameters:
 *        - name: username
 *          description: Your username
 *          paramType: query
 *          required: true
 *          type: string
 *        - name: password
 *          description: Your password
 *          paramType: query
 *          required: true
 *          type: string

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