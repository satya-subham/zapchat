import jwt from "jsonwebtoken";
export const generateToken = (userId, res) => {
  const token = jwt.sign(
    {
      userId
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

    // Set the token in the response header
    res.cookie("token", token, {
      httpOnly: true,
        secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
        sameSite: "strict", // Helps prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  return token;
}