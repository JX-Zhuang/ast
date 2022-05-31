const types = require('@babel/types');
const babel = require('@babel/core');
const importModule = require('@babel/helper-module-imports');
const path = require('path');
const template = require('@babel/template');
const eslintPlugin = ({ fix }) => {
    return {
        pre(file) {
            file.set('errors', []);
        },
        visitor: {
            CallExpression(path, state) {
                const { node } = path;
                const errors = state.file.get('errors');
                if (node.callee.object.name === 'console') {
                    Error.stackTraceLimit = 0;
                    errors.push(
                        path.buildCodeFrameError('不能出现console')
                    )
                    if(fix){
                        path.parentPath.remove();
                    }
                }
            }
        },
        post(file) {
            console.log(...file.get('errors'));
        }
    };
}
const sourceCode = `
var a = 1;
console.log(a);
var b = 2;
`;

const result = babel.transform(sourceCode, {
    plugins: [eslintPlugin({ fix: true })]
});
console.log(result.code);
