import { Glob } from "bun";

const outPath = "./patchouli_books/research_journal/en_us/entries";
const inPath = "./scripts/research_journal";

const glob = new Glob("**/*.md");

for (let filePath of glob.scanSync(inPath)) {
  try {
    const content = await Bun.file(`${inPath}/${filePath}`)
      .text()
      .catch(() => null);
    
    
    const data = {
      name: "Torn Page #1 (Nether)",
      icon: "minecraft:writable_book",
      category: "patchouli:torn_journal_entries",
      advancement: "cobbleblock:page_1_nether",
      sortnum: 0,
      pages: [
        {
          type: "patchouli:text",
          text: "  $(k)Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla egestas, enim et molestie dignissim, mauris ligula vehicula ex, eu laoreet nibh dui eget lacus. Fusce nisl arcu, tincidunt vel viverra at, consequat aliquet erat. Proin finibus a orci sit amet molestie. Maecenas facilisis eleifend neque vel imperdiet. Pellentesque cursus dictum erat eget rutrum. Pellentesque maximus erat ac mi efficitur ornare. Quisque in purus condimentum, suscipit nisi nec, egestas diam. In tincidunt risus nec leo imperdiet aliquam. Integer nec augue in eros efficitur luctus tincidunt et dolor. Pellentesque feugiat ultricies leo, aliquet mattis ex scelerisque eu. Vestibulum pellentesque, mi eu facilisis euismod, lectus erat fermentum enim, eu porttitor justo lectus ac enim. Donec sed pharetra magna, id lobortis ipsum.$()",
        },
      ],
    };

    filePath = filePath.replace(".md", ".json");
    const json = JSON.stringify(data, undefined, 2);
    await Bun.write(`${outPath}/${filePath}`, json);
    console.log(`Modified file: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}
