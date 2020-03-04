import Generator from "./cli";
import yeoman from "yeoman-environment";

const cwd = process.cwd();

const env = yeoman.createEnv([], {
  cwd
});

const generator = new Generator({
  env,
  resolved: require.resolve("./cli")
});
generator.run(() => {
  console.log("✨ File Generate Done");
});
