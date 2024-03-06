const jwt = require("jsonwebtoken");
//verify the token as middleware
module.exports = (req, res, next) => {
    const token = req.header("x-access-token");
    if(!token) {
        return res.status(401).json("Access Denied No Token Provided");
    }
    try {
        const verified = jwt.verify(token, process.env.VOLUNTEER_SERVER_SECRET);
        req.user = verified;
        next();
    } catch(err) {
        res.status(400).json("Invalid Token");
    }
}