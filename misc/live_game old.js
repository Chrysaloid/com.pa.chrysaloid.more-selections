"use strict";

(function() {
	console.log("Hello live_game.js Chrysaloid!")
	Object.defineProperty(Array.prototype, "contains", {
		value: function (value) {
			return this.indexOf(value) !== -1;
		},
	});
	Object.defineProperty(Array.prototype, "sortValuesSimple", {
		value: function (getValue) {
			return this.sort(function (a, b) {
				const a1 = getValue(a);
				const b1 = getValue(b);
				if (a1 < b1) return -1;
				if (a1 > b1) return 1;
				return 0;
			});
		},
	});
	Object.defineProperty(Array.prototype, "find", {
		value: function (getValue) {
			var i, length = this.length, item;
			for (i = 0; i < length; i++) {
				item = this[i];
				if (getValue(item, i, this)) return item;
			}
		},
	});
	Object.defineProperty(Array.prototype, "promiseChain", {
		value: function (getPromiseFromItem) {
			var me = this, i = 0;
			return me.reduce(function (promise, value) {
				return promise.then(function () {
					return getPromiseFromItem(value, i++, me);
				});
			}, Promise.resolve());
		},
	});

	function sleep(ms) {
		return new Promise(function (resolve) { setTimeout(resolve, ms) });
	}
	function sleepFun(ms) {
		return function () {
			return sleep(ms);
		};
	}
	function log(val) {
		console.log(val);
	}
	function logRet(val) {
		console.log(val);
		return val;
	}
	function logChatMessage(message) {
		return engine.call("panel.message", "chat", "chat_message", JSON.stringify({
			message: message,
			player_name: "[SYSTEM]",
		}));
	}
	function getPointingAtPosition() {
		// document mousemove can be stale if another panel captured the mouse
		var cx = cursor_x, cy = cursor_y;
		if ((cx === undefined || cy === undefined) && typeof api !== "undefined" && api.input && api.input.mouse) {
			var mx = (typeof api.input.mouse.x === "function") ? api.input.mouse.x() : api.input.mouse.x;
			var my = (typeof api.input.mouse.y === "function") ? api.input.mouse.y() : api.input.mouse.y;
			if (typeof mx === "number" && typeof my === "number" && mx >= 0 && my >= 0) { cx = mx; cy = my }
		}
		if (cx < 0 || cy < 0) return;
		if (!model.holodeck || !model.holodeck.raycastTerrain) return;

		return model.holodeck.raycastTerrain(cx * devicePixelRatio, cy * devicePixelRatio).then(function (loc3D) {
			if (!loc3D || !loc3D.pos) return;
			// prefer planet from the raycast hit; fall back to camera focus
			var planet = (typeof loc3D.planet === "number") ? loc3D.planet : null;
			if (planet === null && api && api.camera && typeof api.camera.getFocus === "function") {
				var focus = api.camera.getFocus(model.holodeck.id);
				if (focus && typeof focus.planet === "function") planet = focus.planet();
			}
			if (planet === null || planet < 0) return;
			return loc3D
		});
	}
	function cameraLookAt(locArr, planetId) {
		api.camera.lookAt({
			planet_id: planetId !== undefined ? planetId : model.currentFocusPlanetId(),
			location: {x: locArr[0], y: locArr[1], z: locArr[2]} // , lat: 152.76652370095897, long: 0.3689341171248849
		}, 1);
	}
	var oldHover = handlers.hover;
	var lastHoverPayload;
	handlers.hover = function(payload) {
		// log(payload);
		// var obj = {
		// 	"army": {
		// 		"primary_color": {
		// 			"r": 0.014443843625485897,
		// 			"g": 0.44520124793052673,
		// 			"b": 0.40197786688804626,
		// 			"a": 1
		// 		},
		// 		"secondary_color": {
		// 			"r": 0.2158605307340622,
		// 			"g": 0.2158605307340622,
		// 			"b": 0.2158605307340622,
		// 			"a": 1,
		// 		}
		// 	},
		// 	"consumption": {
		// 		"energy": 0,
		// 		"metal": 0
		// 	},
		// 	"entity": 19673,
		// 	"ghost": false,
		// 	"health": {
		// 		"current": 6000,
		// 		"max": 6000
		// 	},
		// 	"location": {
		// 		"x": -12.791434288024902,
		// 		"y": 105.19084930419922,
		// 		"z": 525.5285034179688
		// 	},
		// 	"metal_cost": 600,
		// 	"metal_fraction": 2,
		// 	"name": "!LOC:Vehicle Factory",
		// 	"production": {
		// 		"energy": 0,
		// 		"metal": 0
		// 	},
		// 	"spec_id": "/pa/units/land/vehicle_factory/vehicle_factory.json",
		// 	"tool_details": {
		// 		"build_arm_cost": 675,
		// 		"build_arm_power": 15,
		// 		"build_target": false,
		// 		"energy": 675,
		// 		"metal": 15,
		// 		"weapon_target": false
		// 	},
		// 	"unit_name": "Vehicle Factory"
		// }
		lastHoverPayload = payload;
		return oldHover(payload);
	};

	sleep(200).then(function() { // delay isnenecessary here because at this time model.unitSpecs is undefined
		Object.keys(model.unitSpecs).forEach(function (key) {
			var unitSpec = model.unitSpecs[key];
			unitSpec.shortTypes = unitSpec.types ? unitSpec.types.map(function (type) { return type.slice(9); }) : []; // "UNITTYPE_".length === 9
			if (unitSpec.build) {
				unitSpec.builds = {}
				unitSpec.build.forEach(function (id) { unitSpec.builds[id] = null });
			}
		});
	});

	model.currentFocusPlanetId = function() {
		return api.camera.getFocus(api.Holodeck.focused.id).planetId()
	}

	var distance2d = function(p1x, p1y, p2x, p2y) {
		var dx = p2x - p1x;
		var dy = p2y - p1y;
		return Math.sqrt(dx*dx + dy*dy);
	}
	var distance3d = function(v1, v2) {
		var dx = v1[0] - v2[0];
		var dy = v1[1] - v2[1];
		var dz = v1[2] - v2[2];
		return Math.sqrt(dx*dx + dy*dy + dz*dz);
	}
	var normalizeVector = function(x, y, z) {
		if (x == 0 && y == 0 && z == 0) return [0, 0, 0];
		var length = Math.sqrt( x*x + y*y + z*z )
		return [x/length, y/length, z/length];
	}

	function getOptionFromSelectMode(select_mode) {
		switch (select_mode) {
			case undefined:
			default: return Mousetrap.isShiftDown() ? "add" : "default";
			case "add"    :
			case "remove" :
			case "default": return select_mode;
		}
	}
	function callWithFilter(command, group, acceptance_filter, rejection_filter, select_mode) {
		if (!acceptance_filter) acceptance_filter = [];

		if (typeof (command) !== "string") return;

		if (typeof (acceptance_filter) === "string") acceptance_filter = [acceptance_filter];

		if (typeof (rejection_filter) === "string") rejection_filter = [rejection_filter];

		if (!rejection_filter) rejection_filter = [];

		if (model.endCommandMode) model.endCommandMode();

		if (group === null) return engine.call(command, JSON.stringify(acceptance_filter), JSON.stringify(rejection_filter), getOptionFromSelectMode(select_mode));
		else return engine.call(command, group, JSON.stringify(acceptance_filter), JSON.stringify(rejection_filter), getOptionFromSelectMode(select_mode));
	}
	var mySelect = {
		armyCommanders: function (armyId) { return engine.call("select.armyCommanders", armyId); },
		commander                  : function () { return engine.call("select.commander"                  ); },
		idleFabber                 : function () { return engine.call("select.idleFabber"                 ); },
		allCombatUnits             : function () { return engine.call("select.allCombatUnits"             ); },
		allFabbers                 : function () { return engine.call("select.allFabbers"                 ); },
		allFactories               : function () { return engine.call("select.allFactories"               ); },
		allIdleFactories           : function () { return engine.call("select.allIdleFactories"           ); },
		allLandCombatUnits         : function () { return engine.call("select.allLandCombatUnits"         ); },
		allAirCombatUnits          : function () { return engine.call("select.allAirCombatUnits"          ); },
		allNavalCombatUnits        : function () { return engine.call("select.allNavalCombatUnits"        ); },
		allCombatUnitsOnScreen     : function () { return engine.call("select.allCombatUnitsOnScreen"     ); },
		allFabbersOnScreen         : function () { return engine.call("select.allFabbersOnScreen"         ); },
		allFactoriesOnScreen       : function () { return engine.call("select.allFactoriesOnScreen"       ); },
		allIdleFactoriesOnScreen   : function () { return engine.call("select.allIdleFactoriesOnScreen"   ); },
		allLandCombatUnitsOnScreen : function () { return engine.call("select.allLandCombatUnitsOnScreen" ); },
		allAirCombatUnitsOnScreen  : function () { return engine.call("select.allAirCombatUnitsOnScreen"  ); },
		allNavalCombatUnitsOnScreen: function () { return engine.call("select.allNavalCombatUnitsOnScreen"); },
		unitsById: function (unitIds, tryRepeatedly) {
			// the tryRepeatedly flag is necessary because we will often learn the id of a spawning commander before we actually receive the commander

			if (tryRepeatedly) {
				var completion = $.Deferred(),
				selectUnits = function() {
					engine.call("select.byIds", unitIds).then(function (r) {
							if (!r) {
								_.delay(selectUnits, 50);
							} else {
								completion.resolve();
							}
					});
				};

				selectUnits();

				return completion;
			} else {
				return engine.call("select.byIds", unitIds);
			}
		},
		unitsfromSelection: function (acceptance_filter, rejection_filter, select_mode) {
			return callWithFilter("select.fromCurrentSelectionWithTypeFilter", null, acceptance_filter, rejection_filter, select_mode);
		},
		unitsOnScreen: function (planet_id, acceptance_filter, rejection_filter, select_mode) {
			return callWithFilter("select.unitsOnScreenWithTypeFilter", planet_id, acceptance_filter || "Mobile", rejection_filter, select_mode);
		},
		unitsOnPlanet: function (planet_id, acceptance_filter, rejection_filter, select_mode) {
			return callWithFilter("select.unitsOnPlanetWithTypeFilter", planet_id, acceptance_filter || "Mobile", rejection_filter, select_mode);
		},
		idleFabbers: function (planet_id, acceptance_filter, rejection_filter, select_mode) {
			return callWithFilter("select.idleFabbersWithTypeFilter", planet_id, acceptance_filter || "Fabber", rejection_filter, select_mode);
		},
		idleFactories: function (planet_id, acceptance_filter, rejection_filter, select_mode) {
			return callWithFilter("select.idleFactoriesWithTypeFilter", planet_id, acceptance_filter || "Factory", rejection_filter, select_mode);
		},
		idleFabbersOnScreen: function (planet_id, acceptance_filter, rejection_filter, select_mode) {
			return callWithFilter("select.idleFabbersOnScreenWithTypeFilter", planet_id, acceptance_filter || "Fabber", rejection_filter, select_mode);
		},
		idleFactoriesOnScreen: function (planet_id, acceptance_filter, rejection_filter, select_mode) {
			return callWithFilter("select.idleFactoriesOnScreenWithTypeFilter", planet_id, acceptance_filter || "Factory", rejection_filter, select_mode);
		},
		captureGroup: api.select.captureGroup,
		// captureGroup: function (group) { // ReferenceError: activeControlGroups is not defined // use api.select.captureGroup instead
		// 	var groups = activeControlGroups();
		// 	groups[group] = true;
		// 	activeControlGroups(groups);
		// 	return engine.call("select.captureGroup", typeof (group) == "number" ? group : 0);
		// },
		recallGroup: function (group, select_mode) {
			if (model.endCommandMode) model.endCommandMode();
			return engine.call("select.recallGroup", typeof (group) == "number" ? group : 0, getOptionFromSelectMode(select_mode));
		},
		recallGroupWithTypeFilter: function (group, acceptance_filter, rejection_filter, select_mode) {
			return callWithFilter("select.recallGroupWithTypeFilter", group, acceptance_filter, rejection_filter, select_mode);
		},
		forgetGroup: function (group) {
			return engine.call("select.forgetGroup", typeof (group) == "number" ? group : 0);
		},
		empty: function () { return engine.call("select.empty"); },
	};

	function defaultFilterFun(unitSpec) {
		return true;
	}
	function getUnitsSortedByDistanceToCamera(filterFun) {
		var worldView = api.getWorldView(0);
		var camPos = api.camera.getFocus(api.Holodeck.focused.id).location();
		// camPos = [camPos.x, camPos.y, camPos.z];
		// normalize because the camera constantly shift between surface position and normalized position
		// normalization means casting a point onto a unit sphere in the center of the planet
		// that means that orbital units have the same chance of being selected
		var camPosN = normalizeVector(camPos.x, camPos.y, camPos.z);
		return worldView.getArmyUnits(model.armyIndex(), model.currentFocusPlanetId()).then(function (armyUnits) {
			var units;
			if (filterFun) {
				units = [];
				Object.keys(armyUnits).forEach(function (key) {
					if (filterFun(model.unitSpecs[key])) {
						units.push(armyUnits[key]);
					}
				});
				units = _.flatten(units);
			} else {
				units = _.flatten(_.toArray(armyUnits));
			}
			return worldView.getUnitState(units).then(function (unitStates) {
				unitStates.forEach(function (unitState, i) {
					unitState.id = units[i]
					var unitPos = unitState.pos;
					var unitPosN = normalizeVector(unitPos[0], unitPos[1], unitPos[2]);
					unitState.distanceToCamera = distance3d(camPosN, unitPosN);
					// unitState.distanceToCamera = distance3d(camPos, unitPos);
				});
				unitStates.sortValuesSimple(function (unitState) { return unitState.distanceToCamera })
				return unitStates;
			});
		});
	}
	function toId(elem) {
		return elem.id;
	}
	function to(value) {
		return function (elem) {
			return elem[value];
		};
	}
	function getSelectionOrHover(additionalMessage) {
		var selection = model.selection();
		if (!selection) {
			logChatMessage("Nothing is selected" + (additionalMessage ? ". " + additionalMessage : ""))
			return;
			if (lastHoverPayload.entity) {
				selection = {}
				selection[lastHoverPayload.spec_id] = [lastHoverPayload.entity]
				selection = {spec_ids: selection};
				// mySelect.unitsById([lastHoverPayload.entity]);
			} else {
				logChatMessage("Nothing is selected or hovered over" + (additionalMessage ? ". " + additionalMessage : ""))
				return;
			}
		}
		return selection;
	}
	function factoriesInSelection(selection, additionalMessage) {
		if (Object.keys(selection.spec_ids).some(function (spec_id) { return factory_spec_ids.hasOwnProperty(spec_id) })) {
			return true;
		} else {
			logChatMessage("There are no factories in selection" + (additionalMessage ? ". " + additionalMessage : ""))
			return false;
		}
	}
	function getSelectedUnitInfo() {
		var selection = getSelectionOrHover(message);
		if (!selection) return;
		var units = _.flatten(_.toArray(selection.spec_ids));
		return api.getWorldView(0).getUnitState(units).then(function (unitStats) {
			unitStats.forEach(function (unitStat, i) {
				unitStat.id = units[i];
			});
			unitStats = unitStats.length > 1 ? unitStats : unitStats[0]
			console.log(unitStats);
			return unitStats;
		})
	}
	function whileAsync(condition, body) {
		function next() {
			return Promise.resolve(condition()).then(function (result) {
				if (!result) {
					return;
				}

				return Promise.resolve(body(result)).then(next);
			});
		}

		return next();
	}
	// function clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView) {
	// 	if (isShiftDown) return Promise.resolve();
	// 	// worldView.sendOrder({ units: unitArr, command: "stop" }); // to przerwałoby produkcję obecnego unita a tego nie chcemy
	// 	return model.unitSpecs[factorySpec].build.promiseChain(function (buildUnitSpec) {
	// 		return sleep(model.paste_sleep_val).then(function() {
	// 			return worldView.sendOrder(logRet({
	// 				units: factoryArr,
	// 				command: "factory_build",
	// 				spec: buildUnitSpec.id,
	// 				count: -10000, // ujemny count odejmuje od kolejki, duża liczba gwarantuje że zawsze wszystko wyczyścimy
	// 			}));
	// 		})
	// 	});
	// }

	// function clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView) {
	// 	if (isShiftDown) return;
	// 	model.unitSpecs[factorySpec].build.forEach(function (buildUnitSpec) {
	// 		// duża liczba gwarantuje że zawsze wszystko wyczyścimy
	// 		console.log("cancelBuild", buildUnitSpec.id, 10000)
	// 		api.unit.cancelBuild(buildUnitSpec.id, 10000, false);
	// 	});
	// }

	// function clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView) {
	// 	if (isShiftDown) return Promise.resolve();
	// 	return model.unitSpecs[factorySpec].build.promiseChain(function (buildUnitSpec) {
	// 		// duża liczba gwarantuje że zawsze wszystko wyczyścimy
	// 		console.log("cancelBuild", buildUnitSpec.id, 10000);
	// 		return api.unit.cancelBuild(buildUnitSpec.id, 10000, false);
	// 	});
	// }

	// function clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView) {
	// 	if (isShiftDown) return Promise.resolve();
	// 	return model.unitSpecs[factorySpec].build.promiseChain(function (buildUnitSpec) {
	// 		// duża liczba gwarantuje że zawsze wszystko wyczyścimy
	// 		console.log("cancelBuild", buildUnitSpec.id, 10000);
	// 		return api.unit.cancelBuild(buildUnitSpec.id, 10000, false).then(function () {
	// 			console.log("cancelBuild", buildUnitSpec.id, 10000);
	// 			return api.unit.cancelBuild(buildUnitSpec.id, 10000, false);
	// 		});
	// 	});
	// }

	// function clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView) {
	// 	if (isShiftDown) return Promise.resolve();
	// 	return Promise.all(model.unitSpecs[factorySpec].build.map(function (buildUnitSpec) {
	// 		// duża liczba gwarantuje że zawsze wszystko wyczyścimy
	// 		console.log("cancelBuild", buildUnitSpec.id, 10000);
	// 		return api.unit.cancelBuild(buildUnitSpec.id, 10000, false);
	// 	}));
	// }

	// function clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView) {
	// 	if (isShiftDown) return Promise.resolve();
	// 	return Promise.all(model.unitSpecs[factorySpec].build.map(function (buildUnitSpec) {
	// 		// duża liczba gwarantuje że zawsze wszystko wyczyścimy
	// 		console.log("cancelBuild", buildUnitSpec.id, 10000);
	// 		return api.unit.cancelBuild(buildUnitSpec.id, 10000, false).then(function () {
	// 			console.log("cancelBuild", buildUnitSpec.id, 10000);
	// 			return api.unit.cancelBuild(buildUnitSpec.id, 10000, false);
	// 		});
	// 	}));
	// }

	// function clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView) {
	// 	console.log("in clearFactoryQueue");
	// 	if (isShiftDown) return Promise.resolve();
	// 	return worldView.getUnitState(factoryArr).then(function (factoryStats) {
	// 		console.log("factoryStats", factoryStats);
	// 		for (var factoryStat of factoryStats) { // dla każdej fabryki danego typu
	// 			if (!_.isArray(factoryStat.build)) continue;
	// 			console.log("factoryStat.build", factoryStat.build);
	// 			return Promise.all(factoryStat.build.map(function (buildUnit) { // map tworzy tutaj array of promises
	// 				console.log("cancelBuild", buildUnit.spec, buildUnit.count);
	// 				return api.unit.cancelBuild(buildUnit.spec, buildUnit.count, false);
	// 			})).then(function () {
	// 				console.log("before next clearFactoryQueue");
	// 				return clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView);
	// 			});
	// 		} // jeżeli żadna z fabryk nic nie buduje to lądujemy tutaj
	// 	});
	// }

	function clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView) {
		console.log("in clearFactoryQueue");
		if (isShiftDown) return Promise.resolve();
		return whileAsync(function () {
			console.log("condition");
			return worldView.getUnitState(factoryArr).then(function (factoryStats) {
				console.log("factoryStats", factoryStats);
				return factoryStats.find(function (factoryStat) {
					return _.isArray(factoryStat.build);
				});
			});
		}, function (factoryStat) {
			console.log("body");
			return Promise.all(factoryStat.build.map(function (buildUnit) { // map tworzy tutaj array of promises
				console.log("cancelBuild", buildUnit.spec, buildUnit.count);
				return api.unit.cancelBuild(buildUnit.spec, buildUnit.count, false);
			}));
		});
	}

	// =================   Factory managment  ====================

	var factory_queues = [
		{
			"name": "Air Factory",
			"spec_id": "/pa/units/air/air_factory/air_factory.json",
			"similarFactories": ["Air Factory", "Advanced Air Factory"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Advanced Air Factory",
			"spec_id": "/pa/units/air/air_factory_adv/air_factory_adv.json",
			"similarFactories": ["Advanced Air Factory", "Air Factory"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Bot Factory",
			"spec_id": "/pa/units/land/bot_factory/bot_factory.json",
			"similarFactories": ["Bot Factory", "Advanced Bot Factory", "Unit Cannon"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Advanced Bot Factory",
			"spec_id": "/pa/units/land/bot_factory_adv/bot_factory_adv.json",
			"similarFactories": ["Advanced Bot Factory", "Bot Factory", "Unit Cannon"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Vehicle Factory",
			"spec_id": "/pa/units/land/vehicle_factory/vehicle_factory.json",
			"similarFactories": ["Vehicle Factory", "Advanced Vehicle Factory", "Unit Cannon"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Advanced Vehicle Factory",
			"spec_id": "/pa/units/land/vehicle_factory_adv/vehicle_factory_adv.json",
			"similarFactories": ["Advanced Vehicle Factory", "Vehicle Factory", "Unit Cannon"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Naval Factory",
			"spec_id": "/pa/units/sea/naval_factory/naval_factory.json",
			"similarFactories": ["Naval Factory", "Advanced Naval Factory"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Advanced Naval Factory",
			"spec_id": "/pa/units/sea/naval_factory_adv/naval_factory_adv.json",
			"similarFactories": ["Advanced Naval Factory", "Naval Factory"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Orbital Launcher",
			"spec_id": "/pa/units/orbital/orbital_launcher/orbital_launcher.json",
			"similarFactories": ["Orbital Launcher", "Orbital Factory"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Orbital Factory",
			"spec_id": "/pa/units/orbital/orbital_factory/orbital_factory.json",
			"similarFactories": ["Orbital Factory", "Orbital Launcher"],
			"lastCopiedTime": 0,
		},
		{
			"name": "Unit Cannon",
			"spec_id": "/pa/units/land/avatar_factory/avatar_factory.json",
			"similarFactories": ["Unit Cannon", "Advanced Vehicle Factory", "Vehicle Factory", "Advanced Bot Factory", "Bot Factory"],
			"lastCopiedTime": 0,
		},
		// {
		// 	"name": "Avatar Factory",
		// 	"spec_id": "/pa/units/land/avatar_factory/avatar_factory.json"
		// },
	];
	var factory_spec_ids = {};
	factory_queues.forEach(function (factory_queue) {
		factory_spec_ids[factory_queue.spec_id] = null
		factory_queue.similarFactories = factory_queue.similarFactories.map(function(factoryName) {
			return factory_queues.find(function(factory) { return factory.name === factoryName })
		})
	});
	model.copy_factory_queue = function() {
		var message = "Select a factory to copy its queue";
		var selection = getSelectionOrHover(message);
		if (!selection) return
		if (!factoriesInSelection(selection, message)) return
		var armyIndex = model.armyIndex();
		var worldView = api.getWorldView(0);
		factory_queues.forEach(function (factory_queue) { // pętla po typach fabryk
			var unitArr = selection.spec_ids[factory_queue.spec_id];
			if (!unitArr) return;
			// var unitSpec = model.unitSpecs[factory_queue.spec_id];
			worldView.getUnitState(unitArr[0]).then(function (unit) {
				if (!_.isArray(unit.build)) unit.build = false;
				if (unit.army !== armyIndex) return;
				factory_queue.build = unit.build;
				factory_queue.lastCopiedTime = performance.now();
			});
		});
	}
	model.paste_sleep_val = 100;
	// .then(sleepFun(model.paste_sleep_val))
	var pasteMessage = "Select a factory to paste the copied queue";
	model.paste_factory_queue_strict = function() {
		var isShiftDown = Mousetrap.isShiftDown();
		var selection = getSelectionOrHover(pasteMessage);
		if (!selection) return;
		if (!factoriesInSelection(selection, pasteMessage)) return;
		// var armyIndex = model.armyIndex();
		var worldView = api.getWorldView(0);
		factory_queues.forEach(function (factory_queue) { // pętla po typach fabryk
			var factoryArr = selection.spec_ids[factory_queue.spec_id];
			if (!factoryArr) return;
			console.log("before clearFactoryQueue", factory_queue.spec_id, factoryArr);
			var prom = clearFactoryQueue(factory_queue.spec_id, factoryArr, isShiftDown, worldView);
			// var prom = clearFactoryQueue(factory_queue.spec_id, factoryArr, isShiftDown, worldView).then(sleepFun(model.paste_sleep_val)).then(function () {
			// 	return clearFactoryQueue(factory_queue.spec_id, factoryArr, isShiftDown, worldView);
			// });
			if (!factory_queue.build) return;
			// prom.then(function () {
			// 	factory_queue.build.promiseChain(function (buildUnit, i) {
			// 		return sleep(model.paste_sleep_val).then(function() {
			// 			return worldView.sendOrder(logRet({
			// 				units: factoryArr,
			// 				command: "factory_build",
			// 				spec: buildUnit.spec,
			// 				// queue: isShiftDown || i !== 0, // queue nie działa
			// 				count: buildUnit.count,
			// 			}));
			// 		})
			// 	});
			// });

			// factory_queue.build.forEach(function (buildUnit, i) {
			// 	console.log("build", buildUnit.spec, buildUnit.count)
			// 	api.unit.build(buildUnit.spec, buildUnit.count, false);
			// });

			// prom.then(function () {
			// 	factory_queue.build.promiseChain(function (buildUnit, i) {
			// 		console.log("build", buildUnit.spec, buildUnit.count);
			// 		return api.unit.build(buildUnit.spec, buildUnit.count, false);
			// 	});
			// });

			// prom.then(sleepFun(model.paste_sleep_val)).then(function () {
			// 	factory_queue.build.forEach(function (buildUnit, i) {
			// 		console.log("build", buildUnit.spec, buildUnit.count);
			// 		return api.unit.build(buildUnit.spec, buildUnit.count, false);
			// 	});
			// });

			prom.then(function () {
				factory_queue.build.forEach(function (buildUnit, i) {
					console.log("build", buildUnit.spec, buildUnit.count);
					return api.unit.build(buildUnit.spec, buildUnit.count, false);
				});
			});
		});
	}
	model.paste_factory_queue_unified = function() {
		var isShiftDown = Mousetrap.isShiftDown();
		var selection = getSelectionOrHover(pasteMessage);
		if (!selection) return;
		if (!factoriesInSelection(selection, pasteMessage)) return;
		// var armyIndex = model.armyIndex();
		var worldView = api.getWorldView(0);
		factory_queues.forEach(function (factory_queue) { // pętla po typach fabryk
			var factoryArr = selection.spec_ids[factory_queue.spec_id];
			if (!factoryArr) return;
			// var unitSpec = model.unitSpecs[factory_queue.spec_id];
			factory_queue.similarFactories.sortValuesSimple(function(factory) { return -factory.lastCopiedTime }); // najnowsze skopiowane najpierw
			console.log("before clearFactoryQueue", factory_queue.spec_id, factoryArr);
			var prom = clearFactoryQueue(factory_queue.spec_id, factoryArr, isShiftDown, worldView);
			// var prom = clearFactoryQueue(factory_queue.spec_id, factoryArr, isShiftDown, worldView).then(sleepFun(model.paste_sleep_val)).then(function () {
			// 	return clearFactoryQueue(factory_queue.spec_id, factoryArr, isShiftDown, worldView);
			// });
			for (var i = 0; i < factory_queue.similarFactories.length; i++) {
				var similar_factory_queue = factory_queue.similarFactories[i];
				if (!similar_factory_queue.build) continue;
				// prom.then(function () {
				// 	similar_factory_queue.build.promiseChain(function (buildUnit, i) {
				// 		return sleep(model.paste_sleep_val).then(function() {
				// 			return worldView.sendOrder(logRet({
				// 				units: factoryArr,
				// 				command: "factory_build",
				// 				spec: buildUnit.spec,
				// 				// queue: isShiftDown || i !== 0, // queue nie działa
				// 				count: buildUnit.count,
				// 			}));
				// 		})
				// 	});
				// });

				// similar_factory_queue.build.forEach(function (buildUnit, i) {
				// 	console.log("build", buildUnit.spec, buildUnit.count)
				// 	api.unit.build(buildUnit.spec, buildUnit.count, false);
				// });

				// prom.then(function () {
				// 	similar_factory_queue.build.promiseChain(function (buildUnit, i) {
				// 		console.log("build", buildUnit.spec, buildUnit.count);
				// 		return api.unit.build(buildUnit.spec, buildUnit.count, false);
				// 	});
				// });

				// prom.then(sleepFun(model.paste_sleep_val)).then(function () {
				// 	similar_factory_queue.build.forEach(function (buildUnit, i) {
				// 		console.log("build", buildUnit.spec, buildUnit.count);
				// 		return api.unit.build(buildUnit.spec, buildUnit.count, false);
				// 	});
				// });

				prom.then(function () {
					similar_factory_queue.build.forEach(function (buildUnit, i) {
						console.log("build", buildUnit.spec, buildUnit.count);
						return api.unit.build(buildUnit.spec, buildUnit.count, false);
					});
				});
				break;
			}
		});
	}

	// =================   Moves  ====================

	model.test_move = function() {
		var selection = model.selection();
		if (!selection) return;
		var units = _.flatten(_.toArray(selection.spec_ids));
		return api.getWorldView(0).sendOrder({
			units: units,
			command: "move",
			location: {
				planet: model.currentFocusPlanetId(),
				pos: [1,2,3],
			},
		});
	}

	// =================   Select closest   ====================

	var closestCountMax = 8;
	function selectNClosestEntities(N, filterFun) {
		return getUnitsSortedByDistanceToCamera(filterFun).then(function (unitStates) {
			mySelect.unitsById(unitStates.map(toId).slice(0,N));
			return unitStates;
		});
	}
	var isMobile = function(unitSpec) { return unitSpec.shortTypes.contains("Mobile") };
	for (var i = 1; i <= closestCountMax; i++) model["select_" + i + "_closest_units"] = selectNClosestEntities.bind(null, i, isMobile);

	var isStructure = function(unitSpec) { return unitSpec.shortTypes.contains("Structure") };
	for (var i = 1; i <= closestCountMax; i++) model["select_" + i + "_closest_structures"] = selectNClosestEntities.bind(null, i, isStructure);

	var isNonOrbitalFabber = function(unitSpec) { return unitSpec.shortTypes.contains("Fabber") && !unitSpec.shortTypes.contains("Orbital") };
	var isOrbitalFabber = function(unitSpec) { return unitSpec.shortTypes.contains("Fabber") && unitSpec.shortTypes.contains("Orbital") };
	function selectNClosestFabbers(N) {
		var zoomLevel = api.camera.getFocus(api.Holodeck.focused.id).zoomLevel();
		return getUnitsSortedByDistanceToCamera(zoomLevel === "orbital" || zoomLevel === "celestial" ? isOrbitalFabber : isNonOrbitalFabber).then(function (unitStates) {
			mySelect.unitsById(unitStates.map(toId).slice(0,N));
			return unitStates;
		});
	}
	for (var i = 1; i <= closestCountMax; i++) model["select_" + i + "_closest_fabbers"] = selectNClosestFabbers.bind(null, i);

	function selectNClosestIdleFabbers(N) {
		var zoomLevel = api.camera.getFocus(api.Holodeck.focused.id).zoomLevel();
		return getUnitsSortedByDistanceToCamera(zoomLevel === "orbital" || zoomLevel === "celestial" ? isOrbitalFabber : isNonOrbitalFabber).then(function (unitStates) {
			mySelect.unitsById(unitStates.filter(function(unitState) { return !unitState.orders }).map(toId).slice(0,N));
			return unitStates;
		});
	}
	for (var i = 1; i <= closestCountMax; i++) model["select_" + i + "_closest_idle_fabbers"] = selectNClosestIdleFabbers.bind(null, i);

	// =================   Miscellaneous selections  ====================

	var radarType = 0;
	model.cycle_radars = function() {
		radarType = (radarType + 1) % 2
		var planet_id = model.currentFocusPlanetId();
		if (radarType) {
			mySelect.unitsOnPlanet(planet_id, ["Recon","Structure"]); // ARKYD, Advanced Radar Satellite
			mySelect.unitsOnPlanet(planet_id, ["NukeDefense","Structure"], null, "add"); // Anti-nuke
			mySelect.unitsOnPlanet(planet_id, ["Defense", "Naval","Structure"], ["Land"], "add"); // Torpedo Launchers
		} else {
			mySelect.unitsOnPlanet(planet_id, ["Recon"], ["Structure"]); // Radars
			mySelect.unitsOnPlanet(planet_id, ["Amphibious","Heavy"], ["Structure"], "add"); // Manhattan
			mySelect.unitsOnPlanet(planet_id, ["Radar","RadarJammer"], ["Structure"], "add"); // Nyx
			mySelect.unitsOnPlanet(planet_id, ["Radar","Naval"], ["Structure"], "add"); // Stingray
		}
	}
	model.select_all_fabbers = function() {
		var zoomLevel = api.camera.getFocus(api.Holodeck.focused.id).zoomLevel();
		if (zoomLevel !== "orbital" && zoomLevel !== "celestial") {
			mySelect.unitsOnPlanet(model.currentFocusPlanetId(), "Fabber", "Orbital");
		} else {
			mySelect.unitsOnPlanet(model.currentFocusPlanetId(), ["Fabber", "Orbital"]);
		}
	}
	// Note this is global, whereas the default select fabbers is on screen only
	model.select_all_idle_fabbers = function() {
		var zoomLevel = api.camera.getFocus(api.Holodeck.focused.id).zoomLevel();
		if (zoomLevel !== "orbital" && zoomLevel !== "celestial") {
			mySelect.idleFabbers(model.currentFocusPlanetId(), null, "Orbital");
		} else {
			mySelect.idleFabbers(model.currentFocusPlanetId(), "Orbital");
		}
	}
	model.select_all_scouts = function() {
		mySelect.unitsOnPlanet(model.currentFocusPlanetId(), "Scout");
	}
	// No built-in way to check idle behaviour (idle fabbers/factories are hardcoded)
	model.select_all_idle_scouts = function() {
		var worldView = api.getWorldView(0);
		return worldView.getArmyUnits(model.armyIndex(), model.currentFocusPlanetId()).then(function (armyUnits) {
			var scoutIds = [];
			var keys = Object.keys(armyUnits)
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i]
				var unitSpec = model.unitSpecs[key]
				if (unitSpec.types.contains("UNITTYPE_Scout")) {
					scoutIds.push(armyUnits[key]);
				}
			}
			scoutIds = _.flatten(scoutIds)
			return worldView.getUnitState(scoutIds).then(function (scouts) {
				var idle_scouts = [];
				for (var i = 0; i < scouts.length; i++) {
					if (!scouts[i].orders) {
						idle_scouts.push(scoutIds[i]);
					}
				}
				mySelect.unitsById(idle_scouts);
				return idle_scouts;
			});
		});
	}
	model.select_all_repair = function() {
		var planet_id = model.currentFocusPlanetId();
		mySelect.unitsOnPlanet(planet_id, ["CannonBuildable", "Construction"], ["Fabber"]);
		mySelect.unitsOnPlanet(planet_id, ["Air", "MissileDefense"], null, "add");
	}

	// ===============   Selection Edit   ===================

	model.select_closest_unit_in_selection = function() {
		var selection = model.selection();
		if (!selection) return;
		var camPos = api.camera.getFocus(api.Holodeck.focused.id).location();
		// var camPosN = normalizeVector(camPos.x, camPos.y, camPos.z); // normalize because the camera constantly shift between surface position and normalized position
		var units = _.flatten(_.toArray(selection.spec_ids));
		return api.getWorldView(0).getUnitState(units).then(function (unitStates) {
			unitStates.forEach(function (unitState, i) {
				unitState.id = units[i]
				var unitPos = unitState.pos;
				// var unitPosN = normalizeVector(unitPos[0], unitPos[1], unitPos[2]);
				// unitState.distanceToCamera = distance3d(camPosN, unitPosN);
				unitState.distanceToCamera = distance3d(camPos, unitPos);
			})
			unitStates.sortValuesSimple(function (unitState) { return unitState.distanceToCamera })
			mySelect.unitsById(unitStates.map(toId).slice(0,1));
			return unitStates;
		});
	}

	// Artillery (long range mobile units)
	model.only_artillery_in_selection     = function() { return mySelect.unitsfromSelection("Artillery") }
	model.remove_artillery_from_selection = function() { return mySelect.unitsfromSelection("Artillery", null, "remove") }

	// Mobile anti-air
	model.only_anti_air_in_selection   = function() { return mySelect.unitsfromSelection("AirDefense") }
	model.remove_anti_air_in_selection = function() { return mySelect.unitsfromSelection("AirDefense", null, "remove") }

	// Repair units
	model.only_repair_in_selection = function() {
		mySelect.captureGroup(0);
		mySelect.recallGroupWithTypeFilter(0, ["CannonBuildable", "Construction"], ["Fabber"]);
		mySelect.recallGroupWithTypeFilter(0, ["Air", "MissileDefense"], null, "add");
		mySelect.forgetGroup(0);
	}
	model.remove_repair_from_selection = function() {
		mySelect.unitsfromSelection(["CannonBuildable", "Construction"], null, "remove");
		mySelect.unitsfromSelection(["Air", "MissileDefense"], null, "remove");
	}

	api.Panel.message("", "inputmap.reload");
	console.log("Bye live_game.js Chrysaloid!")
})()
