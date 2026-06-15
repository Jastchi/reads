const markdownIt = require("markdown-it");
const texmath = require("markdown-it-texmath");
const katex = require("katex");

module.exports = function (eleventyConfig) {
  const md = markdownIt({ html: true }).use(texmath, {
    engine: katex,
    delimiters: "dollars",
  });
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  });

  eleventyConfig.addFilter("dateIso", (dateObj) => {
    return new Date(dateObj).toISOString().split("T")[0];
  });

  return {
    pathPrefix: "/reads/",
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
