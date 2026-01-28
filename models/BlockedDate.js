import mongoose from "mongoose";

const blockedDateSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true, // prevents duplicate blocked dates
    },
  },
  { timestamps: true }
);

export default mongoose.model("BlockedDate", blockedDateSchema);
