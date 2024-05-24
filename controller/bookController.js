const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

const allBooks = (req, res) => {
    let {category_id} = req.query;

    if(category_id){
        let sql = 'select * from books where category_id = ?';
        conn.query(sql, category_id, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
    
            if(results.length){
                return res.status(StatusCodes.OK).json(results);
            }else{
                return res.status(StatusCodes.NOT_FOUND).end();
            }
        });
    }else{
        const sql = 'select * from books';
        conn.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
    
            return res.status(StatusCodes.OK).json(results);
        });
    }
};

const bookDetail = (req, res) => {
    let { id } = req.params;

    let sql = 'select * from books left join category on books.category_id = category.id where category.id = ?';
    conn.query(sql, id, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if (results[0]) {
            return res.status(StatusCodes.OK).json(results[0]);
        } else {
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    });
};

module.exports = {
    allBooks,
    bookDetail
};