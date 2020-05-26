const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator");

// get profile corresponding user login

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["avatar", "name"]);
    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server Error");
  }
});

// create and update profile

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is require").not().isEmpty(),
      check("skills", "skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      status,
      skills,
      bio,
      githubusername,
      company,
      website,
      location,
      twitter,
      facebook,
      instagram,
      linkedin,
      youtube,
    } = req.body;
    profileTemp = {};
    if (status) profileTemp.status = status;
    if (skills)
      profileTemp.skills = skills.split(",").map((skill) => skill.trim());
    if (bio) profileTemp.bio = bio;
    if (githubusername) profileTemp.githubusername = githubusername;
    if (company) profileTemp.company = company;
    if (website) profileTemp.website = website;
    if (location) profileTemp.location = location;
    profileTemp.social = {};
    if (twitter) profileTemp.social.twitter = twitter;
    if (facebook) profileTemp.social.facebook = facebook;
    if (youtube) profileTemp.social.youtube = youtube;
    if (linkedin) profileTemp.social.linkedin = linkedin;
    if (instagram) profileTemp.social.instagram = instagram;
    profileTemp.user = req.user.id;
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileTemp },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(profileTemp);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      res.status(500).send("server Error");
    }
  }
);

// get all profiles
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["avatar", "name"]);
    if (!profiles) {
      return res.status(400).json("cant find any profiles");
    }
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
});

// get profile by id user
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["avatar", "name"]);
    if (!profile) {
      return res.status(400).json("no id exist");
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind == "ObjectId") return res.status(400).json("no id exist");
    res.status(500).send("server error");
  }
});

module.exports = router;
