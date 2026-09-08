module.exports = {
  tags: ["note"],
  layout: "note.njk",
  eleventyComputed: {
    // Unpublished stubs have no PDF downloaded yet, so their pages would only
    // offer a dead link. Keep them out of the built site until published.
    permalink: (data) => (data.published === false ? false : data.permalink),
  },
};
