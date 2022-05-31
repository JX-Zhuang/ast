const types = require('@babel/types');
const babel = require('@babel/core');
const importModule = require('@babel/helper-module-imports');
const path = require('path');
const template = require('@babel/template');
const autoLoggerPlugin = ({ libName }) => {
    return {
        visitor: {
            Program(path, state) {
                let loggerId;
                path.traverse({
                    ImportDeclaration(path) {
                        const { node } = path;
                        if (libName === node.source.value) {
                            const specifier = node.specifiers[0];
                            loggerId = specifier.local.name;
                            path.stop();    //跳出循环
                        }
                    }
                });
                if (!loggerId) {
                    // loggerId = importModule.addDefault(path, 'logger', {
                    //     nameHint: path.scope.generateUid('logger')
                    // }).name;
                    loggerId = path.scope.generateUid('logger');
                    const importD = template.statement(`import ${loggerId} from '${libName}'`)();
                    path.node.body.unshift(importD);
                }
                // state.logger = types.expressionStatement(types.callExpression(types.identifier(loggerId), []));
                state.logger = template.statement(`${loggerId}()`)();
            },
            'FunctionExpression|FunctionDeclaration|ArrowFunctionExpression|ClassMethod'(path, state) {
                const { node } = path;
                if (types.isBlockStatement(node.body)) {
                    node.body.body.unshift(state.logger);
                } else {
                    const newBody = types.blockStatement([
                        state.logger,
                        types.returnStatement(node.body)
                    ]);
                    path.get('body').replaceWith(newBody);
                }
            }
        }
    };
}
const sourceCode = `
function sum(a,b){
    console.log('日志');
    return a+b;
}
const minus = (a,b)=>a-b;
const multiply = function(a,b){return a*b};
class Calculator{
    divide(a,b){
        return a/b;
    }
}
`;

const result = babel.transform(sourceCode, {
    plugins: [autoLoggerPlugin({ libName: 'logger' })]
});
console.log(result.code);
