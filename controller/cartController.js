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
    res.json('장바구니 조회');
};

const removeCartItem = (req, res) =>{
    res.json('장바구니 도서 삭제');
};

module.exports = {
    addToCart,
    getCartItems,
    removeCartItem
};