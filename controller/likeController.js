const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const ensureAuthorization = require('../auth');
const query = require('../mariadb');

const addLike = async (req, res) => {
    let authorization = await ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다. 다시 로그인하세요.'
        });
    }

    if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
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
    let authorization = await ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다. 다시 로그인하세요.'
        });
    }

    if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
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