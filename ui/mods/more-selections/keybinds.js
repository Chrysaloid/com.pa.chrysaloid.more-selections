(function() { // Sandbox test z dzisiaj
	Object.defineProperty(Array.prototype, "contains", {
		value: function (value) {
			return this.indexOf(value) !== -1;
		},
	});
	Object.defineProperty(Array.prototype, "sortValuesSimple", {
		value: function (getValue) {
			return getValue ? this.sort(function (a, b) {
				var a1 = getValue(a);
				var b1 = getValue(b);
				if (a1 < b1) return -1;
				if (a1 > b1) return 1;
				return 0;
			}) : this.sort(function (a, b) {
				if (a < b) return -1;
				if (a > b) return 1;
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
	Object.defineProperty(String.prototype, "toTitleCase", {
		value: function () { return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase(); },
	});

	function log(val) {
		console.log(val);
	}

	log("Hello keybind Chrysaloid!");

	var isNodeJS = typeof process !== "undefined" && process.versions && process.versions.node;
	var display_group = "MORE SELECTIONS";
	var display_sub_group = "General";
	var last_display_sub_group;
	var keyBind = function(name, dflt) {
		if (isNodeJS) {
			if (last_display_sub_group !== display_sub_group) {
				last_display_sub_group = display_sub_group
				log("#", display_sub_group);
			}
			log("-", name.replace(/_/g, " ").toTitleCase());
		} else {
			action_sets.gameplay[name] = function () {
				var myFun = model[name];
				if (myFun) myFun.apply(this, arguments);
			};
			api.settings.definitions.keyboard.settings[name] = {
				title: name.replace(/_/g, " "),
				type: "keybind",
				set: "gameplay",
				display_group: display_group,
				display_sub_group: display_sub_group,
				default: dflt || "",
			};
		}
	};

	display_sub_group = "Factory managment";
	keyBind("copy_factory_queue");
	keyBind("paste_factory_queue_strict");
	keyBind("paste_factory_queue_unified");
	keyBind("print_saved_factory_queue_to_chat");
	keyBind("print_selected_factory_queue_to_chat", "ctrl+f8");
	keyBind("print_selected_factory_queue_with_spec_ids_to_chat", "ctrl+f9");

	display_sub_group = "Locate units";
	keyBind("ping_last_known_enemy_commanders_positions");

	// display_sub_group = "Moves";
	// keyBind("test_move");

	display_sub_group = "Miscellaneous selections";
	keyBind("cycle_radars");
	keyBind("select_all_fabbers");
	keyBind("select_all_idle_fabbers");
	keyBind("select_all_scouts");
	keyBind("select_all_idle_scouts");
	keyBind("select_all_repair");

	display_sub_group = "Edit selection";
	keyBind("select_closest_unit_in_selection");
	keyBind("only_artillery_in_selection");
	keyBind("remove_artillery_from_selection");
	keyBind("only_anti_air_in_selection");
	keyBind("remove_anti_air_from_selection");
	keyBind("only_repair_in_selection");
	keyBind("remove_repair_from_selection");

	var closestCountMax = 15;
	for (var group of [
		"idle_fabbers",
		"fabbers",
		"factories",
		"idle_astraeuses",
		"idle_pelicans",
		"combat_units",
	]) {
		display_sub_group = "Selection - closest " + group.replace(/_/g, " ");
		for (var i = 1; i <= closestCountMax; i++) keyBind("select_" + i + "_closest_" + group);
	}
})();
