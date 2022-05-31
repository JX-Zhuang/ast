const babel = require('@babel/core');
const types = require('@babel/types');
const path = require('path');
const loggerPlugin = {
    visitor: {
        CallExpression(nodePath,state) {
            const { node } = nodePath;
            if(types.isMemberExpression(node.callee)){
                if (node.callee.object.name === 'console') {
                    if (['log', 'info', 'warn', 'error', 'debug'].includes(node.callee.property.name)) {
                        const { line, column } = node.loc.start;
                        const relativeFileName = path.relative(__dirname, 'state.file.opts.filename').replace(/\\/g, '/');
                        node.arguments.unshift(types.stringLiteral(`${relativeFileName} ${line}:${column}`));
                    }
                }
            }
        }
    }
};
// console log warn error debug 添加参数
const sourceCode = `
console.error('log');
console.log.log('log');
function sum(a,b){
    console.log('日志');
    return a+b;
}
`;

const result = babel.transform(sourceCode, {
    plugins: [loggerPlugin]
});
console.log(result.code);
