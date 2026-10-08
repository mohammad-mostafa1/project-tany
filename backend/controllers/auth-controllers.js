const User = require("../models/user-model");
const deleteUploadedFile = require("../utils/delete-uploaded-file");

const generateToken = require("../utils/get-jwt");

const bcryptjs = require("bcryptjs");

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      // Role is never taken from the request body — signup always creates a customer.
      role: "customer",
      imageUrl: req.file?.filename,
    });

    user.password = undefined;

    const token = generateToken(user);
    res.status(201).json({
      status: "success",
      message: "Account created successfully",
      token,
      data: { user },
    });
  } catch (error) {
    if (req.file) {
      deleteUploadedFile("users", req.file.filename);
    }

    if (error.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "This email is already registered",
      });
    }

    res.status(400).json({
      status: "error",
      message: `Error in signup: ${error.message}`,
    });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and Password are required.",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const comparePasswords = await bcryptjs.compare(password, user.password);
    if (!comparePasswords) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    user.password = undefined;

    const token = generateToken(user);

    res.status(200).json({ status: "success", token, data: { user } });
  } catch (error) {
    res
      .status(400)
      .json({ status: "error", message: `Error in signin: ${error.message}` });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    res
      .status(400)
      .json({ status: "error", message: `Error in getMe: ${error.message}` });
  }
};

module.exports = { signup, signin, getMe };
