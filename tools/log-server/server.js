var Config = {
	server_port: 5000
};

var Express = require("express");
var express = Express();

express.use(require("body-parser")());
express.use(require("cors")());

express.set("views", __dirname + "/views");

var logs = [];

express.get("/logs", function (request, response) {
	response.setHeader('content-type', 'text/plaintext');
	response.render("logs.html.ejs", {logs: logs});
});

express.post("/logs", function (request, response) {
	logs.push({
		date: (new Date()).getTime(),
		message: request.body.message
	});
	console.log(request.body.message);
	response.status(200);
	response.send("OK");
});

express.get("/logger.js", function (request, response) {
	response.setHeader('content-type', 'text/javascript');
	response.render("logger.js.ejs", {url: "//" + request.hostname + ":" + Config.server_port});
});

express.listen(Config.server_port, function () {
	console.log("Listening on", Config.server_port);
});

process.on('uncaughtException', function (err) {
	  console.log(err);
});