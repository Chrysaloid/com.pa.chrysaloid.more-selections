"use strict";

// Non-interactive variant of test_run_remote_command.js: takes the JS expression to
// evaluate as a CLI argument, auto-discovers the "Live Game" page's websocket debugger
// URL via http://127.0.0.1:<port>/json/list, evaluates once, prints the result, exits.
//
// Usage:
//   node run_remote_command_from_param.js "<expression>" [pageTitle] [port]
//
// Examples:
//   node run_remote_command_from_param.js "Object.keys(api.select).join('\n')"
//   node run_remote_command_from_param.js "api.select.allCombatUnitsOnScreen.toString()"
//   node run_remote_command_from_param.js "Object.keys(api.camera).join('\n')" "Live Game"

const WebSocket = require("ws");

const fs = require("fs");

let expression = process.argv[2];
const pageTitle = process.argv[3] || "Live Game";
const port = process.argv[4] || 9999;

if (!expression) {
	console.error("Usage: node run_remote_command_from_param.js \"<expression>\" [pageTitle] [port]");
	console.error("       node run_remote_command_from_param.js @path/to/script.js [pageTitle] [port]");
	process.exit(1);
}

if (expression.startsWith("@")) {
	expression = fs.readFileSync(expression.slice(1), "utf8");
}

const TIMEOUT_MS = 15000;

function fail(message) {
	console.error(message);
	process.exit(1);
}

fetch("http://127.0.0.1:" + port + "/json/list")
	.then(res => res.json())
	.then(pages => {
		// Coherent page titles embed the url as "Title [ url ]", so exact-match against
		// the known live_game url first (avoids matching "Live Game: Chat" etc.)
		const page = (pageTitle === "Live Game" && pages.find(p => p.url === "coui://ui/main/game/live_game/live_game.html"))
			|| pages.find(p => p.title === pageTitle)
			|| pages.find(p => p.title.startsWith(pageTitle));

		if (!page) {
			fail("No debugger page found with title matching \"" + pageTitle + "\". Available titles:\n" + pages.map(p => p.title).join("\n"));
			return;
		}

		runEvaluate(page.webSocketDebuggerUrl);
	})
	.catch(err => fail("Failed to reach devtools list at port " + port + ": " + err.message));

function runEvaluate(wsUrl) {
	const ws = new WebSocket(wsUrl);

	const timer = setTimeout(() => {
		fail("Timed out waiting for a response after " + TIMEOUT_MS + "ms");
	}, TIMEOUT_MS);

	ws.on("open", () => {
		ws.send(JSON.stringify({
			id: 1,
			method: "Runtime.evaluate",
			params: {
				expression,
				returnByValue: true,
				awaitPromise: true
			}
		}));
	});

	ws.on("message", data => {
		const message = JSON.parse(data);

		if (message.id !== 1) return;

		clearTimeout(timer);

		if (message.result?.exceptionDetails) {
			const ed = message.result.exceptionDetails;
			console.error(ed.exception?.description || ed.text || "exception (no description)");
			console.error(JSON.stringify(ed, null, 2));
			ws.close();
			process.exitCode = 1;
			return;
		}

		const value = message.result?.result?.value;
		if (value !== undefined) {
			console.log(typeof value === "string" ? value : JSON.stringify(value, null, 2));
		} else if (message.result?.result?.description) {
			console.log(message.result.result.description);
		} else {
			console.log(JSON.stringify(message.result, null, 2));
		}

		ws.close();
	});

	ws.on("error", err => {
		clearTimeout(timer);
		fail(err.message);
	});
}
