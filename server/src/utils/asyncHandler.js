const asyncHandler = (func) =>{
    return function(req , res , next){
        Promise
        .resolve(func(req, res, next))
        .catch((err)=> next(err))
    }
}



const syncHandler = (func) => async (req ,res ,next) => {
    try{
        await func(req, res, next);
    }catch(err){
        res.status(err.code || 500).json({
            success : false,
            message : err.message
        })
    }
}

export {asyncHandler}
