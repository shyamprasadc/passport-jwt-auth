const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../config/index");
const passport = require("passport");

const userAuth = passport.authenticate("jwt", { session: false });

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }
  next();
};

const userRegister = async (userDetails, role, res) => {
  try {
    let usernameTaken = await validateUsername(userDetails.username);
    if (!usernameTaken) {
      return res.status(400).json({
        message: "Username already taken",
        success: false,
      });
    }
    let emailTaken = await validateEmail(userDetails.email);
    if (!emailTaken) {
      return res.status(400).json({
        message: "Email already taken",
        success: false,
      });
    }
    const password = await bcrypt.hash(userDetails.password, 12);
    const newUser = new User({
      ...userDetails,
      role,
      password,
    });
    await newUser.save();
    return res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      error: err.toString(),
      success: false,
      message: "Internal server error",
    });
  }
};

const userLogin = async (userCreds, role, res) => {
  try {
    let { username, password } = userCreds;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        message: "Username not fond. Invalid login credentials",
        success: false,
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: "Unauthorized login",
        success: false,
      });
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let token = jwt.sign(
        {
          _id: user._id,
          role: user.role,
          username: user.username,
          email: user.email,
        },
        SECRET,
        { expiresIn: "7 days" }
      );

      let result = {
        username: user.username,
        role: user.role,
        email: user.email,
        token: `Bearer ${token}`,
        expiresIn: 168,
      };
      return res.status(200).json({
        ...result,
        message: "logged in",
        success: true,
      });
    } else {
      return res.status(403).json({
        message: "Incorrect password",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err.toString(),
      success: false,
      message: "Internal server error",
    });
  }
};

const validateUsername = async (username) => {
  let user = await User.findOne({ username });
  return user ? false : true;
};

const validateEmail = async (email) => {
  let user = await User.findOne({ email });
  return user ? false : true;
};

const serializeUser = (user) => {
  return {
    _id: user._id,
    username: user.usename,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

module.exports = {
  userRegister,
  userLogin,
  userAuth,
  serializeUser,
  checkRole,
};
