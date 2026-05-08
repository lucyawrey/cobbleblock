import { Glob } from "bun";

const outPath = "./patchouli_books/research_journal/en_us/entries";
const inPath = "./scripts/research_journal";

const glob = new Glob("**/*.md");

for (let filePath of glob.scanSync(inPath)) {
  try {
    const content = await Bun.file(`${inPath}/${filePath}`)
      .text()
      .catch(() => null);

    let data: Record<string, any> = { pages: [] };
    let inPropertyBlock = false;
    let page = "";

    let remainder = Bun.markdown.render(content || "", {
      heading: (text) => {
        data.name = text;
        return "";
      },
      hr: () => {
        inPropertyBlock = !inPropertyBlock;
        return "";
      },
      paragraph: (text) => {
        if (inPropertyBlock) {
          const [key, value] = text.split("=").map((part) => part.trim());
          if (key && value) {
            data[key] = value;
          }
        } else {
          page += "  " + text + "$(br)";
        }
        return "";
      },
      listItem: (text) => {
        page += " - " + text + "$(br)";
        return "";
      },
    });

    // Flush any remaining page content
    if (page) {
      page = page.trim().replace(/\$\(br\)$/, ""); // Remove trailing line breaks
      data.pages.push({ type: "patchouli:text", text: page });
    }

    filePath = filePath.replace(".md", ".json");
    let json = JSON.stringify(data, null, 2);
    await Bun.write(`${outPath}/${filePath}`, json);
    console.log(`Modified file: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}
