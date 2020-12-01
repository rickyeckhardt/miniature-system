const fauna = require('faunadb')
const { query } = require('faunadb')

if (!process.env.FAUNA_ROOT_KEY) throw Error('FAUNA_ROOT_KEY not set. Unable to connect to database.');

let config = {
    domain: process.env.FAUNA_DOMAIN ?? 'db.fauna.com',
    secret: process.env.FAUNA_ROOT_KEY,
    scheme: process.env.FAUNA_SCHEME ?? 'https'
}

if (process.env.FAUNA_PORT) config.port = parseInt(process.env.FAUNA_PORT)

const client = new fauna.Client(config)

module.exports = { 
    client,
    query
}