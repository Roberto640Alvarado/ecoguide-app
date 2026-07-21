const { transformFileSync } = require("@swc/core");
const files = process.argv.slice(2);
let hadError = false;
for (const f of files) {
  try {
    transformFileSync(f, {
      jsc: {
        parser: { syntax: "typescript", tsx: f.endsWith(".tsx") },
        target: "es2020",
      },
      module: { type: "commonjs" },
    });
    console.log("OK   ", f);
  } catch (e) {
    hadError = true;
    console.log("FAIL ", f);
    console.log(e.message);
  }
}
process.exit(hadError ? 1 : 0);
