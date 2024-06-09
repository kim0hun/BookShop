const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { verifyLoginAuth, checkLoginJwtError } = require('../auth');
const query = require('../mariadb');

const addLike = async (req, res) => {
    let authorization = await verifyLoginAuth(req, res);
    let errorResponse = await checkLoginJwtError(authorization, res);
    if (errorResponse) {
        return errorResponse;
    }

    const bookId = req.params.id;

    let sql = 'insert into likes (userId, likedBookId) values (?, ?)';
    let values = [authorization.id, bookId];

    let results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);
};

const removeLike = async (req, res) => {
    let authorization = await verifyLoginAuth(req, res);
    let errorResponse = await checkLoginJwtError(authorization, res);
    if (errorResponse) {
        return errorResponse;
    }

    const bookId = req.params.id;

    let sql = 'DELETE FROM likes WHERE userId = ? AND likedBookId = ?';
    let values = [authorization.id, bookId];

    let results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);
};

module.exports = {
    addLike,
    removeLike
};