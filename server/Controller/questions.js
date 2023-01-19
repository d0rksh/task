const calculator = require('../calc');
const {validationResult} = require("express-validator");
const { getDB } = require('../Db/db');

const createQuestion = async (req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({
            status:400,
            data:error.array()[0].msg
        })
    }
     console.log(req.body);
     var {left,operator,right} = req.body
     var cright = calculator[right]()
     console.log('right',cright);
     var coperator = calculator[operator](cright)
     console.log('operator',coperator);
     var cleft = calculator[left](coperator)
     console.log('left',cleft)
     const query = `INSERT INTO questions(question,answer) VALUES(?,?)`
     const question = `${left} ( ${operator} ) ${right}`
     const [row,_] = await getDB().query(query,[question,cleft])
     res.json({status:'success',data:'question has been created'})

}

const getQuestions = async (req,res)=>{
    const query = `SELECT *,(SELECT
        answers.my_answer
        from answers WHERE answers.question_id = questions.id) as status FROM questions;`
    const [row,_] = await getDB().query(query)
    const output = []
    row.forEach(element=>{
        output.push({
            id:element.id,
            question:element.question,
            status: element.status === null? 'NOT ANSWERED': element.status === element.answer? 'CORRECT': 'WRONG',
       })
    })
    res.json({status:'success',data:output})

}

const answerQuestion = async (req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({
            status:400,
            data:error.array()[0].msg
        })
    }
    const user_id = req.user.id
    const {question_id,answer} = req.body
    const query = `INSERT INTO answers(question_id,my_answer,user_id) VALUES(?,?,?)`
    const [row,_] = await getDB().query(query,[question_id,answer,user_id])
    res.json({status:'success',data:'success'})
}

module.exports = {createQuestion,getQuestions,answerQuestion}