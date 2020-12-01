const { exit } = require('process');
const { logger } = require('../app');
const JWT = require('jsonwebtoken');
const { client: db, query: q } = require('../database/db');
const User = require('../database/schemas/MUser')

module.exports = function(req, res, next) {
    let token = req.query.access ?? req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(400).send({ message: 'No token.' })
        exit
    }

    if (!process.env.JWT_SALT || !process.env.JWT_PRIVATE_KEY) {
        res.status(500).send({ message: 'Error decoding token.' })
        logger.error('JWT_SALT and/or JWT_PRIVATE_KEY are unset!')
    }

    let key = process.env.JWT_SALT + process.env.JWT_PRIVATE_KEY;

    JWT.verify(token, key, async (error, payload) => {

        if (error) {
            res.status(500).send({
                message: 'Error decoding token.',
                error: error.message
            })
        } else {
            res.locals.payload = payload;
            try {
                res.locals.user = new User(await db.query(
                    q.Get(q.Match(q.Index('m_users_by_id'), payload.id))
                ))
                next()
            } catch (error) {
                res.status(404).send({
                    message: `User not found: ${payload.id}`,
                })
            }
        }

    })
}