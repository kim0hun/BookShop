const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const crypto = require('crypto'); // crypto 모듈 : 암호화
const dotenv = require('dotenv'); // dotenv 모듈
dotenv.config();
const query = require('../mariadb');

const join = async (req, res) => {
    const { email, password } = req.body;

    // 로직
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');


    let sql = 'insert into users (email, password, salt) values (?, ?, ?)';
    let values = [email, hashPassword, salt];

    let results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);

};

const login = async (req, res) => {
    const { email, password } = req.body;


    let sql = 'select * from users where email = ?';

    let results = await query(sql, email);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    // 로직
    const loginUser = results[0];

    const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');

    if (!(loginUser && loginUser.password == hashPassword)) {
        return res.status(StatusCodes.UNAUTHORIZED).end();
    }

    const token = jwt.sign({
        id: loginUser.id,
        email: loginUser.email
    }, process.env.PRIVATE_KEY, {
        expiresIn: '10m',
        issuer: 'hoon'
    });

    res.cookie('token', token, {
        httpOnly: true
    });

    return res.status(StatusCodes.OK).json(results);
};

const passwordResetRequest = async (req, res) => {
    const { email } = req.body;


    let sql = 'select * from users where email = ?';

    let results = await query(sql, email);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }


    const user = results[0];
    if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).end();
    }

    return res.status(StatusCodes.OK).json({
        email: email
    });
};

const passwordReset = async (req, res) => {
    const { email, password } = req.body;

    // 로직
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');


    let sql = 'update users set password = ?, salt = ? where email = ?';
    let values = [hashPassword, salt, email];

    let results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    if (results.affectedRows == 0) {
        return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(results);
};

module.exports = {
    join,
    login,
    passwordResetRequest,
    passwordReset
};