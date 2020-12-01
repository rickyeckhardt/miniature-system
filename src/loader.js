const middleware = require('./middleware/kernal');
const fs = require('fs');


module.exports = {
    
    routes(app) {
        let path = `${__dirname}/routes`;
        let routeFiles = fs.readdirSync(path);
        for (let file of routeFiles) {
            let { router, base } = require(`${path}/${file}`);
            app.use(base, router);
        };
    },

    middleware(app) {
        middleware.global(app);
    }

}