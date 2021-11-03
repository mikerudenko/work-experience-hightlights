const postcss = require("postcss");

module.exports = postcss.plugin("postcss-banner", function configure() {
    return function addFilename(css) {
        css.prepend(`/* ${css.source.input.file} */`);

        if (css.nodes[1]) {
            css.nodes[1].raws.before = "\n";
        }
    };
});
