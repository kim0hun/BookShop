const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

const allBooks = (req, res) => {
    let { category_id, news, limit, currentPage } = req.query;

    let offset = limit * (currentPage - 1);

    let sql = 'select *, (select count(*) from likes where liked_book_id = books.id) as likes from books';
    let values = [];

    if (category_id && news) {
        sql += ' where category_id=? and pub_date between date_sub(now(), interval 1 month) and now()';
        values = [category_id];
    } else if (category_id) {
        sql += ' where category_id=?';
        values = [category_id];
    } else if (news) {
        sql += ' where pub_date between date_sub(now(), interval 1 month) and now()';
    }

    sql += ' limit ? offset ?';
    values.push(parseInt(limit), offset);

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if (results.length) {
            return res.status(StatusCodes.OK).json(results);
        } else {
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    });

};

const bookDetail = (req, res) => {
    let {user_id} = req.body;
    let { id } = req.params;

    let sql = 
    `select *,
    (select count(*) from likes where liked_book_id=books.id) as likes,
    (select exists (select * from likes where user_id = ? and liked_book_id = ?)) as liked 
    from books 
    left join category
    on books.category_id = category.id
    where books.id = ?;`;
    let values = [user_id, id, id]
    conn.query(sql, values, (err, results) => {
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