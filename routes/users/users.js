const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

router.post(
  "/",
  [
    check("name", "name is required").not().isEmpty(),
    check("email", "please insert a valid email").isEmail(),
    check("password", "min 6 to 12 digits").isLength({ min: 6, max: 12 }),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({ errors: error.array() });
    }

    const { name, password, email } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          errors: [{ msg: "user already exist" }],
        });
      }

      const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

      user = new User({
        name,
        email,
        password,
        avatar,
      });
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: { id: user.id },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json(token);
        }
      );
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ errors: [{ msg: error.message }] });
    }
  }
);

module.exports = router;
