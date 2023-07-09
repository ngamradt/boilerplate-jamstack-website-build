const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require("markdown-it-attrs");

module.exports = function(eleventyConfig) {

    //Create a "Featured Post" collection

    function featured(post) {

        return post.data.featured;

    }

    function featuredPost(collection) {

        return collection.getAll().filter(featured);

    }

    eleventyConfig.addCollection("featuredPost",featuredPost);

    //Add Markdown Anchor Logic
    const mdIt = markdownIt({ html: true });

    //Set Up Markdown Options
    const markdownItAnchorOptions = { permalink: false }

    const markdownLib = mdIt.use(markdownItAnchor,markdownItAnchorOptions).use(markdownItAttrs);

    eleventyConfig.setLibrary("md", markdownLib);

    return {

        dir: {
          includes: "_includes",
          data: "_data"
       },
       templateFormats: ["gif", "html", "jpg", "liquid", "md"],
       htmlTemplateEngine: "liquid",
       markdownTemplateEngine: "liquid"

    }

};