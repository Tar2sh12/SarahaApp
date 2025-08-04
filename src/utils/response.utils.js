// utils/response.js
export const successResponse=(res, data, message = "Success", statusCode = 200) =>{
    //in success login case only
    if(data.token){
        return res.status(statusCode).json({
            statusCode,
            message,
            data:data.token,
            user:data.user
        })
    }
    return res.status(statusCode).json({
        statusCode,
        message,
        data
    });
}