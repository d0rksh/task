const { getDB } = require("../Db/db");
const {validationResult} = require("express-validator");
const {hashSync,compareSync} = require('bcrypt')
const {sign} = require('jsonwebtoken')

const signupController = async (req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({
            status:400,
            data:error.array()[0].msg
        })
    }
    const {email,password,role} = req.body;
    const hashedPassword = hashSync(password,10);
    const query = `INSERT INTO users(email,password,role) VALUES(?,?,?)`
    console.log(getDB())
    const [rows,_] = await getDB().query(query,[email,hashedPassword,role]);
    res.json({status:'success',data:'user has been created please login'});
}

const loginController = async (req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({
            status:400,
            data:error.array()[0].msg
        })
    }
    const {email,password} = req.body;
    const query = `SELECT * FROM users WHERE email=?`
    const [user,_] = await getDB().query(query,[email]);
    if(user.length>0){
           const usr = user[0];
           if(compareSync(password,usr.password)){
            const jwt = sign({id:usr.id,role:usr.role,email:usr.email},'admin')
            res.json({status:'success',data:jwt});
           }else{
            res.status(400).json({status:'failed',data:'user not found'});
           }
    }else{
        res.status(400).json({status:'failed',data:'user not found'});
    }

}

module.exports = {signupController,loginController}