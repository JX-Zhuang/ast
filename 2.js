const babel = require('@babel/core');
const types = require('@babel/types');
const transformEs2015ArrowFunctions = require('babel-plugin-transform-es2015-arrow-functions');
// babel插件是一个对象，有一个visitor的属性
const transformEs2015ArrowFunctions2 = {
    visitor: {
        ArrowFunctionExpression(path) {
            const { node } = path;
            hoistFunctionEnvironment(path);
            node.type = 'FunctionExpression';
            const body = node.body;
            if (!types.isBlockStatement(body)) {
                node.body = types.blockStatement([types.returnStatement(body)]);
            }
        }
    }
};
function hoistFunctionEnvironment(path) {
    //确定当前箭头函数要使用哪个地方的this
    //原理：从当前的节点向上查找，找到一个不是箭头函数的函数，或者是根节点
    const thisEnv = path.findParent(parent => {
        return (parent.isFunction() && !parent.isArrowFunctionExpress()) || parent.isProgram();
    });
    let thisBindings = '_this';
    let thisPaths = getThisPaths(path);
    if (thisPaths.length > 0) {
        thisEnv.scope.push({
            id: types.identifier(thisBindings), //生成一些节点，生成标识符节点
            init: types.thisExpression()    //生成this节点
        });
    }
    thisPaths.forEach(thisPath => {
        thisPath.replaceWith(types.identifier(thisBindings));
    })
}
function getThisPaths(path) {
    let thisPaths = [];
    path.traverse({
        ThisExpression(thisPath) {
            thisPaths.push(thisPath);
        }
    });
    return thisPaths;
}
// const sourceCode = `
// const sum = (a,b)=>{
//     console.log(this);
//     return a+b;
// }
// `;
const sourceCode = `
const sum = (a,b)=>a+b;
`;
const result = babel.transform(sourceCode, {
    plugins: [transformEs2015ArrowFunctions2]
});
console.log(result.code);