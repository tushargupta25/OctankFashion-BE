'use strict';

const bodyParser = require('body-parser');
const express = require('express');

// Constants
const PORT = 8443;
const HOST = '0.0.0.0';
var mysql = require('mysql');

// const DB_CONFIG = {
//   host: '127.0.0.1',
//   user: 'root',
//   password: 'toor',
//   database: 'octank'
// };

const DB_CONFIG = {
  host: 'ab3-database.cluster-ccezr4etloks.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Redshift123',
  database: 'octank'
};

const DB_CONFIG_READ_ONLY = {
  host: 'ab3-database.cluster-ro-ccezr4etloks.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Redshift123',
  database: 'octank'
};

// App
const app = express();

app.use(bodyParser.json());

function sqlToJSON(results) {
  return results.map(v => Object.assign({}, v));
}

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'GET, DELETE, PUT, POST');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

app.get('/products', (req, res) => {
  var connection = mysql.createConnection(DB_CONFIG_READ_ONLY);
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  });
  connection.query("SELECT * from products", function (err, result, fields) {
    if (err) throw err;
    connection.end();
    res.send(sqlToJSON(result));
  });  
});

app.post('/cart', (req, res) => {
  var connection = mysql.createConnection(DB_CONFIG);
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  });
  connection.query(`INSERT INTO cart (product_id, email) VALUES (${req.body.item}, '${req.body.email}')`, function (err, result, fields) {
    if (err) throw err;
    connection.end();
    res.send(result)
  });
})

app.get('/cart', (req, res) => {
  var connection = mysql.createConnection(DB_CONFIG_READ_ONLY);
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  });
  connection.query(`SELECT * from cart WHERE email = '${req.query.email}'`, function (err, result, fields) {
    if (err) throw err;
    connection.end();
    res.send(sqlToJSON(result));
  });
})

app.delete('/cart', (req, res) => {
  var connection = mysql.createConnection(DB_CONFIG);
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  });
  connection.query(`DELETE from cart WHERE id = '${req.body.item}'`, function (err, result, fields) {
    if (err) throw err;
    connection.end();
    res.send("deleted");
  });
})

app.post('/test', (req, res) => {
  console.log('Working');

  var connection = mysql.createConnection ({
  host: 'ab3-database.cluster-ccezr4etloks.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Redshift123',
  database: 'prestashop'
  });

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }});

console.log(req.body);
console.log(req.body.email);
var sql = "INSERT INTO cart (username, item, price, quantity) VALUES ('"+req.body.email+"', 'Jacket', 58.99, 1);";
connection.query(sql, function (err, result, fields) {
  if (err) throw err;
  console.log(result);
  });

    connection.end();
});

// app.post('/cart', (req, res) => {
//   console.log('Working get');

//   var connection = mysql.createConnection ({
//   host: 'ab3-database.cluster-ccezr4etloks.us-east-1.rds.amazonaws.com',
//   user: 'admin',
//   password: 'Redshift123',
//   database: 'prestashop'
//   });

// connection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }});

// console.log(req.body);
// console.log(req.body.email);
// var sql = "SELECT * FROM cart WHERE username='"+req.body.email+"';";
// connection.query(sql, function (err, result, fields) {
//   if (err) throw err;
//   console.log(result);
//   res.send('Done Reading');
//   });

//     connection.end();
// });

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
