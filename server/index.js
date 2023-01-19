const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./Routers/auth');
const createQuestionrouter = require('./Routers/questions');
const { createDB, setDB } = require('./Db/db');
const jwtChecker = require('./utils');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(router)
app.use(jwtChecker)
app.use(createQuestionrouter)
createDB().then(db=>{
    setDB(db)
    app.listen(8080, () => {
        console.log('Listening on port *:8080');
    })
}).catch(err => {
    console.log(err);
    process.exit(1);
})