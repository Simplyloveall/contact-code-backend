const { Schema, model } = require("mongoose");

const chatRoomSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
        unique: true,
      },
    ],
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const ChatRoom = model("ChatRoom", chatRoomSchema);

module.exports = ChatRoom;
