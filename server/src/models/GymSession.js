import mongoose from 'mongoose';
import {
  NOTES_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  utcToDateString,
} from '../../../shared/workoutRules.js';

const gymSessionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: TITLE_MIN_LENGTH,
      maxlength: TITLE_MAX_LENGTH,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: NOTES_MAX_LENGTH,
      default: '',
    },
    startTime: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

gymSessionSchema.index({ owner: 1, date: 1, createdAt: 1 });

gymSessionSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    date: utcToDateString(this.date),
    title: this.title,
    notes: this.notes || '',
    startTime: this.startTime || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const GymSession = mongoose.models.GymSession || mongoose.model('GymSession', gymSessionSchema);
