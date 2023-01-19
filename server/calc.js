function calc(args,v) {
    switch(args.type){
        case 'add':
           return v + args.result
        case 'times':
           return v * args.result
        case 'minus':
            return v - args.result
        case 'minus':
                return Math.floor(v /  args.result)
        default:
           return 0
     }
}

const calculator = {

    one: (args)=>{
        if(typeof args === 'undefined'){
             return 1
        }else{
             console.log()
             const result = calc(args,1)
             return result
        }
    },
    two:(args)=>{
        if(typeof args === 'undefined'){
             return 2
        }else{
             const result = calc(args,2)

             return result
        }
    }
    ,three:(args)=>{
        if(typeof args === 'undefined'){
             return 3
        }else{
             const result = calc(args,3)

             return result
        }
    }
    ,four:(args)=>{
        if(typeof args === 'undefined'){
             return 4
        }else{
             const result = calc(args,4)

             return result
        }
    }
    ,five:(args)=>{
        if(typeof args === 'undefined'){
             return 5
        }else{
             const result = calc(args,5)

             return result
        }
    }
    ,six:(args)=>{
        if(typeof args === 'undefined'){
             return 6
        }else{
             const result = calc(args,6)

             return result
        }
    }
    ,seven:(args)=>{
        if(typeof args === 'undefined'){
             return 7
        }else{
             const result = calc(args,7)

             return result
        }
    }
    ,eight:(args)=>{
        if(typeof args === 'undefined'){
             return 8
        }else{
             const result = calc(args,8)

             return result
        }
    }
    ,nine:(args)=>{
        if(typeof args === 'undefined'){
             return 9
        }else{
             const result = calc(args,9)

             return result
        }
    }


    ,add:(callback)=>{
        const result = callback
        return {
            type:'add',
            result:result
        }
    }
    ,times:(callback)=>{
        const result = callback
        return {
            type:'times',
            result:result
        }
    },
    minus :(callback)=>{
        const result = callback
        return {
            type:'minus',
            result:result
        }
    },
    divided_by:(callback)=>{
        const result = callback
        return {
            type:'divide',
            result:result
        }
    }


}

module.exports = calculator



