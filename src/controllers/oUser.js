const yup = require('yup')
const { client: db, query: q } = require('../database/db')
const User = require('../database/schemas/OUser')

module.exports = {

    async invite(req, res) {
        const jwt = require('jsonwebtoken');
    
        if (process.env.JWT_SALT && process.env.JWT_PRIVATE_KEY) {
            let key = process.env.JWT_SALT + process.env.JWT_PRIVATE_KEY
            let payload = {
                id: res.locals.target.id,
                exp: Date.now() + (1.5 * 30 * 24 * 60 * 60)
            }

            jwt.sign(payload, key, { algorithm: 'HS256' }, (error, token) => {
                if (error) {
                    res.status(500).send({ 
                        message: 'Failed to create token!',
                        error: error.message })
                } else {
                    res.status(200).send({ token })
                }
            })
            
        } else {
            res.status(500).send({ message: 'Error! Unable to sign token without a salt and key.' }) 
        }
    },

    async show(req, res) {
        res.status(200).send(res.locals.target)
    },

    async status(req, res) {
        let doc = await db.query(
            q.Select(['data', 'status'], q.Get(q.Match(q.Index('users_by_id'), res.locals.user.id)))
        )

        res.send(doc)
    },

    async create(req, res) {
        const { v4: uuid } = require('uuid');

        let schema = yup.object().noUnknown(true).shape({
            name: yup.string().required(),
            email: yup.string().email().required(),
            fields: yup.object()
        })

        let user = req.body

        let documents = require('../../storage/docs/new-agent.json');
        let form = require('../../storage/forms/agent-onboarding.json');
        
        try {
            await schema.validate(user, { strict: true })

            let result = await db.query(
                q.Create(q.Collection('users'), {
                    data: {
                        id: uuid(),
                        name: user.name,
                        email: user.email,
                        stage: 'incomplete',
                        status: {
                            message: 'Just created!',
                            status_code: 'created',
                            updated_at: (new Date).toJSON()
                        },
                        form,
                        fields: {
                            ...user.fields
                        },
                        documents
                    }
                })
            )

            res.status(201).send(new User(result))
        } catch (error) {
            if (error.name == 'ValidationError') {
                res.status(400).send({
                    message: 'Invalid request.',
                    errors: error.errors
                })
            } else {
                res.status(500).send({
                    message: 'Error creating O-User!',
                    error: error.message
                })
            }
        }
    },

    async index(req, res) {
        let users = []
        let expr

        if (req.query.stage) expr = q.Match(q.Index('users_by_stage'), req.query.stage)
        else expr = q.Documents(q.Collection('users'))

        await db.paginate(expr)
            .map(ref => q.Get(ref))
            .each(page => users.push(...page))
        
        res.send(
            users.map(user => new User(user))
        )
    },

    async update(req, res) {

        let updates = req.body
        let shape = yup.object().noUnknown(true).shape({
            name: yup.string(),
            email: yup.string().email(),
            fields: yup.object()
        })

        try {
            await shape.validate(updates, { strict: true })
        } catch (error) {
            res.status(400).send({
                message: 'Invalid request body',
                errors: error.errors
            })
            return
        }

        try {
            let results = await db.query(
                q.Update(q.Select(['ref'],
                    q.Get(q.Match(q.Index('users_by_id'), res.locals.target.id))
                    ), {
                        data: {
                            name: updates.name,
                            email: updates.email,
                            fields: updates.fields,
                        }
                    })
                )
            res.send(new User(results))
        }
        catch (err) {
            console.log(err)
            res.status(500).send({
                message: 'Error updating user!',
                error: err
            })
        }


    },

    async destroy(req, res) {

        try {
            await db.query(
                q.Delete(
                    q.Select(['ref'], 
                        q.Get(q.Match(q.Index('users_by_id'), res.locals.target.id))
                    )
                )
            )
            res.status(200).send()
        } catch (error) {
            console.log(error)
            res.status(500).send({
                message: 'Unable to delete.',
                error: error.message
            })
        }

    }

}