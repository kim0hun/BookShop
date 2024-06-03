const jwt = require('jsonwebtoken');
const conn = require('../mariadb'); // db 모듈
const { StatusCodes } = require('http-status-codes'); // status code 모듈
const dotenv = require('dotenv');
dotenv.config();

const addLike = (req, res) => {

    const { id } = req.params;

    let receivedJwt = req.headers['authorization'];
    console.log('received jwt : ', receivedJwt);

    let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
    console.log(decodedJwt);

    let sql = 'insert into likes (user_id, liked_book_id) values (?, ?)';
    let values = [decodedJwt.id, id];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

const removeLike = (req, res) => {

    const { id } = req.params;
    const { user_id } = req.body;

    let sql = 'DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?';
    let values = [user_id, id];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

module.exports = {
    addLike,
    removeLike
};