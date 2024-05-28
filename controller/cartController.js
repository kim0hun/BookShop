const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');

const addToCart = (req, res) =>{
    
    const {book_id, quantity, user_id} = req.body;

    let sql = 'insert into cartItems (book_id, quantity, user_id) values (?, ?, ?)';
    let values = [book_id, quantity, user_id];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

const getCartItems = (req, res) =>{
    const {user_id, selected} = req.body;
    
    let sql = `select cartItems.id, book_id, title, summary, quantity, price
     from cartItems left join books
     on cartItems.book_id = books.id
     where user_id = ? and cartItems.id in (?)`;
    let values = [user_id, selected];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

const removeCartItem = (req, res) =>{
    const {id} = req.params;

    let sql = 'delete from cartItems where id = ?';
    conn.query(sql, id, (err, results) => {
        if (err) {
            console.log(err);
            res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

module.exports = {
    addToCart,
    getCartItems,
    removeCartItem
};