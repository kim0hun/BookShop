const ensureAuthorization = require('../auth');
const jwt = require('jsonwebtoken');
const mariadb = require('mysql2/promise');
const { StatusCodes } = require('http-status-codes');

const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dataString: true
    });

    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다. 다시 로그인하세요.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else {

        const { items, delivery, totalQuantity, totalPrice, firstBookTitle } = req.body;

        let sql = 'insert into delivery (address, receiver, contact) values (?, ?, ?)';
        let values = [delivery.address, delivery.receiver, delivery.contact];

        let [results] = await conn.execute(sql, values);

        let deliveryId = results.insertId;

        sql = `insert into orders (bookTitle, totalQuantity, totalPrice, userId, deliveryId)
    values (?, ?, ?, ?, ?)`;
        values = [firstBookTitle, totalQuantity, totalPrice, authorization.id, deliveryId];
        [results] = await conn.execute(sql, values);

        let orderId = results.insertId;

        sql = 'select bookId, quantity from cartItems where id in (?)';
        let [orderItems, field] = await conn.query(sql, [items]);

        sql = `insert into orderedBook (orderId, bookId, quantity) values ?`;
        values = [];
        orderItems.forEach((item) => {
            values.push([orderId, item.bookId, item.quantity]);
        });

        results = await conn.query(sql, [values]);

        results = await deleteCartItems(conn, items);

        return res.status(StatusCodes.OK).json(results);
    }
};

const deleteCartItems = async (conn, items) => {
    let sql = 'delete from cartItems where id in (?)';

    let [results] = await conn.query(sql, [items]);
    return results;
}

const getOrders = async (req, res) => {
    const conn = await mariadb.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dataString: true
    });

    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다. 다시 로그인하세요.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else {

        let sql = `select orders.id, createdAt, address, receiver, contact, bookTitle, totalQuantity, totalPrice
               from orders left join delivery
               on orders.deliveryId = delivery.id`;
        let [rows, fields] = await conn.query(sql);

        return res.status(StatusCodes.OK).json(rows);
    }
};

const getOrderDetail = async (req, res) => {

    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다. 다시 로그인하세요.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else {

        const orderId = req.params.id;

        const conn = await mariadb.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'Bookshop',
            dataString: true
        });

        let sql = `select bookId, title, author, price, quantity 
               from orderedBook left join books
               on orderedBook.bookId = books.id
               where orderId = ?`;
        let [rows, fields] = await conn.query(sql, orderId);

        return res.status(StatusCodes.OK).json(rows);
    }
};

module.exports = {
    order,
    getOrders,
    getOrderDetail
};