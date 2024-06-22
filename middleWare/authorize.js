const conn = require("../db/dbConnection");
const util = require("util");

// Middleware function to check if user is authorized to access a route(SRP),(OCP)
const authorized = async (req, res, next) => {
  const query = util.promisify(conn.query).bind(conn);
  const { token } = req.headers;

  try {
    const user = await query("SELECT * FROM user WHERE token = ?", [token]);

    if (user[0]) {
      next(); // User is authorized to access the route
    } else {
      res.status(403).json({ msg: "You are not authorized to access this route." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error." });
  }
};

module.exports = authorized;