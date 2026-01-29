// models/BlockedMonth.js
import mongoose from "mongoose";

const blockedMonthSchema = new mongoose.Schema({
  month: {
    type: Number, // 0 = Jan, 11 = Dec
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, { timestamps: true });

blockedMonthSchema.index({ month: 1, year: 1 }, { unique: true });

export default mongoose.model("BlockedMonth", blockedMonthSchema);
