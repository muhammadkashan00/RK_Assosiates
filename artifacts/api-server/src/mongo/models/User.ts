// @ts-nocheck
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    lastLogin: { type: Date },
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true },
);

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 12);
};

userSchema.virtual("isLocked").get(function () {
  return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
