module.exports = function (error, req, res, next) {

    let body = {
        status: error.code,
        message: error.message
    }

    if (process.env.NODE_ENV != 'production') body.stack = error.stack;
    
    res.status(500);
    console.error(error);
    res.send(body);

    next();
}