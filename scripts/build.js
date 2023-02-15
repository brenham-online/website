import sharp from "sharp";
import * as path from "path";
import fs from "fs-extra";
import postcss from "postcss";
import postcssPreset from "postcss-preset-env";
import cssnanoPlugin from "cssnano";
import svgo from "svgo";
import minifyHtml from "@minify-html/node";

console.log("Copying assets...");
await fs.remove("dist");
await fs.mkdir("dist");
await fs.copy("assets", "dist/assets");
await fs.copy("index.html", "dist/index.html");
await fs.copy("favicon.svg", "dist/favicon.svg");

console.log("Converting favicon...");
await sharp("favicon.svg").toFile("dist/favicon.ico");
const faviconSvg = await fs.readFile("favicon.svg", { encoding: "utf-8" });
const optimizedSvg = svgo.optimize(faviconSvg, {
  path: "favicon.svg",
  multipass: true,
}).data;
await fs.writeFile("dist/favicon.svg", optimizedSvg);
console.log("Converting images...");
const images = ["courthouse.jpg"];
for (const image of images) {
  console.log(` - ${image}`);
  const from = `assets/images/${image}`;
  await sharp(from).toFile(`dist/assets/images/${path.parse(image).name}.jpg`);
  await sharp(from).toFile(`dist/assets/images/${path.parse(image).name}.webp`);
  await sharp(from).toFile(`dist/assets/images/${path.parse(image).name}.avif`);
}
console.log("Running PostCSS...");
const postcssInstance = postcss([postcssPreset(), cssnanoPlugin()]);
const stylesheets = [
  "common.css",
  "content.css",
  "landing.css",
  "normalize.css",
];
for (const stylesheet of stylesheets) {
  console.log(` - ${stylesheet}`);
  const from = `assets/css/${stylesheet}`;
  const to = `dist/${from}`;
  const css = await fs.readFile(from, { encoding: "utf-8" });
  const processed = await postcssInstance.process(css, {
    from,
    to,
  });
  await fs.writeFile(`dist/assets/css/${stylesheet}`, processed.css);
}
console.log("Minifying HTML...");
const pages = ["clubs.html", "data.html", "index.html", "nonprofits.html"];
for (const page of pages) {
  console.log(` - ${page}`);
  const from = page;
  const to = `dist/${from}`;
  const html = await fs.readFile(from);
  const minified = minifyHtml.minify(html, {});
  await fs.writeFile(to, minified);
}
