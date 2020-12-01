const express = require('express')
const middleware = require('../middleware/kernal')
const controller = require('../controllers/mUser')

const router = express.Router()
const base = `/api/v${process.env.VERSION}/users/m`

async function fetchMUser(req, res, next, id) {
    const { client: db, query: q } = require('../database/db')
    const User = require('../database/schemas/MUser')

    if (id == 'me') id = res.locals.user.id

    try {
        let doc = await db.query(
            q.Get(q.Match(q.Index('m_users_by_id'), id))
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

    router.param('user', fetchMUser)

    // --= CRUD =--
    router.post('/', controller.create)
    router.get('/', controller.index)
    router.get('/:user', controller.show)
    router.patch('/:user', controller.update)
    router.delete('/:user', controller.destroy)

    return router
})())


module.exports = {
    router,
    base
}