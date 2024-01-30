const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
    const token = req.header("x-access-token");
    if (!token) {
        return res.status(401).json({ error: "Access denied" });
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
    }
};

module.exports = adminAuth;
