import jwt from 'jsonwebtoken'


// Generate JWT token
export const generateToken = ({
    publicClaims,
    registeredClaims,
    secretKey=process.env.JWT_SECRET_KEY
}) => {
    return jwt.sign(publicClaims, secretKey,registeredClaims)
}


// Verify JWT token
export const verifyToken = ({token, secretKey=process.env.JWT_SECRET_KEY}) => {
    return jwt.verify(token, secretKey)
}   