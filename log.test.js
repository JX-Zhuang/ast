const babel = require('@babel/core');
const fs = require('fs');
const sourceCode = fs.readFileSync('./log.source.js', 'utf-8');
const loggerPlugin = require('./loggerPlugin');
const result = babel.transform(sourceCode, {
    plugins: [loggerPlugin],
    filename:'log.test.js'
});
console.log(result.code);