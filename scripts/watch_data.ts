import { watch } from "node:fs";
import path, { join } from "node:path";

// Destination directory for the datapack, will need to be changed to match the actual datapack location in the Minecraft directory
const datapackDest =
  "/Applications/MultiMC.app/Data/instances/1.21.1/.minecraft/resourcepacks/Cobbleblock";
const datapackSource = path.resolve("./config/paxi/datapacks/Cobbleblock");
const patchouliDest = "/Applications/MultiMC.app/Data/instances/1.21.1/.minecraft/patchouli_books";
const patchouliSource = path.resolve("./patchouli_books");
const kubejsDest = "/Applications/MultiMC.app/Data/instances/1.21.1/.minecraft/kubejs";
const kubejsSource = path.resolve("./kubejs");

buildWatch(datapackSource, datapackDest);
buildWatch(patchouliSource, patchouliDest);
buildWatch(kubejsSource, kubejsDest);

function buildWatch(source: string, dest: string) {
  console.log(`Watching ${source} for changes...`);

  watch(source, { recursive: true }, async (event, filename) => {
    if (!filename) return;

    try {
      const sourcePath = join(source, filename);
      const destPath = join(dest, filename);

      if (event === "change" || event === "rename") {
        const file = Bun.file(sourcePath);
        if (await file.exists()) {
          await Bun.write(destPath, file);
          console.log(`Copied: ${filename}`);
        }
      }
    } catch (err) {
      console.error(`Error copying ${filename}:`, err);
    }
  });
}
