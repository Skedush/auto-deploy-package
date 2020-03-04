import Generator from "yeoman-generator";
import { basename } from "path";

class Cli extends Generator {
  constructor(opts) {
    super(opts);
    this.opts = opts;
    this.name = basename(opts.env.cwd);
  }

  // initializing() {
  //   this.props = {}; //定义这个后面会用到
  //   this.log("初始化完成");
  // }

  prompting() {
    //promts是问题集合，在调用this.promt使其在运行yo的时候提出来
    const prompts = [
      {
        type: "input",
        name: "remotepath",
        message: "输入项目git地址",
        default: false //appname是内置对象，代表工程名，这里就是ys
      },
      {
        type: "input",
        name: "terminal",
        message: "输入项目打包命令,以','隔开",
        default: false //appname是内置对象，代表工程名，这里就是ys
      },
      {
        type: "input",
        name: "buildFold",
        message: "输入项目打包完成路径(tar包名称则输入*.tar)",
        default: false //appname是内置对象，代表工程名，这里就是ys
      }
    ];
    return this.prompt(prompts).then(answers => {
      this.props = answers;
    });
  }

  writing() {
    if (!this.props.terminal) {
      return;
    }
    let terminal = this.props.terminal.split(",");
    for (let i = 0; i < terminal.length; i++) {
      if (
        terminal[i] == "" ||
        terminal[i] == null ||
        typeof terminal[i] == undefined
      ) {
        terminal.splice(i, 1);
        i = i - 1;
      }
    }
    terminal = terminal.map(item => item.split(" "));
    terminal = terminal.map(item => {
      return { command: item[0], options: item.slice(1) };
    });
    this.props.terminal = terminal;
    console.log("terminal: ", terminal);
    //复制templates目录中的index.html、index.js到目标目录（先在templates里创建这两个文件）
    this.fs.copyTpl(
      this.templatePath("config.json"),
      // returns './templates/public/index.html'
      this.destinationPath("config.json"),
      this.props //index.html中绑定了title,html标题设为“首页”
    );
  }

  // install() {}
}

export default Cli;
