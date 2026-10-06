import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  FITNESS_GOALS,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
} from '../../../shared/accountRules.js';

const BCRYPT_ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: NAME_MIN_LENGTH,
      maxlength: NAME_MAX_LENGTH,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      required: true,
      default: 'local',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    heightCm: {
      type: Number,
      min: HEIGHT_CM_MIN,
      max: HEIGHT_CM_MAX,
    },
    weightKg: {
      type: Number,
      min: WEIGHT_KG_MIN,
      max: WEIGHT_KG_MAX,
    },
    fitnessGoal: {
      type: String,
      enum: [...FITNESS_GOALS, null],
    },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
};

userSchema.methods.verifyPassword = async function verifyPassword(plainPassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    username: this.username,
    authProvider: this.authProvider,
    heightCm: this.heightCm ?? null,
    weightKg: this.weightKg ?? null,
    fitnessGoal: this.fitnessGoal ?? '',
  };
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    const safe = {
      id: ret._id.toString(),
      name: ret.name,
      email: ret.email,
      username: ret.username,
      authProvider: ret.authProvider,
      heightCm: ret.heightCm ?? null,
      weightKg: ret.weightKg ?? null,
      fitnessGoal: ret.fitnessGoal ?? '',
    };
    return safe;
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
