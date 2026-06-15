module.exports = function (eleventyConfig) {
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
