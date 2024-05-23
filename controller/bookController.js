const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');

const allBooks = (req, res) => {
    const sql = 'select * from books';
    conn.query(sql, (err, results)=>{
        if(err){
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        if(results){
            return res.status(StatusCodes.OK).json(results);
        }else{
           return res.status(StatusCodes.NOT_FOUND).json('도서 정보 없음');
        }
    });
};

const bookDetail = (req, res) => {
    let {id} = req.params;
    
    let sql = 'select * from books where id = ?';
    conn.query(sql, id, (err, results)=>{
        if(err){
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if(results[0]){
            return res.status(StatusCodes.OK).json(results[0]);
        }else{
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    });
};

const booksByCategory = (req, res) => {
    res.json('카테고리별 도서 목록 조회');
};

module.exports = {
    allBooks,
    bookDetail,
    booksByCategory
};