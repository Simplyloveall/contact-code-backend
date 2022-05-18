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
    phone: {
      type: String,
      unique: true,
    },
    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
        enum: ["Arizona", "Alabama"],
      },
      zipCode: {
        type: String,
      },
      country: {
        type: String,
      },
    },
    primaryChat: {
      primaryChatName: {
        type: String,
        enum: ["Text", "AndroidSMS", "IphoneSMS", "Whatsapp", "Telegram"],
      },
      primaryChatLink: {
        type: String,
      },
    },
    secondaryChat: {
      secondaryChatName: {
        type: String,
        enum: ["Text", "AndroidSMS", "IphoneSMS", "Whatsapp", "Telegram"],
      },
      secondaryChatLink: {
        type: String,
      },
    },
    primarySocial: {
      primarySocialName: {
        type: String,
        enum: ["Facebook", "Twitter", "Linked-in", "Twitch", "Discord"],
      },
      primarySocialLink: {
        type: String,
      },
    },
    secondarySocial: {
      secondarySocialName: {
        type: String,
        enum: ["Facebook", "Twitter", "Linked-in", "Twitch", "Discord"],
      },
      secondarySocialLink: {
        type: String,
      },
    },
    profilePicture: {
      type: String,
      default:
        "https://gamma.creativecirclecdn.com/liherald/original/20200916-113608-blank-profile-picture.png.jpg",
    },
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
