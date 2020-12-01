require('dotenv').config({ path: '../.env' })

process.env.NODE_ENV = 'migrate';

const { app, logger } = require('../src/app');
const { dispatch } = require('./dispatcher');

const [
    nodePath,
    scriptPath,
    command,
    ...args
] = process.argv;

dispatch(command, args);