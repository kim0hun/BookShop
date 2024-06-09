const { StatusCodes } = require('http-status-codes');
const query = require('../mariadb');

const allCategory = async (req, res) => {
    let sql = 'select * from category';

    let results = await query(sql);
    if (results instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json(results);
    }

    return res.status(StatusCodes.OK).json(results);
};

module.exports = { allCategory };