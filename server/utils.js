const {verify} = require("jsonwebtoken")


const jwtChecker = (req,res,next)=>{
    const auth = req.headers.authorization
    if(auth){
        const splittedToken = auth.split(" ")
        if(splittedToken.length < 2 || splittedToken.length > 2){
            return res.json({status:'failed',data:'un-authenticated'})
        }else{
            const token = splittedToken[1]
            try{
                const secret = 'admin'
                const jwt = verify(token,secret)
                req.user = jwt
                return next()
            }catch(e){
                return res.json({status:'failed',data:'un-authenticated'})
            }
        }
    }else{
        return res.json({status:'failed',data:'un-authenticated'})
    }


}

module.exports = jwtChecker