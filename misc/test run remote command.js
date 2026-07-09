"use strict";

// Useful links:
// https://chatgpt.com/c/6a45a469-da98-83ed-9129-084b262a94e6
// http://127.0.0.1:9999/json/list

const WebSocket = require("ws");
const readline = require("readline");

const log = console.log;

const ws = new WebSocket("ws://127.0.0.1:9999/devtools/page/14614C08-5A29-4F52-93D7-FD5A7CB92893");

let nextId = 1;
const pending = {};

function evaluate(expression) {
	const id = nextId++;

	pending[id] = expression;

	ws.send(JSON.stringify({
		id,
		method: "Runtime.evaluate",
		params: {
			expression,
			returnByValue: true,
			awaitPromise: true
		}
	}));
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: "> ",
	historySize: 1000,
});

ws.on("open", () => {
	log("Connected");
	rl.prompt();
});

ws.on("message", data => {
	const message = JSON.parse(data);

	if (message.id && pending[message.id] !== undefined) {
		delete pending[message.id];

		if (message.result?.result?.value !== undefined) {
			log(message.result.result.value);
		} else if (message.result?.result?.description) {
			log(message.result.result.description);
		} else if (message.result?.exceptionDetails) {
			log(message.result.exceptionDetails.exception.description);
		} else {
			log(message.result);
		}

		rl.prompt();
	}
});

rl.on("line", line => {
	if (!line.trim()) {
		rl.prompt();
		return;
	}

	evaluate(line);
});

ws.on("error", err => {
	log(err.message);
});

ws.on("close", () => {
	log("Disconnected");
	process.exit();
});
