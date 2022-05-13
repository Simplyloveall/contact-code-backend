const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      unique: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      unique: true,
    },
    content: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Message = model("Message", messageSchema);

module.exports = Message;
