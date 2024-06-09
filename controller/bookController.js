const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const ensureAuthorization = require('../auth');
const query = require('../mariadb');

const allBooks = async (req, res) => {
    let { categoryId, news, limit, currentPage } = req.query;
    // 로직1
    let offset = limit * (currentPage - 1);

    let sql = 'select sql_calc_found_rows *, (select count(*) from likes where likedBookId = books.id) as likes from books';
    let values = [];

    if (categoryId && news == 'true') {
        sql += ' where categoryId=? and pubDate between date_sub(now(), interval 1 month) and now()';
        values = [categoryId];
    } else if (categoryId) {
        sql += ' where categoryId=?';
        values = [categoryId];
    } else if (news == 'true') {
        sql += ' where pubDate between date_sub(now(), interval 1 month) and now()';
    }

    sql += ' limit ? offset ?';
    values.push(parseInt(limit), offset);


    let results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }
    // 로직2
    if (results.length == 0) {
        return res.status(StatusCodes.NOT_FOUND).end();
    }

    let allBooksRes = {};
    allBooksRes.books = results;


    sql = 'select found_rows()';

    results = await query(sql);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    // 로직3
    let pagination = {};
    pagination.currentPage = parseInt(currentPage);
    pagination.totalCount = results[0]['found_rows()'];

    allBooksRes.pagination = pagination;

    return res.status(StatusCodes.OK).json(allBooksRes);
};

const bookDetail = async (req, res) => {
    
    let authorization = await ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다. 다시 로그인하세요.'
        });
    }
    
    if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    }
    
    let bookId = req.params.id;
    let sql, values;
    if (authorization instanceof ReferenceError) {
        sql =
            `select *,
             (select count(*) from likes where likedBookId=books.id) as likes
             from books left join category
             on books.categoryId = category.categoryId
             where books.id = ?;`;
        values = [bookId];
    } else {
        sql =
            `select *,
             (select count(*) from likes where likedBookId=books.id) as likes,
             (select exists (select * from likes where userId = ? and likedBookId = ?)) as liked 
             from books left join category
             on books.categoryId = category.categoryId
             where books.id = ?;`;
        values = [authorization.id, bookId, bookId];
    }

    let results = await query(sql, values);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    if (!results[0]) {
        return res.status(StatusCodes.NOT_FOUND).end();
    }

    return res.status(StatusCodes.OK).json(results[0]);
};

module.exports = {
    allBooks,
    bookDetail
};