// import Joi from "joi";


// const ageRule = (value,helper) => {
//     if(value < 18){
//         // return helper.message('Age must be at least 18')
//         return helper.error('any.invalid')
//     }

//     return value
// }


// export const SingUpSchema = {
//     body:Joi.object().keys({
//         username:Joi.string().alphanum().length(10).messages({
//             "string.alphanum":"Username must be alphanumeric should contain only a-z , A-Z and 0-9",
//             "string.base":"Username must be a string",
//             'string.length':'Username must be 10 characters long',
//             'any.required':'Username is required'
//         }), 
//         email:Joi.string().email({
//             tlds:{
//                 allow:['com'],
              // deny:['net','org','io']
//             },
           // minDomainSegments:2,
//             maxDomainSegments:2,
//             multiple:true,
           // separator:'#'
//         }), 
//         password:Joi.string()
//         .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
//         .messages({
//             'string.pattern.base':"Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character from  $!%*?&"
//         }), 
//         confirmPassword:Joi.string().valid(Joi.ref('password')) , 
//         phone:Joi.string(),
         // gender: Joi.string().valid('male', 'female'),
         // skills:Joi.array().ordered(Joi.string() , Joi.number() , Joi.string()) 
         //enums: Joi.string().valid('other').forbidden(),// bt5ly ly gowa l valid mamno3 y3dy 
         // skills:Joi.array().items( Joi.string() ).length(3),
         // skills:{
         //     name:Joi.string(),
         //     level:Joi.string().valid('beginner', 'intermediate', 'advanced')
         // },
         // bestSkill:Joi.string().valid(Joi.ref('skills.name')),
         // isBoolean  : Joi.boolean().truthy('yes').falsy('no').sensitive(),
         // less: Joi.date().less('now')
         // age:Joi.number().custom(ageRule)
//         min: Joi.number(),
//         max: Joi
//             .when('min', { 
//                 is: Joi.number().integer().greater(10), 
//                 then: Joi.number().greater( Joi.ref('min')) , 
//                 otherwise: Joi.number().integer().less(10)
//         })
//     })
    // .with('email' , 'password')
     // .options({presence:'required' })

// }
