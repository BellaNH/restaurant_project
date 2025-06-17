import jwt from "jsonwebtoken"

const authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = 
  authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1]:null

  if (!token) {
    return res.status(401).json({ success: false, message: "Access not authorized" });
  }

  try {
    const decodedtoken = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decodedtoken.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token verification failed" });
  }
};

export default authUser;
