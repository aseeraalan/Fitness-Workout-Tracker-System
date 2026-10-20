import mongoose from 'mongoose';
import {
  EXERCISE_MAX_COUNT,
  EXERCISE_NAME_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  REPS_MAX,
  REPS_MIN,
  SETS_MAX_COUNT,
  SET_WEIGHT_KG_MAX,
  SET_WEIGHT_KG_MIN,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  utcToDateString,
} from '../../../shared/workoutRules.js';

const setSchema = new mongoose.Schema(
  {
    reps: {
      type: Number,
      required: true,
      min: REPS_MIN,
      max: REPS_MAX,
    },
    weightKg: {
      type: Number,
      required: true,
      min: SET_WEIGHT_KG_MIN,
      max: SET_WEIGHT_KG_MAX,
    },
  },
  { _id: false }
);

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: EXERCISE_NAME_MAX_LENGTH,
    },
    sets: {
      type: [setSchema],
      required: true,
      validate: [(sets) => sets.length >= 1 && sets.length <= SETS_MAX_COUNT, 'Invalid set count.'],
    },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
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
    exercises: {
      type: [exerciseSchema],
      required: true,
      validate: [
        (exercises) => exercises.length >= 1 && exercises.length <= EXERCISE_MAX_COUNT,
        'Invalid exercise count.',
      ],
    },
  },
  { timestamps: true }
);

workoutSchema.index({ owner: 1, date: -1, createdAt: -1 });

workoutSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    date: utcToDateString(this.date),
    title: this.title,
    notes: this.notes || '',
    exercises: this.exercises.map((exercise) => ({
      name: exercise.name,
      sets: exercise.sets.map((set) => ({
        reps: set.reps,
        weightKg: set.weightKg,
      })),
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema);
