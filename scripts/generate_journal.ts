import { Glob } from "bun";

const outPath = "./patchouli_books/research_journal/en_us/entries";
const inPath = "./scripts/research_journal";

const glob = new Glob("**/*.md");
const br = "$(br)";
const f = "$()";
const l = "$(l)";
const o = "$(o)";
const m = "$(m)";
const indent = "  ";
const firstPageCharLimit = 390;
const subsequentPageCharLimit = 485;
const regex = /\$\(br\)$/;

for (let filePath of glob.scanSync(inPath)) {
  try {
    const content = await Bun.file(`${inPath}/${filePath}`)
      .text()
      .catch(() => null);

    let data: Record<string, any> = {};
    let inPropertyBlock = false;
    let body = "";
    let category = "";

    Bun.markdown.render(content || "", {
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
          for (let line of text.split("\n")) {
            const [key, value] = line.split("=").map((part) => part.trim());
            if (key && value) {
              if (key === "order") {
                data.sortnum = parseInt(value);
              } else if (key === "category") {
                data.category = "patchouli:" + value;
                category = value;
              } else {
                data[key] = value;
              }
            }
          }
        } else {
          body += indent + text + br;
        }
        return "";
      },
      listItem: (text) => {
        body += " - " + text + br;
        return "";
      },
      strong: (text) => {
        return l + text + f;
      },
      emphasis: (text) => {
        return o + text + f;
      },
      strikethrough: (text) => {
        return m + text + f;
      },
      link: (text, meta) => {
        return `$(l:patchouli:${meta.href})${text}$()`;
      },
    });

    // Handle body
    if (body) {
      data.pages = [];
      let page = "";
      let first = true;
      for (let line of body.split(br)) {
        if (!line.trim()) continue; // Skip empty lines
        let charLimit = first ? firstPageCharLimit : subsequentPageCharLimit;
        if ((page + line).length > charLimit) {
          data.pages.push({
            type: "patchouli:text",
            text: page.replace(regex, ""),
          });
          first = false;
          page = line + br;
        } else {
          page += line + br;
        }
      }
      data.pages.push({
        type: "patchouli:text",
        text: page.replace(regex, ""),
      });
    }

    filePath = filePath.replace(".md", ".json");
    let json = JSON.stringify(data, null, 2);
    await Bun.write(`${outPath}/${filePath}`, json);
    console.log(`Modified file: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}
