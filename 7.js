const types = require('@babel/types');
const babel = require('@babel/core');
const importModule = require('@babel/helper-module-imports');
const path = require('path');
const template = require('@babel/template');
const AnnotationMap = {
    TSNumberKeyword: 'NumericLiteral'
}
const tscCheckPlugin = () => {
    return {
        pre(file) {
            file.set('errors', []);
        },
        visitor: {
            VariableDeclarator(path, state) {
                const errors = state.file.get('errors');
                const idType = AnnotationMap[path.node.id.typeAnnotation.typeAnnotation.type];
                const initType = path.node.init.type;
                if (initType !== idType) {
                    Error.stackTraceLimit = 0;
                    errors.push(
                        path.get('init').buildCodeFrameError(`无法把${initType}赋值给${idType}`, Error)
                    )
                }
            }
        },
        post(file) {
            console.log(...file.get('errors'));
        }
    };
}
const sourceCode = `
var age:number=123;
`;

const result = babel.transform(sourceCode, {
    parserOpts: {
        plugins: ['typescript']
    },
    plugins: [tscCheckPlugin()]
});
console.log(result.code);
