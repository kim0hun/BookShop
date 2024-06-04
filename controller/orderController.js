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

        let delivery_id = results.insertId;

        sql = `insert into orders (book_title, total_quantity, total_price, user_id, delivery_id)
    values (?, ?, ?, ?, ?)`;
        values = [firstBookTitle, totalQuantity, totalPrice, authorization.id, delivery_id];
        [results] = await conn.execute(sql, values);

        let order_id = results.insertId;

        sql = 'select book_id, quantity from cartItems where id in (?)';
        let [orderItems, field] = await conn.query(sql, [items]);

        sql = `insert into orderedBook (order_id, book_id, quantity) values ?`;
        values = [];
        orderItems.forEach((item) => {
            values.push([order_id, item.book_id, item.quantity]);
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

        let sql = `select orders.id, created_at, address, receiver, contact, book_title, total_quantity, total_price
               from orders left join delivery
               on orders.delivery_id = delivery.id`;
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

        let sql = `select book_id, title, author, price, quantity 
               from orderedBook left join books
               on orderedBook.book_id = books.id
               where order_id = ?`;
        let [rows, fields] = await conn.query(sql, orderId);

        return res.status(StatusCodes.OK).json(rows);
    }
};

module.exports = {
    order,
    getOrders,
    getOrderDetail
};