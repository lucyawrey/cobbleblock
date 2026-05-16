import { Glob } from "bun";

const glob = new Glob("**/*.json");
const path = "./config/paxi/datapacks/Cobbleblock/data/rctmod/mobs/trainers";

for (const filePath of glob.scanSync(path)) {
  try {
    const content = await Bun.file(`${path}/${filePath}`)
      .json()
      .catch(() => null);
    if (content?.optional === true && content?.requiredDefeats) {
      delete content.requiredDefeats;
      const json = JSON.stringify(content, undefined, 2);
      await Bun.write(`${path}/${filePath}`, json);
      console.log(`Modified file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}
