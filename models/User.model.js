const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    contactCode: {
      type: String,
      required: true,
      maxlength: 10,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    // profilePicture: {
    //   type: String,
    //   default:
    //     "https://gamma.creativecirclecdn.com/liherald/original/20200916-113608-blank-profile-picture.png.jpg",
    // },
    // status: {
    //   type: String,
    // },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
      },
    ],
    friendRequest: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
      },
    ],
    chatRooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "ChatRoom",
        unique: true,
      },
    ],
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
