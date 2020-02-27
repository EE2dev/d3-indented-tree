// rollup.config.js
// import nodeResolve from 'rollup-plugin-node-resolve';
import babel from "rollup-plugin-babel";

var globals = { 
  "d3-js": "d3",
};

export default {
  entry: "index.js",
  dest: "build/d3-hierarchy-explorer.js",
  format: "umd",
  moduleName: "d4",
  //moduleName: "hierarchyExplorer",
  external: Object.keys(globals),
  globals: globals,
  plugins: [
    /*
    nodeResolve({ 
      jsnext: true, 
      main: true}),
      */
      
    babel({
      exclude: "node_modules/**"})
  ]
};