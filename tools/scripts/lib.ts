export async function pullCsv(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: "get",
      headers: {
        "content-type": "text/csv;charset=UTF-8",
      },
    });
    if (res.status === 200) {
      return await res.text();
    } else {
      console.error(`Error code ${res.status}.`);
      process.exit(-1);
    }
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
}
