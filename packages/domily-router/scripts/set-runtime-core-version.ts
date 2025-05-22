import path from "path";
import pkg from "../package.json";
import runtimeCorePkg from "../../runtime-core/package.json";

const [env = "dev"] = Bun.argv.slice(2);

const previousVersion = pkg.dependencies["@domily/runtime-core"];

pkg.dependencies["@domily/runtime-core"] =
  env === "dev" ? "workspace:^" : `^${runtimeCorePkg.version}`;

await Bun.write(
  path.resolve(import.meta.dir, "..", "package.json"),
  JSON.stringify(pkg, null, 2)
);

console.log(
  `The @domily/runtime-core version has been set to ${pkg.dependencies["@domily/runtime-core"]} from ${previousVersion} in the package.json file.`
);
