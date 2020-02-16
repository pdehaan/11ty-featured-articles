# 11ty-featured-articles

Using shortcodes and collections to discover related and featured posts.

## WHY

1. You want to display a list of all collection posts on an archive page.
2. You want to show related content (from a collection) on a specific page.
3. You want to highlight featured articles on an archive or post page.

## HOW

Most of the hard work is done by setting up custom collections in your [.eleventy.js config file](.eleventy.js):

```js
// ##### .eleventy.js snippet #####
eleventyConfig.addCollection("eleventy:nunjucks", collection =>
  collection.getFilteredByTags("eleventy", "nunjucks").reverse()
);
```

First we're creating a custom collection, unfortunately named "eleventy:nunjucks" (and then reversing the default order so we get newest posts at the front of the array).

Next, we create a custom <em>shortcode</em> which we can embed in a page to loop over a specified collection and display an optional header, list the related pages, and optionally filter out a specified URL. In our .eleventy.js file we can add the following:

```js
// ##### .eleventy.js snippet #####
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
```

Our shortcode expects four parameters:

- `collection` {Array} &mdash; an Eleventy collection to loop over and optionally filter.
- `title` {string} &mdash; an optional title to display if there are any pages found in the collection.
- `filterUrl` {string} &mdash; an optional URL slug to filter from the collection array. This is useful if you don't want to display a link to a related article if the link is to the current page.
- `cls` {string} &mdash; an optional CSS class to add to the `<section>` wrapper element (to make it easier to add any CSS styling).

Looking at the code, we first filter out the `filterUrl` so it gets removed from the collection. If the resulting collection has no items left, we return early instead of returning unnecessary HTML markup.
Next, we loop over the remaining items in the collection, and create `<li>` list items with links to the page's `url`, and the page's front matter `title` value.
Then we wrap the specified `title` in an `<h2>` tag (if the title was defined), and finally return the HTML markup wrapped inside some `<section>` and `<ul>` tags.

In order to use the custom `related` shortcode, we can add the following code to our [Nunjucks templates](src/posts/post-3-nunjucks.njk):

```njk
{% related title="Eleventy + Nunjucks posts",
    collection=collections["eleventy:nunjucks"],
    filterUrl=page.url %}
```

We set our optional `title` argument with a descriptive string, specify our `collection` to the custom `collections["eleventy:nunjucks"]` collection we specified in our .eleventy.js config file, and then pass the `filterUrl` for the current page so we don't appear as a related article on the current page.

Since that code can be a bit repetitive when used in various posts, you could migrate it to an include in your [src/_includes](src/_includes/related-eleventy-data.njk) folder.
Then, instead of using the `{% related collection=collections["eleventy:nunjucks"], ... %}` in multiple places, you can use `{%- include "related-eleventy-nunjucks.njk" -%}`.

If you don't want to do any filtering, you can use the same `{% related %}` shortcode on your archive pages to display all posts from a specific collection, as seen in [src/posts/index.njk](src/posts/index.njk):

```njk
{# 1. Display all posts from the "eleventy" collection. #}
{% related title="All posts",
    collection=collections["eleventy"] | reverse %}

{# 2. Display the 5 most recent posts in the "eleventy" collection. #}
{% related title="Last 5 posts",
    collection=collections["eleventy"] | reverse | batch(5) | first %}
```

The first shortcode displays all posts from the "eleventy" collection (which are set automatically when using the "eleventy" tag in a template), and reverses the order so newer articles appear first.

The second shortcode displays the 5 most recent posts from the "eleventy" collection, by reversing the default (ascending) order, batching the posts into groups of 5, and then returning the first item in the batch.

---

The featured blog posts use a similar approach. In [src/index.njk](src/index.njk), we have the following code which extracts featured posts using a custom "eleventy:featured" collection, or a custom "featured" filter:

```njk
{# 1. Loop over items in our custom "eleventy:featured" collection. #}
{% related title="Featured posts (via collection)",
    collection=collections["eleventy:featured"],
    cls="featured" %}

{# 2. Loop over all items in the "eleventy" collection and use the custom "featured" filter to filter featured posts. #}
{% related title="Featured posts (via filter)",
    collection=collections["eleventy"] | featured | reverse,
    cls="featured" %}
```

Looking again at our [.eleventy.js](.eleventy.js) config file:

```js
// ##### .eleventy.js snippet #####

// Custom collection for featured content.
eleventyConfig.addCollection("eleventy:featured", collection =>
  collection
    .getFilteredByTags("eleventy")
    .filter(page => !!page.data.featured)
    .reverse()
);

// Custom filter for featured content.
eleventyConfig.addFilter("featured", (collection = []) =>
  collection.filter(page => !!page.data.featured)
);
```

The custom "eleventy:featured" collection is similar to the other custom collections we created earlier, with the exception that we're calling `.filter()` method to filter out pages that don't have a truthy `featured` key in the page's front-matter.

Similarly, the custom "featured" filter, accepts a collection and loops through each of the pages and removes any items that don't have a truthy `featured` key in the front-matter.

For an example of the `featured` front-matter, see [src/posts/post-3-nunjucks.njk](src/posts/post-3-nunjucks.njk)'s front-matter:

```yaml
---
title: Post 3 (Nunjucks)
tags:
  - blog
  - eleventy
  - nunjucks
featured: true
---
```
