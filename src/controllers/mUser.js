const yup = require('yup')
const bcrypt = require('bcrypt')
const { client: db, query: q } = require('../database/db')
const User = require('../database/schemas/MUser')

module.exports = {

    async show(req, res) {
        res.status(200).send(res.locals.target)
    },

    async create(req, res) {
        const { v4: uuid } = require('uuid');

        let schema = yup.object().noUnknown(true).shape({
            name: yup.string().required(),
            email: yup.string().email().required(),
            password: yup.string().required(),
            role: yup.string().required(),
            fields: yup.object()
        })

        let user = req.body

        try {
            await schema.validate(user, { strict: true })

            let password = await bcrypt.hash(user.password, 10);
            let result = await db.query(
                q.Create(q.Collection('m_users'), {
                    data: {
                        id: uuid(),
                        name: user.name,
                        email: user.email,
                        password,
                        fields: user.fields,
                        role: user.role
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
                    message: 'Error creating M-User!',
                    error: error.message
                })
            }
        }
    },

    async index(req, res) {
        let users = []
        let expr = q.Documents(q.Collection('m_users'))

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
            role: yup.string(),
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
                    q.Get(q.Match(q.Index('m_users_by_id'), res.locals.target.id))
                    ), {
                        data: {
                            name: updates.name,
                            email: updates.email,
                            fields: updates.fields,
                            role: updates.role
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
                        q.Get(q.Match(q.Index('m_users_by_id'), res.locals.target.id))
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