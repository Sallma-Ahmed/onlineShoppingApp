const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require('express-validator');
const util = require("util");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Registration
router.post('/registerr',
  body('email').isEmail().withMessage('Please enter a valid email!'),
  body('name').isString().withMessage('Please enter a name').isLength({ min: 10, max: 20 }).withMessage("Name should be between (10-20) characters"),
  body('password').isLength({ min: 8, max: 15 }).withMessage('Password should be between (10-20) characters'),
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if email exists
      const query = util.promisify(conn.query).bind(conn);
      const checkEmailExists = await query("SELECT * FROM user WHERE email=?", [req.body.email]);

      if (checkEmailExists.length > 0) {
        return res.status(400).json({
          errors: [{ msg: "Email already exists!" }]
        });
      }

      // Prepare user data to save to DB
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        token: crypto.randomBytes(16).toString("hex"),
      };

      // Insert userData into DB
      await query("INSERT INTO user SET ?", userData);

      // Remove password from userData before sending response
      delete userData.password;

      res.status(200).json(userData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ err: err });
    }
  }
);

// Login
router.post("/login",
  body("email").isEmail().withMessage("Please enter a valid email!"),
  body("password").isLength({ min: 8, max: 15 }).withMessage("Password should be between (10-20) characters"),
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if email exists
      const query = util.promisify(conn.query).bind(conn);
      const user = await query("SELECT * FROM user WHERE email=?", [req.body.email]);
      if (user.length == 0) {
        return res.status(404).json({
          errors: [{ msg: "Email or password not found!" }]
        });
      }

      // Compare password
      const checkPassword = await bcrypt.compare(req.body.password, user[0].password);

      if (checkPassword) {
        // Remove password from user object before sending response
        delete user[0].password;
        res.status(200).json(user[0]);
      } else {
        return res.status(404).json({
          errors: [{ msg: "Email or password not found!" }]
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ err: err });
    }
  }
);

module.exports = router;
