"use strict";
function log(val) {
	console.log(val);
}

var ARRAY_SIZE = 1000000;
var ITERATIONS = 100;

// log("arr");
var arr = [];
for (var i = 0; i < ARRAY_SIZE; i++) arr.push(i);

function benchmark(name, fn) {
	// Warm-up
	for (var i = 0; i < 10; ++i) {
		fn();
	}

	var start = performance.now();

	for (var i = 0; i < ITERATIONS; ++i) {
		fn();
	}

	var end = performance.now();

	log(name + ": " + (end - start).toFixed(1) + " ms");
}

var sum = 0;

// log("forEach");
benchmark("forEach", function () {
	sum = 0;

	arr.forEach(function (value) {
		sum += value;
	});
});

// log("for ()");
benchmark("for () ", function () {
	sum = 0;

	for (var i = 0, len = arr.length; i < len; ++i) {
		sum += arr[i];
	}
});

benchmark("for of ", function () {
	sum = 0;

	for (var value of arr) {
		sum += value;
	}
});

log("Sum: " + sum);
