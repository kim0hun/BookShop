const ensureAuthorization = require('../auth');
const jwt = require('jsonwebtoken');
const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

const allBooks = (req, res) => {
    let allBooksRes = {};
    let { categoryId, news, limit, currentPage } = req.query;

    let offset = limit * (currentPage - 1);

    let sql = 'select sql_calc_found_rows *, (select count(*) from likes where likedBookId = books.id) as likes from books';
    let values = [];

    if (categoryId && news) {
        sql += ' where categoryId=? and pubDate between date_sub(now(), interval 1 month) and now()';
        values = [categoryId];
    } else if (categoryId) {
        sql += ' where categoryId=?';
        values = [categoryId];
    } else if (news) {
        sql += ' where pubDate between date_sub(now(), interval 1 month) and now()';
    }

    sql += ' limit ? offset ?';
    values.push(parseInt(limit), offset);

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        console.log(results);

        if (results.length) {
            allBooksRes.books = results;
        } else {
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    });

    sql = 'select found_rows()';

    conn.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
    
        let pagination = {};
        pagination.currentPage = parseInt(currentPage);
        pagination.totalCount = results[0]['found_rows()'];

        allBooksRes.pagination = pagination;

        return res.status(StatusCodes.OK).json(allBooksRes);
    });

};

const bookDetail = (req, res) => {

    // 로그인 상태가 아니면 => liked 빼고 보내주면 되고
    // 로그인 상태이면 => liked 추가해서

    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다. 다시 로그인하세요.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else if (authorization instanceof ReferenceError) {
        let bookId = req.params.id;

        let sql =
            `select *,
            (select count(*) from likes where likedBookId=books.id) as likes
            from books left join category
            on books.categoryId = category.categoryId
            where books.id = ?;`;
        let values = [bookId];

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

    } else {

        let bookId = req.params.id;

        let sql =
            `select *,
            (select count(*) from likes where likedBookId=books.id) as likes,
            (select exists (select * from likes where userId = ? and likedBookId = ?)) as liked 
            from books left join category
            on books.categoryId = category.categoryId
            where books.id = ?;`;
        let values = [authorization.id, bookId, bookId];
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
    }
};

module.exports = {
    allBooks,
    bookDetail
};