// function (aaa) { return aaa };
(function() {
	console.log("Hello live_game.js Chrysaloid!")
	function identity(value) {
		return value;
	}

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
			unitSpec.shortTypes = {};
			if (unitSpec.types) {
				unitSpec.types.forEach(function (type) { unitSpec.shortTypes[type.slice(9)] = true; }); // "UNITTYPE_".length === 9
			}
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

	function getArmyUnitIds(filterFun, planetIndex, armyIndex) {
		return api.getWorldView(0).getArmyUnits(armyIndex === undefined ? model.armyIndex() : armyIndex, planetIndex === undefined ? model.currentFocusPlanetId() : planetIndex).then(function (armyUnits) {
			if (filterFun) {
				var units = [];
				var unitSpecs = model.unitSpecs;
				Object.keys(armyUnits).forEach(function (key) {
					if (filterFun(unitSpecs[key])) units.push(armyUnits[key]); // creating array of arrays because armyUnits[key] is array
				});
				return _.flatten(units);
			} else {
				return _.flatten(_.toArray(armyUnits));
			}
		});
	}
	// function getArmyUnitStates(filterFun, planetIndex, armyIndex) {
	// 	return getArmyUnitIds(filterFun, planetIndex, armyIndex).then(function (unitIds) {
	// 		return api.getWorldView(0).getUnitState(unitIds).then(function (unitStates) {
	// 			unitStates.forEach(function (unitState, i) {
	// 				unitState.id = unitIds[i];
	// 			});
	// 			return unitStates;
	// 		});
	// 	});
	// }
	function getArmyUnitStates(filterFun, planetIndex, armyIndex) {
		return new Promise(function (resolve) {
			getArmyUnitIds(filterFun, planetIndex, armyIndex).then(function (unitIds) {
				api.getWorldView(0).getUnitState(unitIds).then(function (unitStates) {
					unitStates.forEach(function (unitState, i) {
						unitState.id = unitIds[i];
					});
					resolve(unitStates);
				});
			});
		});
	}
	function defaultFilterFun(unitSpec) {
		return true;
	}
	function getUnitsSortedByDistanceToCamera(filterFun, armyIndex) {
		var camPos = api.camera.getFocus(api.Holodeck.focused.id).location();
		// camPos = [camPos.x, camPos.y, camPos.z];
		// normalize because the camera constantly shift between surface position and normalized position
		// normalization means casting a point onto a unit sphere in the center of the planet
		// that means that orbital units have the same chance of being selected
		var camPosN = normalizeVector(camPos.x, camPos.y, camPos.z);
		return getArmyUnitStates(filterFun, model.currentFocusPlanetId(), armyIndex).then(function (unitStates) {
			unitStates.forEach(function (unitState, i) {
				var unitPos = unitState.pos;
				var unitPosN = normalizeVector(unitPos[0], unitPos[1], unitPos[2]);
				unitState.distanceToCamera = distance3d(camPosN, unitPosN);
				// unitState.distanceToCamera = distance3d(camPos, unitPos);
			});
			unitStates.sortValuesSimple(getProp("distanceToCamera"))
			return unitStates;
		});
	}
	function toId(elem) {
		return elem.id;
	}
	function getProp(value) {
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

	// =================   Factory managment  ====================

	function clearFactoryQueue(factorySpec, factoryArr, isShiftDown, worldView) {
		if (isShiftDown) return Promise.resolve();
		return whileAsync(function () {
			return worldView.getUnitState(factoryArr).then(function (factoryStats) {
				return factoryStats.find(function (factoryStat) {
					return _.isArray(factoryStat.build);
				});
			});
		}, function (factoryStat) {
			return Promise.all(factoryStat.build.map(function (buildUnit) { // map tworzy tutaj array of promises
				return api.unit.cancelBuild(buildUnit.spec, buildUnit.count, false);
			}));
		});
	}
	// var isFactory = unitTypeMatch("Factory -Nuke -Defense -PlanetEngine");
	var factory_queues = [
		{
			"name": "Air Factory",
			"spec_id": "/pa/units/air/air_factory/air_factory.json",
			"similarFactories": ["Air Factory", "Advanced Air Factory"],
		},
		{
			"name": "Advanced Air Factory",
			"spec_id": "/pa/units/air/air_factory_adv/air_factory_adv.json",
			"similarFactories": ["Advanced Air Factory", "Air Factory"],
		},
		{
			"name": "Bot Factory",
			"spec_id": "/pa/units/land/bot_factory/bot_factory.json",
			"similarFactories": ["Bot Factory", "Advanced Bot Factory", "Unit Cannon"],
		},
		{
			"name": "Advanced Bot Factory",
			"spec_id": "/pa/units/land/bot_factory_adv/bot_factory_adv.json",
			"similarFactories": ["Advanced Bot Factory", "Bot Factory", "Unit Cannon"],
		},
		{
			"name": "Vehicle Factory",
			"spec_id": "/pa/units/land/vehicle_factory/vehicle_factory.json",
			"similarFactories": ["Vehicle Factory", "Advanced Vehicle Factory", "Unit Cannon"],
		},
		{
			"name": "Advanced Vehicle Factory",
			"spec_id": "/pa/units/land/vehicle_factory_adv/vehicle_factory_adv.json",
			"similarFactories": ["Advanced Vehicle Factory", "Vehicle Factory", "Unit Cannon"],
		},
		{
			"name": "Naval Factory",
			"spec_id": "/pa/units/sea/naval_factory/naval_factory.json",
			"similarFactories": ["Naval Factory", "Advanced Naval Factory"],
		},
		{
			"name": "Advanced Naval Factory",
			"spec_id": "/pa/units/sea/naval_factory_adv/naval_factory_adv.json",
			"similarFactories": ["Advanced Naval Factory", "Naval Factory"],
		},
		{
			"name": "Orbital Launcher",
			"spec_id": "/pa/units/orbital/orbital_launcher/orbital_launcher.json",
			"similarFactories": ["Orbital Launcher", "Orbital Factory"],
		},
		{
			"name": "Orbital Factory",
			"spec_id": "/pa/units/orbital/orbital_factory/orbital_factory.json",
			"similarFactories": ["Orbital Factory", "Orbital Launcher"],
		},
		{
			"name": "Unit Cannon",
			"spec_id": "/pa/units/land/avatar_factory/avatar_factory.json",
			"similarFactories": ["Unit Cannon", "Advanced Vehicle Factory", "Vehicle Factory", "Advanced Bot Factory", "Bot Factory"],
		},
		{
			"name": "Avatar Factory",
			"spec_id": "/pa/units/land/avatar_factory/avatar_factory.json",
			"similarFactories": ["Advanced Naval Factory", "Naval Factory", "Orbital Launcher", "Orbital Factory", "Air Factory", "Advanced Air Factory", "Unit Cannon", "Advanced Vehicle Factory", "Vehicle Factory", "Advanced Bot Factory", "Bot Factory"],
		},
	];
	var factory_spec_ids = {};
	var specSuffix = Object.keys(model.unitSpecs).some(function (key) { return key.endsWith(".player") }) ? ".player" : "";
	factory_queues.forEach(function (factory_queue) {
		if (specSuffix) factory_queue.spec_id += specSuffix;
		factory_spec_ids[factory_queue.spec_id] = null;
		factory_queue.similarFactories = factory_queue.similarFactories.map(function(factoryName) {
			return factory_queues.find(function(factory) { return factory.name === factoryName });
		});
		factory_queue.lastCopiedTime = 0;
	});
	model.copy_factory_queue = function() {
		var message = "Select a factory to copy its queue";
		var selection = getSelectionOrHover(message);
		if (!selection) return;
		if (!factoriesInSelection(selection, message)) return;
		var armyIndex = model.armyIndex();
		var worldView = api.getWorldView(0);
		factory_queues.forEach(function (factory_queue) { // pętla po typach fabryk
			var unitArr = selection.spec_ids[factory_queue.spec_id];
			if (!unitArr) return;
			worldView.getUnitState(unitArr[0]).then(function (unit) {
				if (!_.isArray(unit.build)) unit.build = false;
				if (unit.army !== armyIndex) return;
				factory_queue.build = unit.build;
				factory_queue.lastCopiedTime = performance.now();
			});
		});
	}
	var pasteMessage = "Select a factory to paste the copied queue";
	model.paste_factory_queue_strict = function() {
		var isShiftDown = Mousetrap.isShiftDown();
		var selection = getSelectionOrHover(pasteMessage);
		if (!selection) return;
		if (!factoriesInSelection(selection, pasteMessage)) return;
		var worldView = api.getWorldView(0);
		factory_queues.forEach(function (factory_queue) { // pętla po typach fabryk
			var factoryArr = selection.spec_ids[factory_queue.spec_id];
			if (!factoryArr) return;
			var prom = clearFactoryQueue(factory_queue.spec_id, factoryArr, isShiftDown, worldView);
			if (!factory_queue.build) return;
			prom.then(function () {
				factory_queue.build.forEach(function (buildUnit, i) {
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
		var worldView = api.getWorldView(0);
		factory_queues.forEach(function (factory_queue) { // pętla po typach fabryk
			var factoryArr = selection.spec_ids[factory_queue.spec_id];
			if (!factoryArr) return;
			factory_queue.similarFactories.sortValuesSimple(function(factory) { return -factory.lastCopiedTime }); // najnowiej skopiowane najpierw
			var prom = clearFactoryQueue(factory_queue.spec_id, factoryArr, isShiftDown, worldView);
			for (var i = 0; i < factory_queue.similarFactories.length; i++) {
				var similar_factory_queue = factory_queue.similarFactories[i];
				if (!similar_factory_queue.build) continue;
				prom.then(function () {
					similar_factory_queue.build.forEach(function (buildUnit, i) {
						return api.unit.build(buildUnit.spec, buildUnit.count, false);
					});
				});
				break;
			}
		});
	}
	model.print_saved_factory_queue_to_chat = function() {
		logChatMessage(
			factory_queues.map(function (factory_queue) { // pętla po typach fabryk
				if (!factory_queue.build) return;
				var agregatedUnits = {}
				factory_queue.build.forEach(function (buildUnit) {
					var count = agregatedUnits[buildUnit.spec] || 0;
					agregatedUnits[buildUnit.spec] = buildUnit.count + count;
				});
				return factory_queue.name + ": " + Object.keys(agregatedUnits).sortValuesSimple().map(function (key) {
					var unitSpec = model.unitSpecs[key];
					var count = agregatedUnits[key];
					return count + " * " + unitSpec.unit_name.replace("!LOC:", "");
				}).join(", ");
			}).filter(Boolean).join(" | ")
			|| "No queue was copied"
		);
	}

	// =================   Locate units   ====================

	var isCommander = unitTypeMatch("Commander");
	model.ping_last_known_enemy_commanders_positions = function() {
		var myIdx = model.armyIndex();
		var armyCount = model.armyCount();
		var promisedCommanders = [];
		model.celestialViewModels().forEach(function (planet, j) {
			if (planet.dead() || planet.isSun()) return;
			for (var i = 0; i < armyCount; i++) {
				if (i === myIdx) continue;
				promisedCommanders.push(getArmyUnitStates(isCommander, j, i).then(function (unitStates) { // unitStates will be filtered, if there are no commanders the array will be empty
					return Promise.all(unitStates.map(function (unitState) {
						return api.getWorldView(0).sendOrder({
							units: unitState.id,
							command: "ping",
							location: {
								planet: j,
								pos: unitState.pos,
							},
						});
					}));
				}));
			}
		});
		return Promise.all(promisedCommanders).then(function (commanders) {
			if (!commanders.some(getProp("length"))) logChatMessage("No enemy commanders have been seen in this game yet");
			return commanders;
		})
	}

	// =================   Moves   ====================

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

	var hasOrders = function(unitState) { return unitState.orders };
	var hasNoOrders = function(unitState) { return !unitState.orders };
	function unitTypeMatch(typeExpression) {
		var orArr = typeExpression.split("|").filter(Boolean).map(function (andArr) {
			return andArr.split(" ").filter(Boolean).map(function (unitType) {
				return [unitType.trim().replace(/\W+/g, ""), unitType.trim().startsWith("-") ? undefined : true]
			});
		});

		if (!orArr.length) return null;

		if (orArr.length === 1) {
			var andArr = orArr[0];
			if (andArr.length === 1) {
				var shortType = andArr[0][0];
				var matchVal = andArr[0][1];
				return function (unitSpec) { return unitSpec.shortTypes[shortType] === matchVal };
			}
			return function(unitSpec) {
				var shortTypes = unitSpec.shortTypes;
				// for (var expr of andArr) { // for..of is slower in this old JS version
				// 	if (shortTypes[expr[0]] !== expr[1]) {
				// 		return false;
				// 	}
				// }
				// return true;
				return !andArr.find(function (expr) { return shortTypes[expr[0]] !== expr[1] }); // find not matching type and if you do that's bad, and if you don't that's good
			};
		}

		return function(unitSpec) {
			// var subresult;
			var shortTypes = unitSpec.shortTypes;
			return orArr.find(function (andArr) { // find first truthy value, orArr is array of arrays and arrays are always truthy, if not found returns undefined that is falsy
				// subresult = true;
				// for (var expr of andArr) {
				// 	if (shortTypes[expr[0]] !== expr[1]) {
				// 		subresult = false;
				// 		break;
				// 	}
				// }
				// if (subresult) return true;
				return !andArr.find(function (expr) { return shortTypes[expr[0]] !== expr[1] })
			});
		};
	}
	model.testUnitTypeMatch = function (typeExpression) {
		log(
			_.unique(
				_.values(model.unitSpecs)
				.filter(unitTypeMatch(typeExpression))
				.map(function(unitSpec) { return unitSpec.name.replace("!LOC:", "") })
			).sortValuesSimple().join("\n")
		);
	}
	var closestCountMax = 14;
	function selectNClosestEntities(N, filterFun) {
		return getUnitsSortedByDistanceToCamera(filterFun).then(function (unitStates) {
			mySelect.unitsById(unitStates.map(toId).slice(0,N));
			return unitStates;
		});
	}
	// var isCombat = function (unitSpec) { return unitSpec.shortTypes["Mobile"] && !unitSpec.shortTypes["Fabber"] };
	var isCombat = unitTypeMatch("Mobile -Fabber -Commander");
	for (var i = 1; i <= closestCountMax; i++) model["select_" + i + "_closest_combat_units"] = selectNClosestEntities.bind(null, i, isCombat);

	var isFactory = unitTypeMatch("Factory");
	for (var i = 1; i <= closestCountMax; i++) model["select_" + i + "_closest_factories"] = selectNClosestEntities.bind(null, i, isFactory);

	var isNonOrbitalFabber = unitTypeMatch("Fabber -Orbital");
	var isOrbitalFabber = unitTypeMatch("Fabber Orbital");
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
			mySelect.unitsById(unitStates.filter(hasNoOrders).map(toId).slice(0,N));
			return unitStates;
		});
	}
	for (var i = 1; i <= closestCountMax; i++) model["select_" + i + "_closest_idle_fabbers"] = selectNClosestIdleFabbers.bind(null, i);

	// =================   Miscellaneous selections  ====================

	var radarType = 0;
	model.cycle_radars = function() {
		radarType = (radarType + 1) % 2
		var planet_id = model.currentFocusPlanetId();
		if (radarType) { // structure
			mySelect.unitsOnPlanet(planet_id, ["Recon", "Structure"]); // Radars
			mySelect.unitsOnPlanet(planet_id, ["NukeDefense", "Structure"], null, "add"); // Anti-nuke
			mySelect.unitsOnPlanet(planet_id, ["Defense", "Naval", "Structure"], ["Land"], "add"); // Torpedo Launchers
		} else { // mobile
			mySelect.unitsOnPlanet(planet_id, ["Recon"], ["Structure"]); // ARKYD, Advanced Radar Satellite
			mySelect.unitsOnPlanet(planet_id, ["Amphibious", "Heavy"], ["Structure"], "add"); // Manhattan
			mySelect.unitsOnPlanet(planet_id, ["Radar", "RadarJammer"], ["Structure"], "add"); // Nyx
			mySelect.unitsOnPlanet(planet_id, ["Radar", "Naval"], ["Structure"], "add"); // Stingray
		}
	}
	model.select_all_fabbers = function() {
		var zoomLevel = api.camera.getFocus(api.Holodeck.focused.id).zoomLevel();
		if (zoomLevel !== "orbital" && zoomLevel !== "celestial") {
			return mySelect.unitsOnPlanet(model.currentFocusPlanetId(), "Fabber", "Orbital");
		} else {
			return mySelect.unitsOnPlanet(model.currentFocusPlanetId(), ["Fabber", "Orbital"]);
		}
	}
	// Note this is global, whereas the default select fabbers is on screen only
	model.select_all_idle_fabbers = function() {
		var zoomLevel = api.camera.getFocus(api.Holodeck.focused.id).zoomLevel();
		if (zoomLevel !== "orbital" && zoomLevel !== "celestial") {
			return mySelect.idleFabbers(model.currentFocusPlanetId(), null, "Orbital");
		} else {
			return mySelect.idleFabbers(model.currentFocusPlanetId(), "Orbital");
		}
	}
	model.select_all_scouts = function() {
		return mySelect.unitsOnPlanet(model.currentFocusPlanetId(), "Scout");
	}
	// No built-in way to check idle behaviour (idle fabbers/factories are hardcoded)
	var isScout = unitTypeMatch("Scout");
	model.select_all_idle_scouts = function() {
		return getArmyUnitStates(isScout).then(function (unitStates) {
			var idle_scouts = unitStates.filter(hasNoOrders).map(toId);
			mySelect.unitsById(idle_scouts);
			return idle_scouts;
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
