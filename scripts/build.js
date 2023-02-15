import sharp from "sharp";
import * as path from "path";
import fs from "fs-extra";
import postcss from "postcss";
import postcssPreset from "postcss-preset-env";

await fs.remove("dist");
await fs.mkdir("dist");
await fs.copy("assets", "dist/assets");
await fs.copy("index.html", "dist/index.html");
const images = ["courthouse.jpg"];
for (const image of images) {
  const from = `assets/images/${image}`;
  await sharp(from).toFile(`dist/assets/images/${path.parse(image).name}.jpg`);
  await sharp(from).toFile(`dist/assets/images/${path.parse(image).name}.webp`);
  await sharp(from).toFile(`dist/assets/images/${path.parse(image).name}.avif`);
}
const postcssInstance = postcss([postcssPreset()]);
// Skip normalize because prefixes are intentioanl
const stylesheets = ["common.css", "landing.css"];
for (const stylesheet of stylesheets) {
  const from = `assets/css/${stylesheet}`;
  const to = `dist/${from}`;
  const css = await fs.readFile(from, { encoding: "utf-8" });
  const processed = await postcssInstance.process(css, {
    from,
    to,
  });
  await fs.writeFile(`dist/assets/css/${stylesheet}`, processed.css);
}
