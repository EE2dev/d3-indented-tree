// rollup.config.js
// import nodeResolve from 'rollup-plugin-node-resolve';
import babel from "rollup-plugin-babel";

export default {
  entry: "index.js",
  dest: "build/d3-hierarchy-explorer.js",
  format: "umd",
  // moduleName: "reusableChart",
  moduleName: "hierarchyExplorer",
  globals: {
    "d3": "d3",
  },
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