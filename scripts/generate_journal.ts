import { Glob } from "bun";

const outPath = "./patchouli_books/research_journal/en_us/entries";
const inPath = "./scripts/research_journal";

const glob = new Glob("**/*.md");

for (let filePath of glob.scanSync(inPath)) {
  try {
    const content = await Bun.file(`${inPath}/${filePath}`)
      .text()
      .catch(() => null);
    let json = `{${Bun.markdown
      .render(content || "", {
        heading: (text, level) => {
          return `"name": "${text}",`;
        },
      })
      .replace(/,$/, "")}}`;
    console.log(json);

    filePath = filePath.replace(".md", ".json");
    json = JSON.stringify(JSON.parse(json), null, 2);
    await Bun.write(`${outPath}/${filePath}`, json);
    console.log(`Modified file: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}
