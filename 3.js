const babel = require('@babel/core');
const types = require('@babel/types');
const transformClassesPlugin = {
    visitor: {
        ClassDeclaration(path) {
            const { node } = path;
            const { id } = node;
            const classMethods = node.body.body;
            const newNodes = [];
            classMethods.forEach(classMethod => {
                if (classMethod.kind === 'constructor') {
                    const constructor = types.functionDeclaration(id, classMethod.params, classMethod.body);
                    newNodes.push(constructor);
                } else {
                    const assignmentExpression = types.AssignmentExpression(
                        '=',
                        types.memberExpression(
                            types.memberExpression(id, types.identifier('prototype')),
                            classMethod.key
                        ),
                        types.functionExpression(
                            null, classMethod.params, classMethod.body
                        ));
                    newNodes.push(assignmentExpression);
                }
            });
            if (newNodes.length === 1) {
                path.replaceWith(nodes[0]);
            } else {
                path.replaceWithMultiple(newNodes);
            }
        }
    }
};
const sourceCode = `
class Person {
    constructor(name) {
      this.name = name;
    }
    getName() {
      return this.name;
    }
    setName(name){
        this.name = name;
    }
  }
`;

const result = babel.transform(sourceCode, {
    plugins: [transformClassesPlugin]
});
console.log(result.code);
