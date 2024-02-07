import express from "express";
import { PORT, MONGOURL } from "./config.js";
import mongoose from "mongoose";
import { Register } from "./model/userModel.js";
import bcrypt from "bcryptjs";

const app = express();

app.use(express.json());

const router = express.Router();

mongoose
  .connect(MONGOURL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("DB Not connected", err.message);
  });

app.get("/", (req, res) => {
  console.log("Hello from /");
});

// New user Registeration
app.post("/register", async (req, res) => {
  try {
    const { name, houseNo, block, mobileNo, password, confirmPassword } =
      req.body;
    if (
      !name ||
      !houseNo ||
      !block ||
      !mobileNo ||
      !password ||
      !confirmPassword
    ) {
      res.status(412).send({ message: "Send correct Details" });
    }

    const userExist = await Register.findOne({ mobileNo: mobileNo });

    if (userExist) {
      return res.status(404).send({ message: "Mobile No. Already Exist" });
    } else if (password !== confirmPassword) {
      return res.status(404).send({ message: "Password Not Matching" });
    }

    const newUser = new Register({
      name: name,
      houseNo: houseNo,
      block: block,
      mobileNo: mobileNo,
      password: password,
      confirmPassword: confirmPassword,
    });

    const isRegistered = await newUser.save();
    if (isRegistered) res.status(201).send({ message: "User Created" });
  } catch (error) {
    console.log(error.message);
    res.status(400).send({ message: error.message });
  }
});

// Show All users
app.get("/users", async (req, res) => {
  try {
    const users = await Register.find({});
    res.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ message: err.message });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { mobileNo, password } = req.body;

    if (!mobileNo || !password)
      return res.status(400).send({ message: "Please fill the data" });

    const userLogin = await Register.findOne({ mobileNo: mobileNo });
    console.log(userLogin)

    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);

      const token = await userLogin.generateToken()
      if (!isMatch) {
        res.status(400).send({ message: "Error, not matched" });
      } else {
        res.status(200).send({ message: "SignIn Successfully" });
      }
    } else {
      res.status(400).send({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.log(err);
  }
});
