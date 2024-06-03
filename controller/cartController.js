const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const {ensureAuthorization} = require('./likeController');

const addToCart = (req, res) =>{
    
    const {book_id, quantity} = req.body;

    let authorization = ensureAuthorization(req);

    let sql = 'insert into cartItems (book_id, quantity, user_id) values (?, ?, ?)';
    let values = [book_id, quantity, authorization.id];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

const getCartItems = (req, res) =>{
    const {selected} = req.body;
    
    let authorization = ensureAuthorization(req);

    let sql = `select cartItems.id, book_id, title, summary, quantity, price
     from cartItems left join books
     on cartItems.book_id = books.id
     where user_id = ? and cartItems.id in (?)`;
    let values = [authorization.id, selected];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

const removeCartItem = (req, res) =>{
    const cartItemId = req.params.id;

    let sql = 'delete from cartItems where id = ?';
    conn.query(sql, cartItemId, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

module.exports = {
    addToCart,
    getCartItems,
    removeCartItem
};