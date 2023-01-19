const mysql = require('mysql2/promise');
var db = null;

const createDB = ()=>{
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'task'
      }
  )
}

const setDB = (database)=>{
    db = database;
}

const getDB = ()=>{
    return db;
}
module.exports = {createDB, setDB, getDB}