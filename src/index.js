const lib = require("./lib");
const data = require("./data");
console.log(data);
lib.openBookCross(data.asks, data.bids);
