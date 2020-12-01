const { app } = require('../app');


// Groups a set of middleware into an autoregistering function. If a router is passed to it, then it will regsiter the middleware on the provided router, otherwise it will register it globally.
function group(middleware) {
    return (router = app) => {
        middleware.forEach(handler => router.use(handler));
    }
}

module.exports = {

    global: group([
        require('body-parser').json(),
        require('./handleError')
    ]),

    secured: group([
        require('./authenticate'),
    ])
    
}