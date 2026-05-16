import jwt from "jsonwebtoken";

const authenticateUser = (req, res, next) => {

    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            let error = new Error("Unauthorized: Please log in to access this resource");
            error.status = 401;
            return next(error);
        }
        jwt.verify(token, process.env.JWTSECERET, (err, decodedToken) => {
            if (err) {
                let error = new Error("Unauthorized: Invalid token");
                error.status = 401;
                return next(error);
            }
            req.user = decodedToken; 
            next();
        });
    } catch (error) {
        next(error);
    }

}
export default authenticateUser