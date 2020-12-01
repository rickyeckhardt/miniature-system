const { client: db, query: q } = require('../../src/database/db')
const { up, down } = require('../lib/migrationFunctions')

module.exports.up = up(async function () {

    await db.query(
        q.CreateIndex({
            name: 'm_users_by_email',
            source: q.Collection('m_users'),
            terms: [
                { field: ['data', 'email'] }
            ]
        })
    )

    await db.query(
        q.CreateIndex({
            name: 'm_users_by_role',
            source: q.Collection('m_users'),
            terms: [
                { field: ['data', 'role'] }
            ]
        })
    )

    await db.query(
        q.CreateIndex({
            name: 'm_users_by_id',
            source: q.Collection('m_users'),
            terms: [
                { field: ['data', 'id'] }
            ]
        })
    )



})