const { exec } = require("child_process");

// 获取当前环境
const env = process.env.NODE_ENV || "development";
console.log(env, `./nodemon/nodemon.${env}.json`);

// 根据环境加载相应的配置文件
const nodemonConfig = require(`./nodemon/nodemon.${env}.json`);

// 启动应用程序
const app = exec(`nodemon -L -C ${nodemonConfig.exec}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

// 监听应用程序的输出
app.stdout.on("data", (data) => {
  console.log(data.toString());
});

app.stderr.on("data", (data) => {
  console.error(data.toString());
});

app.on("exit", (code) => {
  console.log(`Application exited with code ${code}`);
});
