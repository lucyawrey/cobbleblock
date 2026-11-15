import { Glob } from "bun";

const glob = new Glob("**/*.json");
const path = "./data";
const stubJson = JSON.stringify({
    "enabled": false
}, undefined, 2);

for (const filePath of glob.scanSync(path)) {
  try {
    await Bun.write(`${path}/${filePath}`, stubJson);
    console.log(`Modified file: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}
