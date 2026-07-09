function commander() { return engine.call("select.commander"); }
function armyCommanders(armyId) { return engine.call("select.armyCommanders", armyId); }
function idleFabber() { return engine.call("select.idleFabber"); }
function allCombatUnits() { return engine.call("select.allCombatUnits"); }
function allFabbers() { return engine.call("select.allFabbers"); }
function allFactories() { return engine.call("select.allFactories"); }
function allIdleFactories() { return engine.call("select.allIdleFactories"); }
function allLandCombatUnits() { return engine.call("select.allLandCombatUnits"); }
function allAirCombatUnits() { return engine.call("select.allAirCombatUnits"); }
function allNavalCombatUnits() { return engine.call("select.allNavalCombatUnits"); }
function allCombatUnitsOnScreen() { return engine.call("select.allCombatUnitsOnScreen"); }
function allFabbersOnScreen() { return engine.call("select.allFabbersOnScreen"); }
function allFactoriesOnScreen() { return engine.call("select.allFactoriesOnScreen"); }
function allIdleFactoriesOnScreen() { return engine.call("select.allIdleFactoriesOnScreen"); }
function allLandCombatUnitsOnScreen() { return engine.call("select.allLandCombatUnitsOnScreen") }
function allAirCombatUnitsOnScreen() { return engine.call("select.allAirCombatUnitsOnScreen") }
function allNavalCombatUnitsOnScreen() { return engine.call("select.allNavalCombatUnitsOnScreen") }
function unitsById(unitIds, tryRepeatedly) {
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
}
function fromSelectionWithTypeFilter(acceptance_filter, rejection_filter, force_remove) {
	return callWithFilter('select.fromCurrentSelectionWithTypeFilter', null, acceptance_filter, rejection_filter, force_remove);
}
function onScreenWithTypeFilter(planet_id, acceptance_filter, rejection_filter) {
	return callWithFilter('select.unitsOnScreenWithTypeFilter', planet_id, acceptance_filter, rejection_filter);
}
function onPlanetWithTypeFilter(planet_id, acceptance_filter, rejection_filter) {
	return callWithFilter('select.unitsOnPlanetWithTypeFilter', planet_id, acceptance_filter, rejection_filter);
}
function idleFabbers(planet_id) {
	return callWithFilter('select.idleFabbersWithTypeFilter', planet_id, [], []);
}
function idleFactories(planet_id) {
	return callWithFilter('select.idleFactoriesWithTypeFilter', planet_id, [], []);
}
function idleFabbersWithTypeFilter(planet_id, filter) {
	return callWithFilter('select.idleFabbersWithTypeFilter', planet_id, filter, []);
}
function idleFactoriesWithTypeFilter(planet_id, filter) {
	return callWithFilter('select.idleFactoriesWithTypeFilter', planet_id, filter, []);
}
function idleFabbersOnScreenWithTypeFilter(planet_id, filter) {
	return callWithFilter('select.idleFabbersOnScreenWithTypeFilter', planet_id, filter, []);
}
function idleFactoriesOnScreenWithTypeFilter(planet_id, filter) {
	return callWithFilter('select.idleFactoriesOnScreenWithTypeFilter', planet_id, filter, []);
}
function captureGroup(group) {
	var groups = activeControlGroups();
	groups[group] = true;
	activeControlGroups(groups);
	return engine.call("select.captureGroup", typeof (group) == 'number' ? group : 0);
}
function recallGroup(group) {
	if (model['endCommandMode'])
			model['endCommandMode']();

	var option = Mousetrap.isShiftDown() ? 'add' : 'default';
	return engine.call("select.recallGroup", typeof (group) == 'number' ? group : 0, option);
}
function recallGroupWithTypeFilter(group, filter) {
	return callWithFilter('select.recallGroupWithTypeFilter', group, filter, []);
}
function forgetGroup(group) {
	return engine.call("select.forgetGroup", typeof (group) == 'number' ? group : 0);
}
function empty() { return engine.call('select.empty'); }
