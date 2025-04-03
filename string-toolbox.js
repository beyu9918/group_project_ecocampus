function camelCase(str) {
    return str
        .toLowerCase()                   // 全部转换为小写
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase()); // 去除非字母数字字符并大写后跟字符
}

// 示例测试
console.log(camelCase("hello world"));        // 输出: helloWorld
console.log(camelCase("Camel case function")); // 输出: camelCaseFunction
console.log(camelCase("make-camel_case 123")); // 输出: makeCamelCase123
