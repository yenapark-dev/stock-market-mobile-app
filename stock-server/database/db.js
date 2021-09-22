// const mysql = require("mysql");

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'yenapark',
//     password: 'Yenapark',
//     database: 'stock'
// });

// connection.connect(function(err) {
//     if(err) throw err;
// });

// // too often establish the connection
// module.exports = (req, res, next) => {
//     req.db = connection;
//     next();
// }