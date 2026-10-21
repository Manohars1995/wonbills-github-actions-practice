require("dotenv").config();
const mongoose = require("mongoose");
const AppVersion = require("./models/appversion");

// ─────────────────────────────────────────────────────────────
// EDIT THIS LIST. To force an update, change minimumVersion here
// and run:  node seed-appversion.js
// ─────────────────────────────────────────────────────────────
const apps = [
  {
    app: "wonbills",
    android: {
      minimumVersion: "1.1.2",
      latestVersion: "1.1.2",
      storeUrl: "https://play.google.com/store/apps/details?id=com.nowitservices.wonbills",
    },
    ios: {
      minimumVersion: "1.1.2",
      latestVersion: "1.1.2",
      storeUrl: "https://apps.apple.com/in/app/won-bills/id6746782261",
    },
  },
];
// ─────────────────────────────────────────────────────────────

const run = async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL);
  console.log("Database connected");

  for (const entry of apps) {
    const saved = await AppVersion.findOneAndUpdate(
      { app: entry.app },
      entry,
      { new: true, upsert: true }
    );
    console.log(`Saved "${saved.app}":`, saved.toObject());
  }

  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});