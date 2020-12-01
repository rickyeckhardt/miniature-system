const { client: db, query: q } = require('../../src/database/db')
const { up, down } = require('../lib/migrationFunctions')

module.exports.up = up(async function () {

    await db.query(
        q.Update(q.Index('m_users_by_id'), {
            unique: true
        })
    )

    await db.query(
        q.Update(q.Index('m_users_by_email'), {
            unique: true
        })
    )

})