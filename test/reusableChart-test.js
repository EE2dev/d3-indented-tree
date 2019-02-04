var tape = require("tape");
// var seq = require("../");


tape("dummy", function(test) {
  test.equal( false, false);
  test.end();
}); 

/*
// adjust index.js to include helper.js
tape("test thousands formatter", function(test) {
  let num = seq.formatNumber("200144", ".");
  test.equal( num, "200.144");
  num = seq.formatNumber("200144", ",");
  test.equal( num, "200,144");
  test.end();
}); 
*/