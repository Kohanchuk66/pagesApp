import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  lastName: String,
  firstName: String,
  city: String,
  avatar: String,
  email: {
    type: String,
    unique: true,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  confirmed: Boolean,
});

UserSchema.pre('save', async function (next: mongoose.HookNextFunction) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashed = await bcrypt.hash(this['password'], 10);
    this['password'] = hashed;
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.correctPassword = async function (candidatePass, userPass) {
  return await bcrypt.compare(candidatePass, userPass);
};
