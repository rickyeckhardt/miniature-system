const yup = require('yup')
const bcrypt = require('bcrypt')
const { client: db, query: q } = require('../database/db')


module.exports = {

    async token(req, res) {
        const credentials = req.body
        const schema = yup.object().shape({
            email: yup.string().required(),
            password: yup.string().required()
        })

        try {
            await schema.validate(credentials, { strict: true })
        } catch (error) {
            res.status(400).send({
                message: 'Malformed request!',
                errors: error.errors
            })   
        }

        const jwt = require('jsonwebtoken');
        let user
        let matches = false
        try {
            let doc = await db.query(q.Get(q.Match(q.Index('m_users_by_email'), credentials.email)))
            user = doc.data
            matches = await bcrypt.compare(credentials.password, user.password)
        } catch (error) {
            if (error.message == 'instance not found') res.status(404).send({
                message: `User not found: ${user.id}`,
            })
            else if (error) res.status(500).send({
                message: `Error!`,
                error: error.message
            })
            return
        }

        if (matches) {

            let key = process.env.JWT_SALT + process.env.JWT_PRIVATE_KEY
            let payload = {
                id: user.id,
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
            res.status(500).send({ message: 'Invalid credentials' }) 
        }
    }

}