const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post(
  "/",
  [
    check("email", "please insert a valid email").isEmail(),
    check("password", "password is required").exists(),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({ errors: error.array() });
    }

    const { password, email } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: "wrong email or password" }],
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: "wrong email or password" }],
        });
      }

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
