// import fs from 'fs';
const fileRegex = /\.(md)$/;

//将md文件解析成vue能识别的组件
import compileSFC from '@vue/compiler-sfc';
import compileDOM from '@vue/compiler-dom';

//解析md文件
import Hyperdown from 'hyperdown';

export default function myPlugin() {
  return {
    //插件名字
    name: 'markdown-loader',
    transform(src: any, id: any) {
      //判断是不是md结尾的文件
      if (fileRegex.test(id)) {
        // console.log(src)
        // return fs.readFileSync(src).toString()
        //将md文件内容转成html，这个转换的插件也是可以自己写
        const hyperdown = new Hyperdown();
        const html = hyperdown.makeHtml(src);

        //生成vue能解析的格式
        const ret = compileSFC.parse(`<template><div>${html}</div></template>`);
        const code = compileDOM.compile(ret.descriptor.template?.content, {
          mode: 'module',
        }).code;
        const render = `${code};
                  let __script = {};
                  __script.render = render;
                    export default __script;`;
        return {
          code: render,
          map: null,
        };
      }
    },
  };
}
