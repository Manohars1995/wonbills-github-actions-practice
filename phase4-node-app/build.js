const fs = require("node:fs");
const path = require("node:path");

const outputDir = path.join(__dirname, "dist");

fs.mkdirSync(outputDir, { recursive: true });

fs.copyFileSync(
  path.join(__dirname, "app.js"),
  path.join(outputDir, "app.js")
);

console.log("Production build completed successfully");