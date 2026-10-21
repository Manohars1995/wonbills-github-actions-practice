const AppVersion = require("../models/appversion");

const getAppVersion = async (req, res, next) => {
  const app = req.params.app;

  let config;
  try {
    config = await AppVersion.findOne({ app: app.toLowerCase() });
  } catch (err) {
    return next({ status: 500, message: `Fetching app version failed. ${err}` });
  }

  if (!config) {
    return next({ status: 404, message: `No version config found for app "${app}"` });
  }

  res.json({
    android: config.android,
    ios: config.ios,
  });
};

const getAllAppVersions = async (req, res, next) => {
  let configs;
  try {
    configs = await AppVersion.find({});
  } catch (err) {
    return next({ status: 500, message: `Fetching app versions failed. ${err}` });
  }

  res.json({
    message: "App versions fetched successfully",
    appVersions: configs,
  });
};

module.exports = { getAppVersion, getAllAppVersions };