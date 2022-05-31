const types = require('@babel/types');
const path = require('path');
const visitor = {
    CallExpression(nodePath, state) {
        const { node } = nodePath;
        if (types.isMemberExpression(node.callee)) {
            if (node.callee.object.name === 'console') {
                if (['log', 'info', 'warn', 'error', 'debug'].includes(node.callee.property.name)) {
                    const { line, column } = node.loc.start;
                    const filename = state.file.opts.filename;
                    const relativeFileName = path.relative(__dirname, filename).replace(/\\/g, '/');
                    node.arguments.unshift(types.stringLiteral(`${relativeFileName} ${line}:${column}`));
                }
            }
        }
    }
};
module.exports = function () {
    return {
        visitor
    }
};
