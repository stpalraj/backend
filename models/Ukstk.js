import mongoose from "mongoose";

const uksTksSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  id: {
    type: String,
    // required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  cardNumber: {
    type: Number,
    description:
      "A number representing the card number associated with the todo",
    required: true,
  },
  phone: {
    type: String,
    description:
      "A string representing the phone number associated with the todo",
  },
  ukstks: {
    type: String,
    description: "unique key for card holder",
  },
  cardSettled: {
    type: Boolean,
    description: "Indicates whether the card has been settled",
    default: false,
  },
  cardSettleDate: {
    type: Date,
    description: "The date when the card was settled",
  },
  cardGotPerson: {
    type: String,
    description: "Person who got the card",
  },
  cardPrinted: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    description: "Path to the image file associated with the todo",
  },
});

export default mongoose.model("UksTks", uksTksSchema);
