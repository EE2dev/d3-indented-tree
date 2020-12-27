// rollup.config.js
// import nodeResolve from 'rollup-plugin-node-resolve';
import babel from "rollup-plugin-babel";
import * as meta from "./package.json";

export default {
  input: "index.js",
  external: ["d3"],
  output: {
    file: `build/${meta.name}.js`,
    name: "d3",
    format: "umd",
    indent: false,
    extend: true,
    banner: `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author}`,
    globals: {d3: "d3"},
    plugins: [
      babel({
        exclude: "node_modules/**"})
    ]
  },
};
/*
var globals = { 
  "d3": "d3",
};

export default {
  entry: "index.js",
  dest: "build/d3-hierarchy-explorer.js",
  format: "umd",
  // moduleName: "d4",
  // name: "d3",
  moduleName: "hierarchyExplorer",
  external: Object.keys(globals),
  globals: globals,
  plugins: [
    /*
    nodeResolve({ 
      jsnext: true, 
      main: true}),
      
      
    babel({
      exclude: "node_modules/**"})
  ]
};
*/