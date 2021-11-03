"use strict";

const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const execSync = require("child_process").execSync;
const processCss = require("css-loader");
const postcss = require("postcss");
const postcssPlugins = require("../postcss.config").plugins;

const validateOnly = !!yargs.argv.validate;

const cssLoaderPackage = require("css-loader/package.json");
if (!/^2\.\d+\.\d+$/.test(cssLoaderPackage.version)) {
    console.error("\n\x1b[31mERROR: create-css-declaration-files.js requires css-loader@^2.0.0, got "+ cssLoaderPackage.version +" \x1b[0m\n");
    process.exit(1);
}

// NOTE: Do not pass `cwd` to git commands executed in node's child_process
// If `cwd` points to a nested directory (under git) it causes `fatal: Not a git repository`
const execOptions = { encoding: "utf8", stdio: [0, "pipe", 2] };

function formatKey(key) {
    return /^[a-z_][a-z0-9_]*$/i.test(key) ? key : `'${key}'`;
}

function createStylesBundleDeclaration(exportedLocals) {
    const locals = exportedLocals.filter(l => !l.endsWith("Keyframes"));
    return locals.length ? `type validateGlobalClassName<BundleClassName extends GlobalClassName> = never;

declare var exportedClassNames: [
${locals.sort().map(cn => '    validateGlobalClassName<"' + cn + '">').join(",\n")}
];

export = undefined;
` : null;
}

function createDeclaration(exportedLocals) {
    // test/CSSModulesProcessor.js parses these definitions and must be updated if the format changes
    return exportedLocals.length ? `declare const styles: {
${exportedLocals.sort().map(cn => "    " + formatKey(cn) + ": CSSModulesClassName").join("\n")}
}

export = styles
` : null;
}

function findExportedIdentifiers(content, filePath) {
    return new Promise((resolve, reject) => {
        postcss(postcssPlugins)
            .process(content, { from: filePath })
            .then(result => {
                const warnings = result.warnings().join("\n");
                if (warnings.length) {
                    return reject(warnings);
                }
                processCss.call({
                    async: () => (err, result) => {
                        if (err) {
                            return reject("\n" + filePath + "\n" + err.stack || err.message || err);
                        }
                        const exports = eval(`
                        (function() {
                            var module = { exports: {} };
                            ${result};
                            return module.exports;
                        })();`);
                        resolve(Object.keys(exports));
                    },
                    loaders: [],
                    query: {
                        modules: true,
                        exportOnlyLocals: true,
                        getLocalIdent: () => "",
                    },
                }, result.css);
            }).catch(reject);
    });
}

function createCssDeclarationFile(filePath) {
    if (/\.global\.pcss$/.test(filePath)) {
        return Promise.resolve();
    }

    if (!/\.pcss$/.test(filePath)) {
        return Promise.reject("Unable to generate TS definition file: only .pcss files are supported.")
    }

    const isGlobalCss = filePath.replace(/\\/g, "/").includes("src/styles");
    const isGlobalStylesBundle = filePath.replace(/\\/g, "/").includes("src/styles/bundles");

    if (isGlobalCss && !isGlobalStylesBundle) {
        // No declaration necessary for non-bundle global css
        return Promise.resolve();
    }

    const content = yargs.argv.fromGitIndex === true
        ? execSync(`git show :${filePath}`, execOptions).toString()
        : fs.readFileSync(filePath).toString();

    return findExportedIdentifiers(content, filePath).then(identifiers => {
        const declaration = isGlobalStylesBundle ?
            createStylesBundleDeclaration(identifiers) :
            createDeclaration(identifiers);

        if (declaration) {
            const declarationFilePath = filePath.replace(/\.pcss$/, ".pcss.d.ts");
            let writeFile = true;

            if (fs.existsSync(declarationFilePath)) {
                const previousDeclaration = fs.readFileSync(declarationFilePath).toString();
                if (declaration === previousDeclaration) {
                    writeFile = false;
                }
            }

            if (writeFile) {
                if (validateOnly) {
                    return Promise.reject("Type definitions for CSS module '" + filePath + "' are outdated, please run `yarn tscss` and commit the result.");
                }
                fs.writeFileSync(declarationFilePath, declaration);
            }

            if (yargs.argv.addToGit === true) {
                execSync(`git add ${declarationFilePath}`, execOptions);
            }
        }
    });
}

let patterns = yargs.argv.p && yargs.argv.p.length ? yargs.argv.p : [];
if (typeof patterns === "string") {
    patterns = [patterns];
}

patterns = patterns.map(o => o.charAt(0) === "'" ? o.substr(1, o.length - 2) : o);

const glob = require("glob");
const files = patterns.reduce((acc, p) => acc.concat(glob.sync(p)), []);

Promise.all(files.map(createCssDeclarationFile)).catch(err => {
    console.error("\n\x1b[31mERROR: " + (err.stack || err.toString()) + "\x1b[0m\n");
    process.exitCode = 1;
});

module.exports = { findExportedIdentifiers };
