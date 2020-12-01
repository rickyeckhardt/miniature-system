const express = require('express')
const middleware = require('../middleware/kernal')
const controller = require('../controllers/oUser')

const router = express.Router()
const base = `/api/v${process.env.VERSION}/users/o`


async function fetchOUser(req, res, next, id) {
    const { client: db, query: q } = require('../database/db')
    const User = require('../database/schemas/OUser')

    try {
        let doc = await db.query(
            q.Get(q.Match(q.Index('users_by_id'), id))
        )
        res.locals.target = new User(doc)
        next()
    } catch (err) {
        if (err.message == 'instance not found') {
            res.status(404).send({
                message: `User not found: ${id}`
            })
        } else {
            res.status(500).send({
                message: 'Error fetching user',
                error: err.message
            })
        }
    }
    
}

router.use((function() {
    let router = express.Router()

    middleware.secured(router)
    middleware.global(router)

    router.param('user', fetchOUser)

    // --= CRUD =--
    router.post('/', controller.create)
    router.get('/', controller.index)
    router.get('/:user', controller.show)
    router.patch('/:user', controller.update)
    router.delete('/:user', controller.destroy)
    
    // --= Special =--
    router.get('/:user/invite', controller.invite)
    router.get('/:user/status', controller.status)

    return router
})())


module.exports = {
    router,
    base
}