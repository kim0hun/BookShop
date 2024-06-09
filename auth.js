const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const dotenv = require('dotenv');
dotenv.config();


const verifyLoginAuth = (req, res) => {
    try {
        let receivedJwt = req.headers['authorization'];
        // console.log('received jwt : ', receivedJwt);

        if (receivedJwt) {
            let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
            console.log('decodedJwt : ', decodedJwt);

            return decodedJwt;
        } else {
            throw new ReferenceError('jwt must be provided');
        }


    } catch (err) {
        console.log('err.name : ', err.name);
        console.log('err.message : ', err.message);

        return err;
    }
};

const checkLoginJwtError = (auth, res) => {
    if (auth instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다. 다시 로그인하세요.'
        });
    }

    if (auth instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    }

    return null;
};

module.exports = {
    verifyLoginAuth,
    checkLoginJwtError
};