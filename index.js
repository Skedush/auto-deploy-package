import inquirer from "inquirer";
import replace from "replace-in-file";
import git from "simple-git/promise";
import path from "path";
import execa from "execa";
import fs from "fs";
import rimraf from "rimraf";
// import config from "./config";
import config from "./config.json";

const { remotepath, fold, buildFold, terminal } = config;
console.log("terminal: ", terminal);

const gitJs = git();
const gitUtils = {
  getRemoteList: async () => {
    let data = await gitJs.listRemote(["--heads", remotepath]);
    let remoteList = [];
    if (data) {
      data = data.split(/[\n]/).forEach(s => {
        if (s) {
          s = s.slice(s.lastIndexOf("/") + 1, s.length);
          // console.log('s: ', s);
          // s.trim();
        }
        remoteList.push(s);
        return s;
      });
      // console.log("Remote url for repository at " + __dirname + ":");
      return remoteList;
    } else {
      console.log("git 500");
    }
  },

  cloneByBranch: async branch => {
    console.log("branch: ", branch);
    return await gitJs.clone(remotepath, path.join(__dirname, fold), [
      "-b",
      branch
    ]);
  }
};

const inquirerUtils = {
  promptList: [
    {
      type: "list",
      message: "请选择一个分支部署:",
      name: "branch",
      choices: [111, 222],
      filter: function(val) {
        // 使用filter将回答变为小写
        return val.toLowerCase();
      }
    }
    // {
    //   type: "input",
    //   message: "请输入发布版本号:",
    //   name: "version",
    //   default: "1.0.5" // 默认值
    // }
  ],

  getAnswers: async () => {
    return await inquirer.prompt(inquirerUtils.promptList);
  }
};

const replaceInFileUtils = {
  replaceContent: async ({ files, from, to }) => {
    try {
      return await replace({ files, from, to });
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }
};

const execaUtils = {
  exeCommand: async () => {
    try {
      process.chdir(fold);
      // await execa("yarn").stdout.pipe(process.stdout);
      for (let i = 0; i < terminal.length; i++) {
        const { stdout } = await execa(
          terminal[i].command,
          terminal[i].options
        );
        console.log("terminal", stdout);
      }
      // const result = await execa("yarn");
      // console.log("安装依赖包", result.stdout);
      // const { stdout } = await execa("yarn", ["build"]);
      // console.log("打包成功 ", stdout);
      rimraf.sync(path.join(__dirname, getFile(buildFold)));
      console.log("删除上次打包文件");
      fs.renameSync(
        path.join(__dirname, fold, buildFold),
        path.join(__dirname, getFile(buildFold))
      );
      console.log("将打包的文件移动到指定目录");
      rimraf.sync(path.join(__dirname, fold));
      console.log("删除项目");
    } catch (error) {
      console.log(error);
    }
  },

  exePerCommand: async () => {
    try {
      rimraf.sync(path.join(__dirname, fold));
      console.log("删除项目");
    } catch (error) {
      console.log(error);
    }
  }
};

const getFile = buildFold => {
  const index = buildFold.lastIndexOf("/");
  if (index !== -1) {
    return buildFold.slice(index + 1);
  }
  return buildFold;
};

const init = async () => {
  // 获取git分支列表
  const remoteList = await gitUtils.getRemoteList();
  // 将分支列表赋值给选择项
  inquirerUtils.promptList[0].choices = remoteList;
  // 用户输入的版本号以及分支名
  const { version, branch } = await inquirerUtils.getAnswers();
  await execaUtils.exePerCommand();

  // clone用户指定分支到本地
  const gitResult = await gitUtils.cloneByBranch(branch);
  console.log("gitResult: ", gitResult);
  // 替换指定文件字符串
  // const replaceResult = await replaceInFileUtils.replaceContent({
  //   files: path.join(fold + MODIFYFOLD),
  //   from: /物业助手v1.0.5/,
  //   to: "物业助手v" + version
  // });
  // 执行终端命令
  await execaUtils.exeCommand();
};
init();
