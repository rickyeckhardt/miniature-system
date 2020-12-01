const { client, query } = require('../../src/database/db');

module.exports.up = function(callback) {

    return async function(filename, batchId) {
        
        console.log(`${batchId} | Running Migration: ${filename}`)

        try {
            let results = await callback();
            let result = await client.query(
                query.Create(
                    query.Collection('migrations'),
                    {
                        data: {
                            file: filename,
                            time: (new Date()).toJSON(),
                            batch: batchId,
                            results
                        }
                    }
                )
            )

            console.log(result)
            console.log('[✔] Migration successful!')
            
        } catch (error) {
            console.error(error)
            console.error(`[❌] Migration failed! `)
            return error;
        }

    }

}

// TODO: Undo
// module.exports.down = function up(callback) {

//     return async function(filename, batchId) {
//         let results = await callback();

//         return await client.query(
//             query.Create(
//                 query.Collection('migrations'),
//                 {
//                     file: filename,
//                     time: Date.now().toJSON(),
//                     batch: batchId,
//                     results
//                 }
//             )
//         )

//     }

// }