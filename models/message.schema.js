import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
