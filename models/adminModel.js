import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email is already taken"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password length should be greater than 8 character"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone no is required"],
    },
    profilePic: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    answer: {
      type: String,
      required: [true, "answer is required"],
    },
    role: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

//haash function
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

//compare function
adminSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//JWT token
adminSchema.methods.generateToken = function () {
  return JWT.sign({ adminId: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

export const adminModel = mongoose.model("admin", adminSchema);
export default adminModel;

