// const conn = require('../mariadb');
const mariadb = require('mysql2/promise');
const {StatusCodes} = require('http-status-codes');

const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dataString: true
    });

    const {items, delivery, totalQuantity, totalPrice, userId, firstBookTitle} = req.body;

    let sql = 'insert into delivery (address, receiver, contact) values (?, ?, ?)';
    let values = [delivery.address, delivery.receiver, delivery.contact];
    
    let [results] = await conn.execute(sql, values);

    let delivery_id = results.insertId;

    sql = `insert into orders (book_title, total_quantity, total_price, user_id, delivery_id)
    values (?, ?, ?, ?, ?)`;
    values = [firstBookTitle, totalQuantity, totalPrice, userId, delivery_id];
    [results] = await conn.execute(sql, values);

    let order_id = results.insertId;

    sql = `insert into orderedBook (order_id, book_id, quantity) values ?`;
    values = [];
    items.forEach((item) => {
        values.push([order_id, item.book_id, item.quantity]);
    });
    [results] = await conn.query(sql, [values]);

    return res.status(StatusCodes.OK).json(results);
};

const getOrders = (req, res) => {
    res.json('주문 목록 조회');
};

const getOrderDetail = (req, res) => {
    res.json('주문 상세 상품 조회');
};

module.exports = {
    order,
    getOrders,
    getOrderDetail
};