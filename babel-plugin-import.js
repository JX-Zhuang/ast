const babel = require('@babel/core');
const types = require('@babel/types');
const path = require('path');
const babelPluginImport = function ({ libraryName }) {
    return {
        visitor: {
            ImportDeclaration(path, state) {
                const { node } = path;
                const { specifiers, source } = node;
                const { libraryName, libraryDirectory = 'lib' } = state.opts;
                if (source.value === libraryName &&
                    //导入不是默认导入才会进来
                    !types.isImportDefaultSpecifier(specifiers[0])) {
                    const importDeclarations = specifiers.map(specifier => {
                        const source = [libraryName, libraryDirectory, specifier.imported.name].filter(Boolean).join('/');
                        return types.ImportDeclaration(
                            [types.importDefaultSpecifier(specifier.local)],
                            types.stringLiteral(source)
                        );
                    });
                    path.replaceWithMultiple(importDeclarations);
                }
            }
        }
    };
}
module.exports = babelPluginImport;
