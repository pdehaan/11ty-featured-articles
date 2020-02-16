module.exports = eleventyConfig => {
  // Custom filter for featured content.
  eleventyConfig.addFilter("featured", (collection = []) =>
    collection.filter(page => !!page.data.featured)
  );
  // Custom collection for featured content.
  eleventyConfig.addCollection("eleventy:featured", collection =>
    collection
      .getFilteredByTags("eleventy")
      .filter(page => !!page.data.featured)
      .reverse()
  );

  // Custom collections for related content...
  eleventyConfig.addCollection("eleventy:data", collection =>
    collection.getFilteredByTags("eleventy", "data").reverse()
  );
  eleventyConfig.addCollection("eleventy:filters", collection =>
    collection.getFilteredByTags("eleventy", "filters").reverse()
  );
  eleventyConfig.addCollection("eleventy:markdown", collection =>
    collection.getFilteredByTags("eleventy", "markdown").reverse()
  );
  eleventyConfig.addCollection("eleventy:nunjucks", collection =>
    collection.getFilteredByTags("eleventy", "nunjucks").reverse()
  );
  eleventyConfig.addCollection("eleventy:pagination", collection =>
    collection.getFilteredByTags("eleventy", "pagination").reverse()
  );

  /**
   * Finds all related posts in a collection, but filters out the current page.
   * Usage: `{% related title="Eleventy data posts", collection=collections["eleventy:data"], filterUrl=page.url %}`
   */
  eleventyConfig.addShortcode(
    "related",
    ({ collection = [], title = "", filterUrl = "", cls = "related" }) => {
      // Omit the current URL from the collection.
      collection = collection.filter(page => page.url !== filterUrl);
      // Exit early if no other pages in the specified collection.
      if (collection.length === 0) {
        return `<!-- No related content found for "${title}" -->`;
      }
      // Convert collection items to HTML markup.
      const innerHtml = collection
        .map(page => `<li><a href="${page.url}">${page.data.title}</a></li>`)
        .join("\n")
        .trim();
      if (title.length) title = `<h2>${title}</h2>`;
      return `<section class="${cls}">${title}\n<ul>${innerHtml}</ul></section>`;
    }
  );

  return {
    dir: {
      input: "src",
      output: "www"
    }
  };
};
