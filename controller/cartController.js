const { StatusCodes } = require('http-status-codes');
const { verifyLoginAuth, checkLoginJwtError } = require('../auth');
const query = require('../mariadb');

const addToCart = async (req, res) => {
    let authorization = await verifyLoginAuth(req, res);
    let errorResponse = await checkLoginJwtError(authorization, res);
    if (errorResponse) {
        return errorResponse;
    }
    
    const { bookId, quantity } = req.body;

    let sql = 'insert into cartItems (bookId, quantity, userId) values (?, ?, ?)';
    let values = [bookId, quantity, authorization.id];

    let results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);
};

const getCartItems = async (req, res) => {
    let authorization = await verifyLoginAuth(req, res);
    let errorResponse = await checkLoginJwtError(authorization, res);
    if (errorResponse) {
        return errorResponse;
    }

    const { selected } = req.body;

    let sql = `select cartItems.id, bookId, title, summary, quantity, price
               from cartItems left join books
               on cartItems.bookId = books.id
               where userId = ?`;
    let values = [authorization.id];

    if (selected) { // 주문서 작성 시 '선택한 장바구니 목록 조회'
        sql += ' and cartItems.id in (?)';
        values.push(selected);
    }

    let results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);
};

const removeCartItem = async (req, res) => {
    let authorization = await verifyLoginAuth(req, res);
    let errorResponse = await checkLoginJwtError(authorization, res);
    if (errorResponse) {
        return errorResponse;
    }

    const cartItemId = req.params.id;

    let sql = 'delete from cartItems where id = ?';

    let results = await query(sql, cartItemId);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);
};

module.exports = {
    addToCart,
    getCartItems,
    removeCartItem
};