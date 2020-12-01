const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

dotenv.config();

const loader = require('./loader');
const app = express();

app.use(cors({
    origin: process.env.MANAGEMENT_PORTAL_ORIGIN,
    credentials: true
}))

loader.routes(app);
loader.middleware(app);

if (process.env.NODE_ENV != 'test' && process.env.NODE_ENV != 'migrate') app.listen(process.env.PORT, () => console.log(`Application running on port ${process.env.PORT}. 🏃‍♂️`))

module.exports = {
    app
}