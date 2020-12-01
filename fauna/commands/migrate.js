const fs = require('fs');
const { client, query } = require('../../src/database/db');
const { v4: uuid } = require('uuid');

function getMigrations() {
    let path = `${__dirname}/../migrations`;
    let migrations = new Map();
    let files = fs.readdirSync(path);

    files = files.sort()

    for (let file of files) {
        migrations.set(file, require(`${path}/${file}`))
    }

    return migrations;
}

async function getMigrationDocs() {
    let migrations = [];
    
    await client.paginate(
        query.Documents(query.Collection('migrations'))
    )   .map(ref => query.Get(ref))
        .each(page => migrations.push(...page))

    return migrations.map(migration => ({ 
        ref: migration.ref, 
        ...migration.data 
    }))
}

async function createCollection() {
    await client.query(
        query.CreateCollection({
            name: 'migrations'
        })
    )
}


module.exports = async function(args) {

    try {
        let docs = await getMigrationDocs()
        let migrations = getMigrations()
        
        docs = docs.map(doc => doc.file)
        
        for (let file of migrations.keys()) {
            if (docs.includes(file)) migrations.delete(file)
        }

        const batchId = uuid(); 
        for (let migration of migrations) {
            let name = migration[0]
            let up = migration[1].up

            try {
                await up(name, batchId)
            } catch (error) {
                console.log('Exiting without starting remaining migrations.')
                break
            }
        }
    } catch (error) {
        console.log(error)
        let errors = error.requestResult.responseContent.errors;
        
        if (
            errors.length < 2 &&
            errors[0].code == 'invalid ref' && 
            errors[0].position.toString() == ['collection', 'documents'].toString()
        ) {
            console.log('No migrations collection, creating collection...');
            await createCollection();
        } else {
            console.error(`Error(s)! ${error.description}`)
            console.log(errors)
        }
    }

}