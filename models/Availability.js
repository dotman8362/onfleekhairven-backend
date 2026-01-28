import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  unavailableDates: {
    type: [String],
    default: [],
  },
});

export default mongoose.model("Availability", availabilitySchema);
