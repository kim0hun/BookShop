const { StatusCodes } = require('http-status-codes');
const {verifyLoginAuth, checkLoginJwtError} = require('../auth');
const query = require('../mariadb');

const order = async (req, res) => {
    let authorization = await verifyLoginAuth(req, res);
    let errorResponse = await checkLoginJwtError(authorization, res);
    if(errorResponse){
        return errorResponse;
    }

    const { items, delivery, totalQuantity, totalPrice, firstBookTitle } = req.body;

    let sql = 'insert into delivery (address, receiver, contact) values (?, ?, ?)';
    let values = [delivery.address, delivery.receiver, delivery.contact];

    let results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    let deliveryId = results.insertId;

    sql = `insert into orders (bookTitle, totalQuantity, totalPrice, userId, deliveryId)
           values (?, ?, ?, ?, ?)`;
    values = [firstBookTitle, totalQuantity, totalPrice, authorization.id, deliveryId];

    results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    let orderId = results.insertId;

    sql = 'select bookId, quantity from cartItems where id in (?)';

    orderItems = await query(sql, [items]);
    if (orderItems instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(orderItems);
    }

    sql = `insert into orderedBook (orderId, bookId, quantity) values ?`;
    values = [];
    orderItems.forEach((item) => {
        values.push([orderId, item.bookId, item.quantity]);
    });

    results = await query(sql, [values]);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    sql = 'delete from cartItems where id in (?)';

    results = await query(sql, [items]);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);
};

const getOrders = async (req, res) => {
    let authorization = await verifyLoginAuth(req, res);
    let errorResponse = await checkLoginJwtError(authorization, res);
    if(errorResponse){
        return errorResponse;
    }

    let sql = `select orders.id, createdAt, address, receiver, contact, bookTitle, totalQuantity, totalPrice
               from orders left join delivery
               on orders.deliveryId = delivery.id`;

    let results = await query(sql);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);
};

const getOrderDetail = async (req, res) => {
    let authorization = await verifyLoginAuth(req, res);
    let errorResponse = await checkLoginJwtError(authorization, res);
    if(errorResponse){
        return errorResponse;
    }
    
    const orderId = req.params.id;

    let sql = `select bookId, title, author, price, quantity 
               from orderedBook left join books
               on orderedBook.bookId = books.id
               where orderId = ?`;

    let results = await query(sql, orderId);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);
};

module.exports = {
    order,
    getOrders,
    getOrderDetail
};