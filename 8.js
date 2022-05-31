const types = require('@babel/types');
const babel = require('@babel/core');
const importModule = require('@babel/helper-module-imports');
const path = require('path');
const template = require('@babel/template');

const uglifyPlugin = () => {
    return {
        pre(file) {
            file.set('errors', []);
        },
        visitor: {
            //别名
            Scopable(path) {
                //取出所有的变量，进行重命名
                Object.entries(path.scope.bindings).forEach(([key, bindings]) => {
                    const newName = path.scope.generateUid();
                    bindings.path.scope.rename(key, newName);
                })
            }
        },
        post(file) {
            console.log(...file.get('errors'));
        }
    };
}
const sourceCode = `
function getAge(){
    var age = 12;
    console.log(age);
    var name = 'name';
    console.log(name);
}
getAge();
`;

const result = babel.transform(sourceCode, {
    parserOpts: {
        plugins: ['typescript']
    },
    plugins: [uglifyPlugin()]
});
console.log(result.code);
