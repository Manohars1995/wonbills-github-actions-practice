const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const platformVersionSchema = new Schema(
  {
    minimumVersion: { type: String, required: true },
    latestVersion: { type: String, required: true },
    storeUrl: { type: String, required: true },
  },
  { _id: false }
);

const appVersionSchema = new Schema(
  {
    app: { type: String, required: true, unique: true, lowercase: true },
    android: { type: platformVersionSchema, required: true },
    ios: { type: platformVersionSchema, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppVersion", appVersionSchema);