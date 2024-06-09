const mariadb = require('mysql2/promise');

// const connection = mariadb.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'root',
//     database: 'Bookshop'
// });

// module.exports = connection;

const db = {
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'Bookshop'
};

const query = async function(sql, values = undefined) {
    const conn = await mariadb.createConnection(db);
    let rows, fields;

    try{

        if(values){
            [rows, fields] = await conn.query(sql, values);
        }else{
            [rows, fields] = await conn.query(sql);
        }
        return rows;

    } catch (error){

        return error;
    
    }
};

module.exports = query;