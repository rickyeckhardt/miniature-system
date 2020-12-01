const fs = require('fs');
const commands = new Map();

for (let filename of fs.readdirSync('./commands')) {
    commands.set(filename.replace('.js', ''), require(`./commands/${filename}`))
}

module.exports.dispatch = function(command, args) {
    if (!commands.has(command)) throw new Error('Non-existant command!');
    command = commands.get(command);
    command(args);
}