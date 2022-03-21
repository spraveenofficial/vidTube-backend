import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    channelName: {
      type: String,
      required: [true, "Please add a channel name"],
      uniqueCaseInsensitive: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      uniqueCaseInsensitive: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    photoUrl: {
      type: String,
      default: "no-photo.png",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Must be six characters long"],
      select: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

UserSchema.index({ channelName: "text" });

UserSchema.virtual("subscribers", {
  ref: "Subscription",
  localField: "_id",
  foreignField: "channelId",
  justOne: false,
  count: true,
  // match: {  },
});

UserSchema.virtual("videos", {
  ref: "Video",
  localField: "_id",
  foreignField: "userId",
  justOne: false,
  count: true,
});

UserSchema.pre("find", function () {
  this.populate({ path: "subscribers"});
});

// Ecrypt Password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model("User", UserSchema);

export default userModel;
