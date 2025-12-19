import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: "",
      maxlength: 512,
    },
    ip: {
      type: String,
      default: "",
      maxlength: 64,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedReason: {
      type: String,
      default: "",
      maxlength: 256,
    },
  },
  {
    timestamps: true,
  }
);

const sessionModel =
  mongoose.models.session || mongoose.model("session", sessionSchema);

export default sessionModel;



