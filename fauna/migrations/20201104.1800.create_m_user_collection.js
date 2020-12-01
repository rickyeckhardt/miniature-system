const { client: db, query: q } = require('../../src/database/db')
const { up, down } = require('../lib/migrationFunctions')

module.exports.up = up(async function () {

    await db.query(
        q.CreateCollection({
            name: 'm_users'
        })
    )

})