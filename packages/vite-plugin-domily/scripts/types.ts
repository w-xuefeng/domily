import path from "path";

const tsconfig = path.resolve(import.meta.dir, "..", "tsconfig.json");
const outdir = path.resolve(import.meta.dir, "..", "lib");

await Bun.$`tsc -b ${tsconfig}`;

const injectTypes = async () => {
  const injectContent = `/// <reference path="./domily.d.ts" />`;
  const typeFile = path.resolve(outdir, "types", "index.d.ts");
  const originContent = await Bun.file(typeFile).text();
  await Bun.write(typeFile, `${injectContent}\n${originContent}`);
};
await injectTypes();
