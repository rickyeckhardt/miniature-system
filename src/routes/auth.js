const express = require('express')
const middleware = require('../middleware/kernal')
const controller = require('../controllers/auth')

const router = express.Router()
const base = `/api/v${process.env.VERSION}/auth`


router.use((function() {
    let router = express.Router()

    middleware.global(router)

    router.post('/token', controller.token)

    return router
})())


module.exports = {
    router,
    base
}