const model = {
	lobbyId: undefined,
	gameTicket: undefined,
	gameHostname: undefined,
	gamePort: undefined,
	isLocalGame: undefined,
	gameModIdentifiers: undefined,
	serverType: undefined,
	serverSetup: undefined,
	gameType: undefined,
	gameOptions: {},
	updateGameOptions: function (options) {
		if (!options) {
			return;
		}

		const gameOptions = self.gameOptions;

		if (!gameOptions) {
			self.gameOptions = new GameOptionModel(options);
			return;
		}

		if (options.game_type) {
			gameOptions.game_type(options.game_type);
			model.gameType(options.game_type);
		}
		if (options.dynamic_alliances) {
			gameOptions.dynamic_alliances(options.dynamic_alliances);
		}
		if (options.dynamic_alliance_victory) {
			gameOptions.dynamic_alliance_victory(options.dynamic_alliance_victory);
		}
		if (options.land_anywhere) {
			gameOptions.land_anywhere(options.land_anywhere);
		}
		if (options.listen_to_spectators) {
			gameOptions.listenToSpectators(options.listen_to_spectators);
		}

		if (options.sandbox) {
			gameOptions.sandbox(options.sandbox);
			model.sandbox(options.sandbox);
		}
	},
	showPopUp: undefined,
	popUp: function (params) {
		const messages = params.messages || [params.message || loc("!LOC:Exit Game?")];
		const buttons = params.buttons || [
			"!LOC:Yes",
			"!LOC:Cancel",
		];
		self.showPopUp(true);
		api.Panel.update();
		return api.panels.popup.query("show", {
			messages: messages,
			textfield: params.textfield,
			filename: params.filename,
			defaultText: params.defaultText,
			buttons: buttons,
		}).then(function (result) {
			self.showPopUp(false);
			Mousetrap.resetRepeatState();
			return result;
		});
	},
	messageDeferred: undefined,
	messageState: undefined,
	setMessage: function (params) {
		if (_.isString(params)) params = { message: params };
		else if (!_.isObject(params)) params = {};
		params.button = params.button || "";
		self.messageState(params);
		self.messageDeferred($.Deferred());
		return self.messageDeferred();
	},
	showMessage: undefined,
	showSettings: undefined,
	showPlayerGuide: undefined,
	toggleShowPlayerGuide: function () {
		self.showPlayerGuide(!self.showPlayerGuide());
	},
	showGameLoading: undefined,
	updateGameLoading: function () {
		const loadingPanel = api.panels.building_planets;
		if (loadingPanel) loadingPanel.message("toggle", { show: self.showGameLoading() });
	},
	mode: undefined,
	serverMode: undefined,
	paused: undefined,
	restart: undefined,
	saving: undefined,
	viewReplay: undefined,
	malformed: undefined,
	showPause: undefined,
	minValidTime: undefined,
	maxValidTime: undefined,
	ranked: undefined,
	allowCustomFormations: undefined,
	toggleCustomFormations: function () { self.allowCustomFormations(!self.allowCustomFormations()) },
	lastSceneUrl: undefined,
	cheatAllowChangeVision: undefined,
	cheatAllowChangeControl: undefined,
	cheatAllowCreateUnit: undefined,
	cheatAllowModDataUpdates: undefined,
	gwCampaignRole: undefined,
	uberId: undefined,
	haveUberNet: undefined,
	uberNetRegions: undefined,
	reviewMode: undefined,
	forceResumeAfterReview: undefined,
	economyHandicaps: undefined,
	armyId: undefined,
	players: undefined,
	originalArmyIndex: undefined,
	armyIndex: undefined,
	defeated: undefined,
	playerWasAlwaysSpectating: undefined,
	singleHumanPlayer: undefined,
	noHumanPlayers: undefined,
	sendablePlayers: undefined,
	playerData: undefined,
	player: undefined,
	playerWasInTeam: undefined,
	playerInTeam: undefined,
	playerName: undefined,
	gameOver: undefined,
	showGameOver: undefined,
	signalShowGameOver: function (value) {
		self.showGameOver(value);
	},
	showDefeatPending: undefined,
	baseGameOverState: undefined,
	recordGameOver: undefined,
	gameOverState: undefined,
	gameOverDelay: undefined,
	showDefeat: function () {
		self.baseGameOverState({
			defeated: true,
			auto_show: true,
			always_spectating: self.playerWasAlwaysSpectating(),
			ranked: self.gameOptions.isLadder1v1(),
		});
		delayShowGameOver();
		self.gamestatsPanelIsOpen(false);
		self.showTimeControls(false);
		self.showDefeatPending(true);
	},
	clearDefeat: function () {
		self.baseGameOverState({
			defeated: false,
			auto_show: false,
			always_spectating: self.playerWasAlwaysSpectating(),
			ranked: self.gameOptions.isLadder1v1(),
		});
		self.gamestatsPanelIsOpen(false);
		self.showTimeControls(false);
	},
	showGameComplete: function () {
		self.baseGameOverState({
			game_over: true,
			always_spectating: self.playerWasAlwaysSpectating(),
			defeated: self.defeated(),
			open: self.showGameOver() || self.showDefeatPending(),
			auto_show: !(self.gamestatsPanelIsOpen() || self.showTimeControls()),
			ranked: self.gameOptions.isLadder1v1(),
		});
		delayShowGameOver();
	},
	sandbox: undefined,
	devMode: undefined,
	showDevControls: undefined,
	transitPrimaryMessage: undefined,
	transitSecondaryMessage: undefined,
	transitDestination: undefined,
	transitDelay: undefined,
	userTriggeredDisconnect: undefined,
	celestialControlModel: { actionsList:["do_nothing", "change_orbit", "smash_planet", "fire_weapon"] },
	celestialControlActive: undefined,
	systemName: undefined,
	celestialViewModels: undefined,
	startingPlanetBiome: undefined,
	cameraFocus: {},
	selectedCelestialIndex: undefined,
	selectSun: function () {
		model.holodeck.focus();
		api.camera.setZoom("celestial", false);
	},
	isSunSelected: undefined,
	hoverCelestialIndex: undefined,
	chatSelected: undefined,
	teamChat: undefined,
	planetIndexToThrustControlMap: undefined,
	planetIndexToWeaponControlMap: undefined,
	planetIndexToCelestialStatusMap: undefined,
	playerContactMap: undefined,
	showAllAvailableVisionFlags: undefined,
	visionSelectAll: function (from_server) {
		let i;
		const flags = [];

		const prev = _.clone(self.playerVisionFlags());

		for (i = 0; i < self.players().length; i++) flags.push(1);

		self.playerVisionFlags([]);
		self.playerVisionFlags(flags);
		self.showAllAvailableVisionFlags(true);

		if (!_.isEqual(prev, self.playerVisionFlags()) && !from_server) {
			self.send_message("change_vision_flags", { vision_flags: flags });
			engine.call("vision.setVisionMask", JSON.stringify(flags));
		}
	},
	visionSelect: function (index, event) {
		const flags = [];
		let i;

		const prev = _.clone(self.playerVisionFlags());

		for (i = 0; i < self.players().length; i++) {
			// If the shift key is held down add the player to the list of visible armies.
			if (event.shiftKey) {
				const idx = self.playerVisionFlags()[i] ? 1 : 0;
				const idxFlipped = self.playerVisionFlags()[i] ? 0 : 1;
				flags.push(i === index ? idxFlipped : idx);
			} else {
				flags.push(i === index ? 1 : 0);
			}
		}

		self.playerVisionFlags([]);
		self.playerVisionFlags(flags);
		self.showAllAvailableVisionFlags(false);

		if (!_.isEqual(prev, self.playerVisionFlags())) {
			self.send_message("change_vision_flags", { vision_flags: flags });
			engine.call("vision.setVisionMask", JSON.stringify(flags));
		}
	},
	playerVisionFlags: undefined,
	availableVisionFlags: undefined,
	showPlayerVisionFlags: undefined,
	playerControlFlags: undefined,
	showPlayerControlFlags: undefined,
	controlSingleArmy: function () {
		let i;
		const armies = self.players();
		let isPlayerArmy;

		for (i = 0; i < self.armyCount(); i++) {
			isPlayerArmy = (self.armyId() === armies[i].id);
			self.playerVisionFlags()[i] = isPlayerArmy;
			self.playerControlFlags()[i] = isPlayerArmy;
		}

		self.playerVisionFlags.notifySubscribers();
		self.playerControlFlags.notifySubscribers();

		self.send_message("change_control_flags", { control_flags: self.playerControlFlags() });
		self.send_message("change_vision_flags", { vision_flags: self.playerVisionFlags() });
	},
	observerModeCalledOnce: undefined,
	startObserverMode: function () {
		let i;
		let v_flags = [];
		const c_flags = [];

		if (self.observerModeCalledOnce() && self.mode() !== "replay") return;

		// currently only the playing state on the server send available vision bits
		if (self.mode() === "game_over" || self.mode() === "replay") {
			for (i = 0; i < self.armyCount(); i++) v_flags.push(1);
			self.availableVisionFlags(v_flags);
			v_flags = [];
		}

		for (i = 0; i < self.armyCount(); i++) {
			self.playerVisionFlags()[i] = self.availableVisionFlags()[i];
			self.playerControlFlags()[i] = false;

			v_flags.push(self.availableVisionFlags()[i] ? 1 : 0);
			c_flags.push(0);
		}

		self.playerVisionFlags.notifySubscribers();
		self.playerControlFlags.notifySubscribers();
		self.showAllAvailableVisionFlags(true);

		self.send_message("change_control_flags", { control_flags: self.playerControlFlags() });
		self.send_message("change_vision_flags", { vision_flags: self.playerVisionFlags() });

		self.reviewMode(true);
		self.observerModeCalledOnce(true);
	},
	canSave: undefined,
	showTimeControls: undefined,
	onShowTimeControls: function (value) {
		if (!value && (self.defeated() || self.gameOver())) api.panels.game_over_panel.query("ready").then(function (ready) {
			if (ready) self.showGameOver(true);
		});
	},
	toggleTimeControls: function () {
		self.showTimeControls(!self.showTimeControls());
	},
	timeBarState: undefined,
	controlTime: function (value) {
		if (Boolean(value) === Boolean(self.showTimeControls())) return;

		if (value) {
			self.showTimeControls(true);
			api.time.control();
		} else {
			self.showTimeControls(false);
			api.time.resume();
		}
	},
	resumeIfNotReview: function () {
		if ((!self.reviewMode()) || self.forceResumeAfterReview()) {
			api.time.resume();
		}
	},
	menuIsOpen: undefined,
	showMenu: undefined,
	showSelectionBar: undefined,
	idleTime: 6,
	timedOut: undefined,
	updateIdleTimer: function () {
		self.idleTime += 1;
		if (self.idleTime >= 120) {
			self.timedOut(true);
			self.navToMainMenu();
		}
	},
	showLanding: undefined,
	currentMetal: undefined,
	maxMetal: undefined,
	metalFraction: undefined,
	currentEnergy: undefined,
	maxEnergy: undefined,
	energyFraction: undefined,
	combatUnitsInCombat: undefined,
	metalLost: undefined,
	enemyMetalDestroyed: undefined,
	commands: undefined,
	targetableCommands: undefined,
	toPascalCase: function (command) {
		if (!command || !command.length) return "";

		return command
		.replace(/^[a-z]/, function (m) { return m.toUpperCase() })
		.replace(/_[a-z]/g, function (m) { return m.toUpperCase() })
		.replace(/_/g, "");
	},
	allowedCommands: {},
	cmdIndex: undefined,
	cmd: undefined,
	commanderHealth: undefined,
	armySize: undefined,
	armyCount: undefined,
	isSpectator: undefined,
	showControlGroups: undefined,
	squelchNotifications: undefined,
	showResources: undefined,
	cmdQueueCount: undefined,
	endCommandMode: function () {
		self.cmdIndex(-1);
		self.mode("default");
		api.arch.endFabMode();
		self.currentBuildStructureId("");
		api.arch.endAreaCommandMode();
		engine.call("set_command_mode", "");
	},
	setCommandIndex: function (index) {
		const stop = (index === -1);
		const ping = (index === 13);

		if (!stop && !ping && !self.allowedCommands[self.toPascalCase(self.commands()[index])]) return;

		self.endCommandMode();

		self.cmdIndex(index);
		self.cmdQueueCount(0);
		if (!stop && self.cmd()) self.mode("command_" + self.cmd());
		else self.mode("default");

		engine.call("set_command_mode", self.cmd());
	},
	toggleFireOrderIndex: function () {
		api.panels.action_bar && api.panels.action_bar.message("toggle_order", "Fire");
	},
	selectionFireAtWill: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "FireAtWill");
	},
	selectionReturnFire: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "ReturnFire");
	},
	selectionHoldFire: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "HoldFire");
	},
	toggleMoveOrderIndex: function () {
		api.panels.action_bar && api.panels.action_bar.message("toggle_order", "Move");
	},
	selectionManeuver: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "Maneuver");
	},
	selectionRoam: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "Roam");
	},
	selectionHoldPosition: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "HoldPosition");
	},
	toggleEnergyOrderIndex: function () {
		api.panels.action_bar && api.panels.action_bar.message("toggle_order", "Energy");
	},
	selectionConsume: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "Consume");
	},
	selectionConserve: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "Conserve");
	},
	toggleBuildStanceOrderIndex: function () {
		api.panels.action_bar && api.panels.action_bar.message("toggle_order", "BuildStance");
	},
	selectionBuildStanceNormal: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "BuildStanceNormal");
	},
	selectionBuildStanceContinuous: function () {
		api.panels.action_bar && api.panels.action_bar.message("selection_order", "BuildStanceContinuous");
	},
	considerPlayingSound: function (cue, priority) {
		/* this simple version of the trigger model is used only for planet VO, and only because triggers don't prioritize correctly across panels */
		if (priority > bestPriority) {
			bestCue = cue;
			bestPriority = priority;
			timeoutId ||= window.setTimeout(playSound, 15);
		}
	},
	buildHotkeyModel: {},
	buildTabs: undefined,
	orderedBuildTabs: undefined,
	buildTabLists: undefined,
	selectedMobile: undefined,
	activeBuildGroup: undefined,
	activeBuildGroupLocked: undefined,
	buildSequenceTimeout: undefined,
	clearBuildSequence: function () {
		self.activeBuildGroup(null);
		self.activeBuildGroupLocked(false);
		self.activatedBuildId("");
		remove_keybinds("build");
		api.panels.build_bar.message("clear_build_sequence");
	},
	resetClearBuildSequence: function () {
		clearTimeout(clear_build_sequence_timeout);
		clear_build_sequence_timeout = setTimeout(self.clearBuildSequence, self.buildSequenceTimeout());
	},
	startBuild: function (group, override_lock) {
		if (self.activeBuildGroupLocked() && !override_lock) return;

		self.activeBuildGroup(group);

		if (override_lock) self.activeBuildGroupLocked(true);

		apply_keybinds("build");

		api.panels.build_bar.message("start_build_sequence", {
			group: group,
			lock: override_lock,
		});
	},
	activatedBuildId: undefined,
	buildItemFromList: function (index, row, column) {
		// Reset any fab build selections we may have had.
		self.currentBuildStructureId("");

		api.panels.build_bar.query("build_item", { row: row, column: column }).then(function (id) {
			if (!id) return;

			keyupResponse = self.resetClearBuildSequence;
			self.buildItemBySpec(id);
		});
	},
	buildTabOrders: undefined,
	toggleBuildTab: function () {
		let index = 0;
		if (self.buildTabLists().length) index = (self.selectedBuildTabIndex() + 1) % self.buildTabLists().length;

		self.selectedBuildTabIndex(index);
	},
	buildItemMinIndex: undefined,
	selectedBuildTabIndex: undefined,
	windowWidth: undefined,
	windowHeight: undefined,
	navDebug: undefined,
	toggleNavDebug: function () {
		self.navDebug(!self.navDebug());
		api.arch.setNavDebug(self.navDebug());
	},
	itemDetails: { "/pa/units/air/fabrication_aircraft/fabrication_aircraft.json":{}, "/pa/units/air/fabrication_aircraft/fabrication_aircraft.json.player":{}, "/pa/units/air/fabrication_aircraft/fabrication_aircraft.json.ai":{}, "/pa/units/air/fabrication_aircraft_adv/fabrication_aircraft_adv.json":{}, "/pa/units/air/fabrication_aircraft_adv/fabrication_aircraft_adv.json.player":{}, "/pa/units/air/fabrication_aircraft_adv/fabrication_aircraft_adv.json.ai":{}, "/pa/units/air/air_factory_adv/air_factory_adv.json":{}, "/pa/units/air/air_factory_adv/air_factory_adv.json.player":{}, "/pa/units/air/air_factory_adv/air_factory_adv.json.ai":{}, "/pa/units/air/bomber_adv/bomber_adv.json":{}, "/pa/units/air/bomber_adv/bomber_adv.json.player":{}, "/pa/units/air/bomber_adv/bomber_adv.json.ai":{}, "/pa/units/air/air_factory/air_factory.json":{}, "/pa/units/air/air_factory/air_factory.json.player":{}, "/pa/units/air/air_factory/air_factory.json.ai":{}, "/pa/units/air/bomber/bomber.json":{}, "/pa/units/air/bomber/bomber.json.player":{}, "/pa/units/air/bomber/bomber.json.ai":{}, "/pa/units/air/fighter/fighter.json":{}, "/pa/units/air/fighter/fighter.json.player":{}, "/pa/units/air/fighter/fighter.json.ai":{}, "/pa/units/air/bomber_heavy/bomber_heavy.json":{}, "/pa/units/air/bomber_heavy/bomber_heavy.json.player":{}, "/pa/units/air/bomber_heavy/bomber_heavy.json.ai":{}, "/pa/units/air/air_scout/air_scout.json":{}, "/pa/units/air/air_scout/air_scout.json.player":{}, "/pa/units/air/air_scout/air_scout.json.ai":{}, "/pa/units/air/base_flyer/base_flyer.json":{}, "/pa/units/air/base_flyer/base_flyer.json.player":{}, "/pa/units/air/base_flyer/base_flyer.json.ai":{}, "/pa/units/air/gunship/gunship.json":{}, "/pa/units/air/gunship/gunship.json.player":{}, "/pa/units/air/gunship/gunship.json.ai":{}, "/pa/units/air/fighter_adv/fighter_adv.json":{}, "/pa/units/air/fighter_adv/fighter_adv.json.player":{}, "/pa/units/air/fighter_adv/fighter_adv.json.ai":{}, "/pa/units/air/transport/transport.json":{}, "/pa/units/air/transport/transport.json.player":{}, "/pa/units/air/transport/transport.json.ai":{}, "/pa/units/sea/naval_factory/naval_factory.json":{}, "/pa/units/sea/naval_factory/naval_factory.json.player":{}, "/pa/units/sea/naval_factory/naval_factory.json.ai":{}, "/pa/units/commanders/avatar/avatar.json":{}, "/pa/units/commanders/avatar/avatar.json.player":{}, "/pa/units/commanders/avatar/avatar.json.ai":{}, "/pa/units/commanders/imperial_seniorhelix/imperial_seniorhelix.json":{}, "/pa/units/commanders/imperial_seniorhelix/imperial_seniorhelix.json.player":{}, "/pa/units/commanders/imperial_seniorhelix/imperial_seniorhelix.json.ai":{}, "/pa/units/commanders/imperial_aceal/imperial_aceal.json":{}, "/pa/units/commanders/imperial_aceal/imperial_aceal.json.player":{}, "/pa/units/commanders/imperial_aceal/imperial_aceal.json.ai":{}, "/pa/units/commanders/base_commander/base_commander.json":{}, "/pa/units/commanders/base_commander/base_commander.json.player":{}, "/pa/units/commanders/base_commander/base_commander.json.ai":{}, "/pa/units/commanders/imperial_sangudo/imperial_sangudo.json":{}, "/pa/units/commanders/imperial_sangudo/imperial_sangudo.json.player":{}, "/pa/units/commanders/imperial_sangudo/imperial_sangudo.json.ai":{}, "/pa/units/commanders/imperial_able/imperial_able.json":{}, "/pa/units/commanders/imperial_able/imperial_able.json.player":{}, "/pa/units/commanders/imperial_able/imperial_able.json.ai":{}, "/pa/units/commanders/imperial_chronoblip/imperial_chronoblip.json":{}, "/pa/units/commanders/imperial_chronoblip/imperial_chronoblip.json.player":{}, "/pa/units/commanders/imperial_chronoblip/imperial_chronoblip.json.ai":{}, "/pa/units/land/bot_factory_adv/bot_factory_adv.json":{}, "/pa/units/land/bot_factory_adv/bot_factory_adv.json.player":{}, "/pa/units/land/bot_factory_adv/bot_factory_adv.json.ai":{}, "/pa/units/commanders/quad_xenosentryprime/quad_xenosentryprime.json":{}, "/pa/units/commanders/quad_xenosentryprime/quad_xenosentryprime.json.player":{}, "/pa/units/commanders/quad_xenosentryprime/quad_xenosentryprime.json.ai":{}, "/pa/units/commanders/imperial_theta/imperial_theta.json":{}, "/pa/units/commanders/imperial_theta/imperial_theta.json.player":{}, "/pa/units/commanders/imperial_theta/imperial_theta.json.ai":{}, "/pa/units/commanders/quad_sacrificiallamb/quad_sacrificiallamb.json":{}, "/pa/units/commanders/quad_sacrificiallamb/quad_sacrificiallamb.json.player":{}, "/pa/units/commanders/quad_sacrificiallamb/quad_sacrificiallamb.json.ai":{}, "/pa/units/commanders/imperial_alpha/imperial_alpha.json":{}, "/pa/units/commanders/imperial_alpha/imperial_alpha.json.player":{}, "/pa/units/commanders/imperial_alpha/imperial_alpha.json.ai":{}, "/pa/units/commanders/quad_gambitdfa/quad_gambitdfa.json":{}, "/pa/units/commanders/quad_gambitdfa/quad_gambitdfa.json.player":{}, "/pa/units/commanders/quad_gambitdfa/quad_gambitdfa.json.ai":{}, "/pa/units/commanders/raptor_zaazzaa/raptor_zaazzaa.json":{}, "/pa/units/commanders/raptor_zaazzaa/raptor_zaazzaa.json.player":{}, "/pa/units/commanders/raptor_zaazzaa/raptor_zaazzaa.json.ai":{}, "/pa/units/commanders/imperial_visionik/imperial_visionik.json":{}, "/pa/units/commanders/imperial_visionik/imperial_visionik.json.player":{}, "/pa/units/commanders/imperial_visionik/imperial_visionik.json.ai":{}, "/pa/units/land/tank_laser_adv/tank_laser_adv.json":{}, "/pa/units/land/tank_laser_adv/tank_laser_adv.json.player":{}, "/pa/units/land/tank_laser_adv/tank_laser_adv.json.ai":{}, "/pa/units/commanders/imperial_aryst0krat/imperial_aryst0krat.json":{}, "/pa/units/commanders/imperial_aryst0krat/imperial_aryst0krat.json.player":{}, "/pa/units/commanders/imperial_aryst0krat/imperial_aryst0krat.json.ai":{}, "/pa/units/land/energy_storage/energy_storage.json":{}, "/pa/units/land/energy_storage/energy_storage.json.player":{}, "/pa/units/land/energy_storage/energy_storage.json.ai":{}, "/pa/units/commanders/tank_sadiga/tank_sadiga.json":{}, "/pa/units/commanders/tank_sadiga/tank_sadiga.json.player":{}, "/pa/units/commanders/tank_sadiga/tank_sadiga.json.ai":{}, "/pa/units/commanders/quad_mobiousblack/quad_mobiousblack.json":{}, "/pa/units/commanders/quad_mobiousblack/quad_mobiousblack.json.player":{}, "/pa/units/commanders/quad_mobiousblack/quad_mobiousblack.json.ai":{}, "/pa/units/orbital/delta_v_engine/delta_v_engine.json":{}, "/pa/units/orbital/delta_v_engine/delta_v_engine.json.player":{}, "/pa/units/orbital/delta_v_engine/delta_v_engine.json.ai":{}, "/pa/units/commanders/imperial_base/imperial_base.json":{}, "/pa/units/commanders/imperial_base/imperial_base.json.player":{}, "/pa/units/commanders/imperial_base/imperial_base.json.ai":{}, "/pa/units/commanders/imperial_delta/imperial_delta.json":{}, "/pa/units/commanders/imperial_delta/imperial_delta.json.player":{}, "/pa/units/commanders/imperial_delta/imperial_delta.json.ai":{}, "/pa/units/commanders/imperial_fiveleafclover/imperial_fiveleafclover.json":{}, "/pa/units/commanders/imperial_fiveleafclover/imperial_fiveleafclover.json.player":{}, "/pa/units/commanders/imperial_fiveleafclover/imperial_fiveleafclover.json.ai":{}, "/pa/units/commanders/imperial_invictus/imperial_invictus.json":{}, "/pa/units/commanders/imperial_invictus/imperial_invictus.json.player":{}, "/pa/units/commanders/imperial_invictus/imperial_invictus.json.ai":{}, "/pa/units/commanders/quad_spartandano/quad_spartandano.json":{}, "/pa/units/commanders/quad_spartandano/quad_spartandano.json.player":{}, "/pa/units/commanders/quad_spartandano/quad_spartandano.json.ai":{}, "/pa/units/commanders/quad_twoboots/quad_twoboots.json":{}, "/pa/units/commanders/quad_twoboots/quad_twoboots.json.player":{}, "/pa/units/commanders/quad_twoboots/quad_twoboots.json.ai":{}, "/pa/units/commanders/tank_base/tank_base.json":{}, "/pa/units/commanders/tank_base/tank_base.json.player":{}, "/pa/units/commanders/tank_base/tank_base.json.ai":{}, "/pa/units/commanders/imperial_kapowaz/imperial_kapowaz.json":{}, "/pa/units/commanders/imperial_kapowaz/imperial_kapowaz.json.player":{}, "/pa/units/commanders/imperial_kapowaz/imperial_kapowaz.json.ai":{}, "/pa/units/commanders/quad_spiderofmean/quad_spiderofmean.json":{}, "/pa/units/commanders/quad_spiderofmean/quad_spiderofmean.json.player":{}, "/pa/units/commanders/quad_spiderofmean/quad_spiderofmean.json.ai":{}, "/pa/units/sea/hover_ship/hover_ship.json":{}, "/pa/units/sea/hover_ship/hover_ship.json.player":{}, "/pa/units/sea/hover_ship/hover_ship.json.ai":{}, "/pa/units/sea/nuclear_sub/nuclear_sub.json":{}, "/pa/units/sea/nuclear_sub/nuclear_sub.json.player":{}, "/pa/units/sea/nuclear_sub/nuclear_sub.json.ai":{}, "/pa/units/commanders/raptor_spz58624/raptor_spz58624.json":{}, "/pa/units/commanders/raptor_spz58624/raptor_spz58624.json.player":{}, "/pa/units/commanders/raptor_spz58624/raptor_spz58624.json.ai":{}, "/pa/units/commanders/imperial_enzomatrix/imperial_enzomatrix.json":{}, "/pa/units/commanders/imperial_enzomatrix/imperial_enzomatrix.json.player":{}, "/pa/units/commanders/imperial_enzomatrix/imperial_enzomatrix.json.ai":{}, "/pa/units/commanders/imperial_nagasher/imperial_nagasher.json":{}, "/pa/units/commanders/imperial_nagasher/imperial_nagasher.json.player":{}, "/pa/units/commanders/imperial_nagasher/imperial_nagasher.json.ai":{}, "/pa/units/commanders/imperial_progenitor/imperial_progenitor.json":{}, "/pa/units/commanders/imperial_progenitor/imperial_progenitor.json.player":{}, "/pa/units/commanders/imperial_progenitor/imperial_progenitor.json.ai":{}, "/pa/units/commanders/imperial_gamma/imperial_gamma.json":{}, "/pa/units/commanders/imperial_gamma/imperial_gamma.json.player":{}, "/pa/units/commanders/imperial_gamma/imperial_gamma.json.ai":{}, "/pa/units/commanders/imperial_kevin4001/imperial_kevin4001.json":{}, "/pa/units/commanders/imperial_kevin4001/imperial_kevin4001.json.player":{}, "/pa/units/commanders/imperial_kevin4001/imperial_kevin4001.json.ai":{}, "/pa/units/orbital/solar_array/solar_array.json":{}, "/pa/units/orbital/solar_array/solar_array.json.player":{}, "/pa/units/orbital/solar_array/solar_array.json.ai":{}, "/pa/units/commanders/imperial_gnugfur/imperial_gnugfur.json":{}, "/pa/units/commanders/imperial_gnugfur/imperial_gnugfur.json.player":{}, "/pa/units/commanders/imperial_gnugfur/imperial_gnugfur.json.ai":{}, "/pa/units/commanders/imperial_jt100010117/imperial_jt100010117.json":{}, "/pa/units/commanders/imperial_jt100010117/imperial_jt100010117.json.player":{}, "/pa/units/commanders/imperial_jt100010117/imperial_jt100010117.json.ai":{}, "/pa/units/commanders/quad_potbelly79/quad_potbelly79.json":{}, "/pa/units/commanders/quad_potbelly79/quad_potbelly79.json.player":{}, "/pa/units/commanders/quad_potbelly79/quad_potbelly79.json.ai":{}, "/pa/units/commanders/imperial_fusion/imperial_fusion.json":{}, "/pa/units/commanders/imperial_fusion/imperial_fusion.json.player":{}, "/pa/units/commanders/imperial_fusion/imperial_fusion.json.ai":{}, "/pa/units/commanders/raptor_betadyne/raptor_betadyne.json":{}, "/pa/units/commanders/raptor_betadyne/raptor_betadyne.json.player":{}, "/pa/units/commanders/raptor_betadyne/raptor_betadyne.json.ai":{}, "/pa/units/commanders/imperial_mjon/imperial_mjon.json":{}, "/pa/units/commanders/imperial_mjon/imperial_mjon.json.player":{}, "/pa/units/commanders/imperial_mjon/imperial_mjon.json.ai":{}, "/pa/units/commanders/quad_shadowdaemon/quad_shadowdaemon.json":{}, "/pa/units/commanders/quad_shadowdaemon/quad_shadowdaemon.json.player":{}, "/pa/units/commanders/quad_shadowdaemon/quad_shadowdaemon.json.ai":{}, "/pa/units/commanders/imperial_mostlikely/imperial_mostlikely.json":{}, "/pa/units/commanders/imperial_mostlikely/imperial_mostlikely.json.player":{}, "/pa/units/commanders/imperial_mostlikely/imperial_mostlikely.json.ai":{}, "/pa/units/orbital/orbital_battleship/orbital_battleship.json":{}, "/pa/units/orbital/orbital_battleship/orbital_battleship.json.player":{}, "/pa/units/orbital/orbital_battleship/orbital_battleship.json.ai":{}, "/pa/units/sea/fabrication_ship/fabrication_ship.json":{}, "/pa/units/sea/fabrication_ship/fabrication_ship.json.player":{}, "/pa/units/sea/fabrication_ship/fabrication_ship.json.ai":{}, "/pa/units/commanders/quad_osiris/quad_osiris.json":{}, "/pa/units/commanders/quad_osiris/quad_osiris.json.player":{}, "/pa/units/commanders/quad_osiris/quad_osiris.json.ai":{}, "/pa/units/commanders/raptor_nefelpitou/raptor_nefelpitou.json":{}, "/pa/units/commanders/raptor_nefelpitou/raptor_nefelpitou.json.player":{}, "/pa/units/commanders/raptor_nefelpitou/raptor_nefelpitou.json.ai":{}, "/pa/units/commanders/imperial_stelarch/imperial_stelarch.json":{}, "/pa/units/commanders/imperial_stelarch/imperial_stelarch.json.player":{}, "/pa/units/commanders/imperial_stelarch/imperial_stelarch.json.ai":{}, "/pa/units/commanders/quad_base/quad_base.json":{}, "/pa/units/commanders/quad_base/quad_base.json.player":{}, "/pa/units/commanders/quad_base/quad_base.json.ai":{}, "/pa/units/commanders/quad_commandonut/quad_commandonut.json":{}, "/pa/units/commanders/quad_commandonut/quad_commandonut.json.player":{}, "/pa/units/commanders/quad_commandonut/quad_commandonut.json.ai":{}, "/pa/units/commanders/imperial_thechessknight/imperial_thechessknight.json":{}, "/pa/units/commanders/imperial_thechessknight/imperial_thechessknight.json.player":{}, "/pa/units/commanders/imperial_thechessknight/imperial_thechessknight.json.ai":{}, "/pa/units/commanders/imperial_toddfather/imperial_toddfather.json":{}, "/pa/units/commanders/imperial_toddfather/imperial_toddfather.json.player":{}, "/pa/units/commanders/imperial_toddfather/imperial_toddfather.json.ai":{}, "/pa/units/commanders/imperial_tykus24/imperial_tykus24.json":{}, "/pa/units/commanders/imperial_tykus24/imperial_tykus24.json.player":{}, "/pa/units/commanders/imperial_tykus24/imperial_tykus24.json.ai":{}, "/pa/units/commanders/quad_tokamaktech/quad_tokamaktech.json":{}, "/pa/units/commanders/quad_tokamaktech/quad_tokamaktech.json.player":{}, "/pa/units/commanders/quad_tokamaktech/quad_tokamaktech.json.ai":{}, "/pa/units/commanders/imperial_vidicarus/imperial_vidicarus.json":{}, "/pa/units/commanders/imperial_vidicarus/imperial_vidicarus.json.player":{}, "/pa/units/commanders/imperial_vidicarus/imperial_vidicarus.json.ai":{}, "/pa/units/commanders/quad_ajax/quad_ajax.json":{}, "/pa/units/commanders/quad_ajax/quad_ajax.json.player":{}, "/pa/units/commanders/quad_ajax/quad_ajax.json.ai":{}, "/pa/units/commanders/quad_locust/quad_locust.json":{}, "/pa/units/commanders/quad_locust/quad_locust.json.player":{}, "/pa/units/commanders/quad_locust/quad_locust.json.ai":{}, "/pa/units/commanders/quad_armalisk/quad_armalisk.json":{}, "/pa/units/commanders/quad_armalisk/quad_armalisk.json.player":{}, "/pa/units/commanders/quad_armalisk/quad_armalisk.json.ai":{}, "/pa/units/commanders/tank_aeson/tank_aeson.json":{}, "/pa/units/commanders/tank_aeson/tank_aeson.json.player":{}, "/pa/units/commanders/tank_aeson/tank_aeson.json.ai":{}, "/pa/units/commanders/quad_calyx/quad_calyx.json":{}, "/pa/units/commanders/quad_calyx/quad_calyx.json.player":{}, "/pa/units/commanders/quad_calyx/quad_calyx.json.ai":{}, "/pa/units/commanders/quad_pumpkin/quad_pumpkin.json":{}, "/pa/units/commanders/quad_pumpkin/quad_pumpkin.json.player":{}, "/pa/units/commanders/quad_pumpkin/quad_pumpkin.json.ai":{}, "/pa/units/commanders/quad_raventhornn/quad_raventhornn.json":{}, "/pa/units/commanders/quad_raventhornn/quad_raventhornn.json.player":{}, "/pa/units/commanders/quad_raventhornn/quad_raventhornn.json.ai":{}, "/pa/units/commanders/quad_theflax/quad_theflax.json":{}, "/pa/units/commanders/quad_theflax/quad_theflax.json.player":{}, "/pa/units/commanders/quad_theflax/quad_theflax.json.ai":{}, "/pa/units/orbital/orbital_railgun/orbital_railgun.json":{}, "/pa/units/orbital/orbital_railgun/orbital_railgun.json.player":{}, "/pa/units/orbital/orbital_railgun/orbital_railgun.json.ai":{}, "/pa/units/land/assault_bot_adv/assault_bot_adv.json":{}, "/pa/units/land/assault_bot_adv/assault_bot_adv.json.player":{}, "/pa/units/land/assault_bot_adv/assault_bot_adv.json.ai":{}, "/pa/units/commanders/quad_xinthar/quad_xinthar.json":{}, "/pa/units/commanders/quad_xinthar/quad_xinthar.json.player":{}, "/pa/units/commanders/quad_xinthar/quad_xinthar.json.ai":{}, "/pa/units/commanders/quad_zancrowe/quad_zancrowe.json":{}, "/pa/units/commanders/quad_zancrowe/quad_zancrowe.json.player":{}, "/pa/units/commanders/quad_zancrowe/quad_zancrowe.json.ai":{}, "/pa/units/commanders/raptor_base/raptor_base.json":{}, "/pa/units/commanders/raptor_base/raptor_base.json.player":{}, "/pa/units/commanders/raptor_base/raptor_base.json.ai":{}, "/pa/units/commanders/raptor_beast/raptor_beast.json":{}, "/pa/units/commanders/raptor_beast/raptor_beast.json.player":{}, "/pa/units/commanders/raptor_beast/raptor_beast.json.ai":{}, "/pa/units/commanders/raptor_beast_king/raptor_beast_king.json":{}, "/pa/units/commanders/raptor_beast_king/raptor_beast_king.json.player":{}, "/pa/units/commanders/raptor_beast_king/raptor_beast_king.json.ai":{}, "/pa/units/commanders/raptor_diremachine/raptor_diremachine.json":{}, "/pa/units/commanders/raptor_diremachine/raptor_diremachine.json.player":{}, "/pa/units/commanders/raptor_diremachine/raptor_diremachine.json.ai":{}, "/pa/units/commanders/raptor_beniesk/raptor_beniesk.json":{}, "/pa/units/commanders/raptor_beniesk/raptor_beniesk.json.player":{}, "/pa/units/commanders/raptor_beniesk/raptor_beniesk.json.ai":{}, "/pa/units/commanders/raptor_centurion/raptor_centurion.json":{}, "/pa/units/commanders/raptor_centurion/raptor_centurion.json.player":{}, "/pa/units/commanders/raptor_centurion/raptor_centurion.json.ai":{}, "/pa/units/commanders/raptor_damubbster/raptor_damubbster.json":{}, "/pa/units/commanders/raptor_damubbster/raptor_damubbster.json.player":{}, "/pa/units/commanders/raptor_damubbster/raptor_damubbster.json.ai":{}, "/pa/units/commanders/raptor_enderstryke71/raptor_enderstryke71.json":{}, "/pa/units/commanders/raptor_enderstryke71/raptor_enderstryke71.json.player":{}, "/pa/units/commanders/raptor_enderstryke71/raptor_enderstryke71.json.ai":{}, "/pa/units/commanders/raptor_iwmiked/raptor_iwmiked.json":{}, "/pa/units/commanders/raptor_iwmiked/raptor_iwmiked.json.player":{}, "/pa/units/commanders/raptor_iwmiked/raptor_iwmiked.json.ai":{}, "/pa/units/commanders/raptor_majuju/raptor_majuju.json":{}, "/pa/units/commanders/raptor_majuju/raptor_majuju.json.player":{}, "/pa/units/commanders/raptor_majuju/raptor_majuju.json.ai":{}, "/pa/units/commanders/tutorial_player_commander/tutorial_player_commander.json":{}, "/pa/units/commanders/tutorial_player_commander/tutorial_player_commander.json.player":{}, "/pa/units/commanders/tutorial_player_commander/tutorial_player_commander.json.ai":{}, "/pa/units/commanders/raptor_nemicus/raptor_nemicus.json":{}, "/pa/units/commanders/raptor_nemicus/raptor_nemicus.json.player":{}, "/pa/units/commanders/raptor_nemicus/raptor_nemicus.json.ai":{}, "/pa/units/commanders/raptor_xov/raptor_xov.json":{}, "/pa/units/commanders/raptor_xov/raptor_xov.json.player":{}, "/pa/units/commanders/raptor_xov/raptor_xov.json.ai":{}, "/pa/units/commanders/raptor_raizell/raptor_raizell.json":{}, "/pa/units/commanders/raptor_raizell/raptor_raizell.json.player":{}, "/pa/units/commanders/raptor_raizell/raptor_raizell.json.ai":{}, "/pa/units/commanders/raptor_rallus/raptor_rallus.json":{}, "/pa/units/commanders/raptor_rallus/raptor_rallus.json.player":{}, "/pa/units/commanders/raptor_rallus/raptor_rallus.json.ai":{}, "/pa/units/land/teleporter/teleporter.json":{}, "/pa/units/land/teleporter/teleporter.json.player":{}, "/pa/units/land/teleporter/teleporter.json.ai":{}, "/pa/units/commanders/raptor_stickman9000/raptor_stickman9000.json":{}, "/pa/units/commanders/raptor_stickman9000/raptor_stickman9000.json.player":{}, "/pa/units/commanders/raptor_stickman9000/raptor_stickman9000.json.ai":{}, "/pa/units/sea/destroyer/destroyer.json":{}, "/pa/units/sea/destroyer/destroyer.json.player":{}, "/pa/units/sea/destroyer/destroyer.json.ai":{}, "/pa/units/land/tank_armor/tank_armor.json":{}, "/pa/units/land/tank_armor/tank_armor.json.player":{}, "/pa/units/land/tank_armor/tank_armor.json.ai":{}, "/pa/units/commanders/raptor_unicorn/raptor_unicorn.json":{}, "/pa/units/commanders/raptor_unicorn/raptor_unicorn.json.player":{}, "/pa/units/commanders/raptor_unicorn/raptor_unicorn.json.ai":{}, "/pa/units/commanders/tank_banditks/tank_banditks.json":{}, "/pa/units/commanders/tank_banditks/tank_banditks.json.player":{}, "/pa/units/commanders/tank_banditks/tank_banditks.json.ai":{}, "/pa/units/land/tank_heavy_armor/tank_heavy_armor.json":{}, "/pa/units/land/tank_heavy_armor/tank_heavy_armor.json.player":{}, "/pa/units/land/tank_heavy_armor/tank_heavy_armor.json.ai":{}, "/pa/units/commanders/tank_reaver/tank_reaver.json":{}, "/pa/units/commanders/tank_reaver/tank_reaver.json.player":{}, "/pa/units/commanders/tank_reaver/tank_reaver.json.ai":{}, "/pa/units/land/aa_missile_vehicle/aa_missile_vehicle.json":{}, "/pa/units/land/aa_missile_vehicle/aa_missile_vehicle.json.player":{}, "/pa/units/land/aa_missile_vehicle/aa_missile_vehicle.json.ai":{}, "/pa/units/land/air_defense/air_defense.json":{}, "/pa/units/land/air_defense/air_defense.json.player":{}, "/pa/units/land/air_defense/air_defense.json.ai":{}, "/pa/units/orbital/base_orbital/base_orbital.json":{}, "/pa/units/orbital/base_orbital/base_orbital.json.player":{}, "/pa/units/orbital/base_orbital/base_orbital.json.ai":{}, "/pa/units/land/vehicle_factory/vehicle_factory.json":{}, "/pa/units/land/vehicle_factory/vehicle_factory.json.player":{}, "/pa/units/land/vehicle_factory/vehicle_factory.json.ai":{}, "/pa/units/land/air_defense_adv/air_defense_adv.json":{}, "/pa/units/land/air_defense_adv/air_defense_adv.json.player":{}, "/pa/units/land/air_defense_adv/air_defense_adv.json.ai":{}, "/pa/units/land/tank_jammer/tank_jammer.json":{}, "/pa/units/land/tank_jammer/tank_jammer.json.player":{}, "/pa/units/land/tank_jammer/tank_jammer.json.ai":{}, "/pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json":{}, "/pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json.player":{}, "/pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json.ai":{}, "/pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json":{}, "/pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json.player":{}, "/pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json.ai":{}, "/pa/units/orbital/orbital_mine/orbital_mine.json":{}, "/pa/units/orbital/orbital_mine/orbital_mine.json.player":{}, "/pa/units/orbital/orbital_mine/orbital_mine.json.ai":{}, "/pa/units/land/land_barrier/land_barrier.json":{}, "/pa/units/land/land_barrier/land_barrier.json.player":{}, "/pa/units/land/land_barrier/land_barrier.json.ai":{}, "/pa/units/land/artillery_long/artillery_long.json":{}, "/pa/units/land/artillery_long/artillery_long.json.player":{}, "/pa/units/land/artillery_long/artillery_long.json.ai":{}, "/pa/units/land/artillery_short/artillery_short.json":{}, "/pa/units/land/artillery_short/artillery_short.json.player":{}, "/pa/units/land/artillery_short/artillery_short.json.ai":{}, "/pa/units/land/assault_bot/assault_bot.json":{}, "/pa/units/land/assault_bot/assault_bot.json.player":{}, "/pa/units/land/assault_bot/assault_bot.json.ai":{}, "/pa/units/land/avatar_factory/avatar_factory.json":{}, "/pa/units/land/avatar_factory/avatar_factory.json.player":{}, "/pa/units/land/avatar_factory/avatar_factory.json.ai":{}, "/pa/units/orbital/orbital_probe/orbital_probe.json":{}, "/pa/units/orbital/orbital_probe/orbital_probe.json.player":{}, "/pa/units/orbital/orbital_probe/orbital_probe.json.ai":{}, "/pa/units/land/base_bot/base_bot.json":{}, "/pa/units/land/base_bot/base_bot.json.player":{}, "/pa/units/land/base_bot/base_bot.json.ai":{}, "/pa/units/land/base_structure/base_structure.json":{}, "/pa/units/land/base_structure/base_structure.json.player":{}, "/pa/units/land/base_structure/base_structure.json.ai":{}, "/pa/units/sea/missile_ship/missile_ship.json":{}, "/pa/units/sea/missile_ship/missile_ship.json.player":{}, "/pa/units/sea/missile_ship/missile_ship.json.ai":{}, "/pa/units/land/base_vehicle/base_vehicle.json":{}, "/pa/units/land/base_vehicle/base_vehicle.json.player":{}, "/pa/units/land/base_vehicle/base_vehicle.json.ai":{}, "/pa/units/land/bot_aa/bot_aa.json":{}, "/pa/units/land/bot_aa/bot_aa.json.player":{}, "/pa/units/land/bot_aa/bot_aa.json.ai":{}, "/pa/units/land/bot_bomb/bot_bomb.json":{}, "/pa/units/land/bot_bomb/bot_bomb.json.player":{}, "/pa/units/land/bot_bomb/bot_bomb.json.ai":{}, "/pa/units/land/bot_factory/bot_factory.json":{}, "/pa/units/land/bot_factory/bot_factory.json.player":{}, "/pa/units/land/bot_factory/bot_factory.json.ai":{}, "/pa/units/land/fabrication_bot_combat_adv/fabrication_bot_combat_adv.json":{}, "/pa/units/land/fabrication_bot_combat_adv/fabrication_bot_combat_adv.json.player":{}, "/pa/units/land/fabrication_bot_combat_adv/fabrication_bot_combat_adv.json.ai":{}, "/pa/units/land/bot_grenadier/bot_grenadier.json":{}, "/pa/units/land/bot_grenadier/bot_grenadier.json.player":{}, "/pa/units/land/bot_grenadier/bot_grenadier.json.ai":{}, "/pa/units/land/land_mine/land_mine.json":{}, "/pa/units/land/land_mine/land_mine.json.player":{}, "/pa/units/land/land_mine/land_mine.json.ai":{}, "/pa/units/land/bot_sniper/bot_sniper.json":{}, "/pa/units/land/bot_sniper/bot_sniper.json.player":{}, "/pa/units/land/bot_sniper/bot_sniper.json.ai":{}, "/pa/units/land/attack_vehicle/attack_vehicle.json":{}, "/pa/units/land/attack_vehicle/attack_vehicle.json.player":{}, "/pa/units/land/attack_vehicle/attack_vehicle.json.ai":{}, "/pa/units/sea/torpedo_launcher_adv/torpedo_launcher_adv.json":{}, "/pa/units/sea/torpedo_launcher_adv/torpedo_launcher_adv.json.player":{}, "/pa/units/sea/torpedo_launcher_adv/torpedo_launcher_adv.json.ai":{}, "/pa/units/land/fabrication_bot/fabrication_bot.json":{}, "/pa/units/land/fabrication_bot/fabrication_bot.json.player":{}, "/pa/units/land/fabrication_bot/fabrication_bot.json.ai":{}, "/pa/units/land/bot_spider_adv/bot_spider_adv.json":{}, "/pa/units/land/bot_spider_adv/bot_spider_adv.json.player":{}, "/pa/units/land/bot_spider_adv/bot_spider_adv.json.ai":{}, "/pa/units/land/bot_tactical_missile/bot_tactical_missile.json":{}, "/pa/units/land/bot_tactical_missile/bot_tactical_missile.json.player":{}, "/pa/units/land/bot_tactical_missile/bot_tactical_missile.json.ai":{}, "/pa/units/land/control_module/control_module.json":{}, "/pa/units/land/control_module/control_module.json.player":{}, "/pa/units/land/control_module/control_module.json.ai":{}, "/pa/units/land/energy_plant/energy_plant.json":{}, "/pa/units/land/energy_plant/energy_plant.json.player":{}, "/pa/units/land/energy_plant/energy_plant.json.ai":{}, "/pa/units/land/energy_plant_adv/energy_plant_adv.json":{}, "/pa/units/land/energy_plant_adv/energy_plant_adv.json.player":{}, "/pa/units/land/energy_plant_adv/energy_plant_adv.json.ai":{}, "/pa/units/land/fabrication_bot_adv/fabrication_bot_adv.json":{}, "/pa/units/land/fabrication_bot_adv/fabrication_bot_adv.json.player":{}, "/pa/units/land/fabrication_bot_adv/fabrication_bot_adv.json.ai":{}, "/pa/units/land/fabrication_bot_combat/fabrication_bot_combat.json":{}, "/pa/units/land/fabrication_bot_combat/fabrication_bot_combat.json.player":{}, "/pa/units/land/fabrication_bot_combat/fabrication_bot_combat.json.ai":{}, "/pa/units/land/fabrication_vehicle/fabrication_vehicle.json":{}, "/pa/units/land/fabrication_vehicle/fabrication_vehicle.json.player":{}, "/pa/units/land/fabrication_vehicle/fabrication_vehicle.json.ai":{}, "/pa/units/land/artillery_unit_launcher/artillery_unit_launcher.json":{}, "/pa/units/land/artillery_unit_launcher/artillery_unit_launcher.json.player":{}, "/pa/units/land/artillery_unit_launcher/artillery_unit_launcher.json.ai":{}, "/pa/units/land/fabrication_vehicle_adv/fabrication_vehicle_adv.json":{}, "/pa/units/land/fabrication_vehicle_adv/fabrication_vehicle_adv.json.player":{}, "/pa/units/land/fabrication_vehicle_adv/fabrication_vehicle_adv.json.ai":{}, "/pa/units/land/land_scout/land_scout.json":{}, "/pa/units/land/land_scout/land_scout.json.player":{}, "/pa/units/land/land_scout/land_scout.json.ai":{}, "/pa/units/land/titan_bot/titan_bot.json":{}, "/pa/units/land/titan_bot/titan_bot.json.player":{}, "/pa/units/land/titan_bot/titan_bot.json.ai":{}, "/pa/units/land/tank_light_laser/tank_light_laser.json":{}, "/pa/units/land/tank_light_laser/tank_light_laser.json.player":{}, "/pa/units/land/tank_light_laser/tank_light_laser.json.ai":{}, "/pa/units/land/metal_extractor_adv/metal_extractor_adv.json":{}, "/pa/units/land/metal_extractor_adv/metal_extractor_adv.json.player":{}, "/pa/units/land/metal_extractor_adv/metal_extractor_adv.json.ai":{}, "/pa/units/land/laser_defense/laser_defense.json":{}, "/pa/units/land/laser_defense/laser_defense.json.player":{}, "/pa/units/land/laser_defense/laser_defense.json.ai":{}, "/pa/units/land/laser_defense_adv/laser_defense_adv.json":{}, "/pa/units/land/laser_defense_adv/laser_defense_adv.json.player":{}, "/pa/units/land/laser_defense_adv/laser_defense_adv.json.ai":{}, "/pa/units/land/laser_defense_single/laser_defense_single.json":{}, "/pa/units/land/laser_defense_single/laser_defense_single.json.player":{}, "/pa/units/land/laser_defense_single/laser_defense_single.json.ai":{}, "/pa/units/land/metal_extractor/metal_extractor.json":{}, "/pa/units/land/metal_extractor/metal_extractor.json.player":{}, "/pa/units/land/metal_extractor/metal_extractor.json.ai":{}, "/pa/units/land/metal_storage/metal_storage.json":{}, "/pa/units/land/metal_storage/metal_storage.json.player":{}, "/pa/units/land/metal_storage/metal_storage.json.ai":{}, "/pa/units/sea/torpedo_launcher/torpedo_launcher.json":{}, "/pa/units/sea/torpedo_launcher/torpedo_launcher.json.player":{}, "/pa/units/sea/torpedo_launcher/torpedo_launcher.json.ai":{}, "/pa/units/land/nuke_launcher/nuke_launcher.json":{}, "/pa/units/land/nuke_launcher/nuke_launcher.json.player":{}, "/pa/units/land/nuke_launcher/nuke_launcher.json.ai":{}, "/pa/units/land/nuke_launcher/nuke_launcher_ammo.json":{}, "/pa/units/land/nuke_launcher/nuke_launcher_ammo.json.player":{}, "/pa/units/land/nuke_launcher/nuke_launcher_ammo.json.ai":{}, "/pa/units/land/radar/radar.json":{}, "/pa/units/land/radar/radar.json.player":{}, "/pa/units/land/radar/radar.json.ai":{}, "/pa/units/land/radar_adv/radar_adv.json":{}, "/pa/units/land/radar_adv/radar_adv.json.player":{}, "/pa/units/land/radar_adv/radar_adv.json.ai":{}, "/pa/units/land/tactical_missile_launcher/tactical_missile_launcher.json":{}, "/pa/units/land/tactical_missile_launcher/tactical_missile_launcher.json.player":{}, "/pa/units/land/tactical_missile_launcher/tactical_missile_launcher.json.ai":{}, "/pa/units/land/tank_heavy_mortar/tank_heavy_mortar.json":{}, "/pa/units/land/tank_heavy_mortar/tank_heavy_mortar.json.player":{}, "/pa/units/land/tank_heavy_mortar/tank_heavy_mortar.json.ai":{}, "/pa/units/land/unit_cannon/unit_cannon.json":{}, "/pa/units/land/unit_cannon/unit_cannon.json.player":{}, "/pa/units/land/unit_cannon/unit_cannon.json.ai":{}, "/pa/units/land/vehicle_factory_adv/vehicle_factory_adv.json":{}, "/pa/units/land/vehicle_factory_adv/vehicle_factory_adv.json.player":{}, "/pa/units/land/vehicle_factory_adv/vehicle_factory_adv.json.ai":{}, "/pa/units/orbital/base_orbital_structure/base_orbital_structure.json":{}, "/pa/units/orbital/base_orbital_structure/base_orbital_structure.json.player":{}, "/pa/units/orbital/base_orbital_structure/base_orbital_structure.json.ai":{}, "/pa/units/orbital/deep_space_radar/deep_space_radar.json":{}, "/pa/units/orbital/deep_space_radar/deep_space_radar.json.player":{}, "/pa/units/orbital/deep_space_radar/deep_space_radar.json.ai":{}, "/pa/units/orbital/defense_satellite/defense_satellite.json":{}, "/pa/units/orbital/defense_satellite/defense_satellite.json.player":{}, "/pa/units/orbital/defense_satellite/defense_satellite.json.ai":{}, "/pa/units/orbital/ion_defense/ion_defense.json":{}, "/pa/units/orbital/ion_defense/ion_defense.json.player":{}, "/pa/units/orbital/ion_defense/ion_defense.json.ai":{}, "/pa/units/sea/drone_carrier/drone/drone.json":{}, "/pa/units/sea/drone_carrier/drone/drone.json.player":{}, "/pa/units/sea/drone_carrier/drone/drone.json.ai":{}, "/pa/units/orbital/mining_platform/mining_platform.json":{}, "/pa/units/orbital/mining_platform/mining_platform.json.player":{}, "/pa/units/orbital/mining_platform/mining_platform.json.ai":{}, "/pa/units/orbital/orbital_fabrication_bot/orbital_fabrication_bot.json":{}, "/pa/units/orbital/orbital_fabrication_bot/orbital_fabrication_bot.json.player":{}, "/pa/units/orbital/orbital_fabrication_bot/orbital_fabrication_bot.json.ai":{}, "/pa/units/orbital/orbital_factory/orbital_factory.json":{}, "/pa/units/orbital/orbital_factory/orbital_factory.json.player":{}, "/pa/units/orbital/orbital_factory/orbital_factory.json.ai":{}, "/pa/units/orbital/orbital_fighter/orbital_fighter.json":{}, "/pa/units/orbital/orbital_fighter/orbital_fighter.json.player":{}, "/pa/units/orbital/orbital_fighter/orbital_fighter.json.ai":{}, "/pa/units/orbital/orbital_lander/orbital_lander.json":{}, "/pa/units/orbital/orbital_lander/orbital_lander.json.player":{}, "/pa/units/orbital/orbital_lander/orbital_lander.json.ai":{}, "/pa/units/orbital/orbital_laser/orbital_laser.json":{}, "/pa/units/orbital/orbital_laser/orbital_laser.json.player":{}, "/pa/units/orbital/orbital_laser/orbital_laser.json.ai":{}, "/pa/units/orbital/orbital_launcher/orbital_launcher.json":{}, "/pa/units/orbital/orbital_launcher/orbital_launcher.json.player":{}, "/pa/units/orbital/orbital_launcher/orbital_launcher.json.ai":{}, "/pa/units/orbital/radar_satellite/radar_satellite.json":{}, "/pa/units/orbital/radar_satellite/radar_satellite.json.player":{}, "/pa/units/orbital/radar_satellite/radar_satellite.json.ai":{}, "/pa/units/orbital/radar_satellite_adv/radar_satellite_adv.json":{}, "/pa/units/orbital/radar_satellite_adv/radar_satellite_adv.json.player":{}, "/pa/units/orbital/radar_satellite_adv/radar_satellite_adv.json.ai":{}, "/pa/units/sea/attack_sub/attack_sub.json":{}, "/pa/units/sea/attack_sub/attack_sub.json.player":{}, "/pa/units/sea/attack_sub/attack_sub.json.ai":{}, "/pa/units/sea/base_ship/base_ship.json":{}, "/pa/units/sea/base_ship/base_ship.json.player":{}, "/pa/units/sea/base_ship/base_ship.json.ai":{}, "/pa/units/sea/battleship/battleship.json":{}, "/pa/units/sea/battleship/battleship.json.player":{}, "/pa/units/sea/battleship/battleship.json.ai":{}, "/pa/units/sea/fabrication_ship_adv/fabrication_ship_adv.json":{}, "/pa/units/sea/fabrication_ship_adv/fabrication_ship_adv.json.player":{}, "/pa/units/sea/fabrication_ship_adv/fabrication_ship_adv.json.ai":{}, "/pa/units/sea/frigate/frigate.json":{}, "/pa/units/sea/frigate/frigate.json.player":{}, "/pa/units/sea/frigate/frigate.json.ai":{}, "/pa/units/sea/naval_factory_adv/naval_factory_adv.json":{}, "/pa/units/sea/naval_factory_adv/naval_factory_adv.json.player":{}, "/pa/units/sea/naval_factory_adv/naval_factory_adv.json.ai":{}, "/pa/units/sea/sea_mine/sea_mine.json":{}, "/pa/units/sea/sea_mine/sea_mine.json.player":{}, "/pa/units/sea/sea_mine/sea_mine.json.ai":{}, "/pa/units/sea/sea_scout/sea_scout.json":{}, "/pa/units/sea/sea_scout/sea_scout.json.player":{}, "/pa/units/sea/sea_scout/sea_scout.json.ai":{}, "/pa/units/air/solar_drone/solar_drone.json":{}, "/pa/units/air/solar_drone/solar_drone.json.player":{}, "/pa/units/air/solar_drone/solar_drone.json.ai":{}, "/pa/units/air/strafer/strafer.json":{}, "/pa/units/air/strafer/strafer.json.player":{}, "/pa/units/air/strafer/strafer.json.ai":{}, "/pa/units/air/support_platform/support_platform.json":{}, "/pa/units/air/support_platform/support_platform.json.player":{}, "/pa/units/air/support_platform/support_platform.json.ai":{}, "/pa/units/air/titan_air/titan_air.json":{}, "/pa/units/air/titan_air/titan_air.json.player":{}, "/pa/units/air/titan_air/titan_air.json.ai":{}, "/pa/units/commanders/tutorial_ai_commander/tutorial_ai_commander.json":{}, "/pa/units/commanders/tutorial_ai_commander/tutorial_ai_commander.json.player":{}, "/pa/units/commanders/tutorial_ai_commander/tutorial_ai_commander.json.ai":{}, "/pa/units/commanders/tutorial_ai_commander_2/tutorial_ai_commander_2.json":{}, "/pa/units/commanders/tutorial_ai_commander_2/tutorial_ai_commander_2.json.player":{}, "/pa/units/commanders/tutorial_ai_commander_2/tutorial_ai_commander_2.json.ai":{}, "/pa/units/commanders/tutorial_ai_commander_3/tutorial_ai_commander_3.json":{}, "/pa/units/commanders/tutorial_ai_commander_3/tutorial_ai_commander_3.json.player":{}, "/pa/units/commanders/tutorial_ai_commander_3/tutorial_ai_commander_3.json.ai":{}, "/pa/units/commanders/tutorial_titan_commander/tutorial_titan_commander.json":{}, "/pa/units/commanders/tutorial_titan_commander/tutorial_titan_commander.json.player":{}, "/pa/units/commanders/tutorial_titan_commander/tutorial_titan_commander.json.ai":{}, "/pa/units/land/bot_nanoswarm/bot_nanoswarm.json":{}, "/pa/units/land/bot_nanoswarm/bot_nanoswarm.json.player":{}, "/pa/units/land/bot_nanoswarm/bot_nanoswarm.json.ai":{}, "/pa/units/land/bot_support_commander/bot_support_commander.json":{}, "/pa/units/land/bot_support_commander/bot_support_commander.json.player":{}, "/pa/units/land/bot_support_commander/bot_support_commander.json.ai":{}, "/pa/units/land/bot_tesla/bot_tesla.json":{}, "/pa/units/land/bot_tesla/bot_tesla.json.player":{}, "/pa/units/land/bot_tesla/bot_tesla.json.ai":{}, "/pa/units/land/tank_flak/tank_flak.json":{}, "/pa/units/land/tank_flak/tank_flak.json.player":{}, "/pa/units/land/tank_flak/tank_flak.json.ai":{}, "/pa/units/land/tank_hover/tank_hover.json":{}, "/pa/units/land/tank_hover/tank_hover.json.player":{}, "/pa/units/land/tank_hover/tank_hover.json.ai":{}, "/pa/units/land/tank_nuke/tank_nuke.json":{}, "/pa/units/land/tank_nuke/tank_nuke.json.player":{}, "/pa/units/land/tank_nuke/tank_nuke.json.ai":{}, "/pa/units/land/radar_jammer/radar_jammer.json":{}, "/pa/units/land/radar_jammer/radar_jammer.json.player":{}, "/pa/units/land/radar_jammer/radar_jammer.json.ai":{}, "/pa/units/land/titan_structure/titan_structure.json":{}, "/pa/units/land/titan_structure/titan_structure.json.player":{}, "/pa/units/land/titan_structure/titan_structure.json.ai":{}, "/pa/units/land/titan_vehicle/titan_vehicle.json":{}, "/pa/units/land/titan_vehicle/titan_vehicle.json.player":{}, "/pa/units/land/titan_vehicle/titan_vehicle.json.ai":{}, "/pa/units/orbital/orbital_carrier/orbital_carrier.json":{}, "/pa/units/orbital/orbital_carrier/orbital_carrier.json.player":{}, "/pa/units/orbital/orbital_carrier/orbital_carrier.json.ai":{}, "/pa/units/orbital/titan_orbital/titan_orbital.json":{}, "/pa/units/orbital/titan_orbital/titan_orbital.json.player":{}, "/pa/units/orbital/titan_orbital/titan_orbital.json.ai":{}, "/pa/units/sea/drone_carrier/carrier/carrier.json":{}, "/pa/units/sea/drone_carrier/carrier/carrier.json.player":{}, "/pa/units/sea/drone_carrier/carrier/carrier.json.ai":{}, "/pa/units/sea/fabrication_barge/fabrication_barge.json":{}, "/pa/units/sea/fabrication_barge/fabrication_barge.json.player":{}, "/pa/units/sea/fabrication_barge/fabrication_barge.json.ai":{}, "/pa/units/land/tank_anti_nuke/tank_anti_nuke.json":{}, "/pa/units/land/tank_anti_nuke/tank_anti_nuke.json.player":{}, "/pa/units/land/tank_anti_nuke/tank_anti_nuke.json.ai":{} },
	buildHover: undefined,
	showBuildHover: undefined,
	setBuildHover: function (id) {
		let details = self.itemDetails[id];
		let resolvedBy = details ? "exact" : "";
		if (!details && id) {
			const currentTag = currentGwUnitSpecTag();
			const strip = (/(.*\.json)[^\/]*$/).exec(id);
			const canonicalId = strip && strip[1];
			details = self.itemDetails[id + currentTag];
			if (details) {
				resolvedBy = "id+currentTag";
			}

			if (!details) {
				details = self.itemDetails[id + ".player"];
				if (details) {
					resolvedBy = "id+.player";
				}
			}

			if (!details) {
				details = self.itemDetails[id + ".ai"];
				if (details) {
					resolvedBy = "id+.ai";
				}
			}

			if (!details && canonicalId) {
				details = self.itemDetails[canonicalId + currentTag];
				if (details) {
					resolvedBy = "canonical+currentTag";
				}
			}

			if (!details && canonicalId) {
				details = self.itemDetails[canonicalId + ".player"];
				if (details) {
					resolvedBy = "canonical+.player";
				}
			}

			if (!details && canonicalId) {
				details = self.itemDetails[canonicalId + ".ai"];
				if (details) {
					resolvedBy = "canonical+.ai";
				}
			}

			if (!details && canonicalId) {
				details = self.itemDetails[canonicalId];
				if (details) {
					resolvedBy = "canonical";
				}
			}
		}

		logGwCoopOnce("setBuildHover", "id=" + id + " resolvedBy=" + (resolvedBy || "missing") + " cost=" + (details && _.isFunction(details.cost) ? details.cost() : ""));
		self.buildHover(details);
	},
	clearBuildHover: function () { self.setBuildHover("") },
	buildHoverState: undefined,
	buildItemSize: undefined,
	worldHoverTarget: undefined,
	hasWorldHoverTarget: undefined,
	fabCount: undefined,
	batchBuildSize: undefined,
	currentBuildStructureId: undefined,
	buildItem: function (item) {
		self.activatedBuildId(item.id);

		if (item.structure || item.titan) {
			if (self.currentBuildStructureId() === item.id && self.mode() === "fab") return;

			self.currentBuildStructureId(item.id);
			self.endCommandMode();
			api.arch.beginFabMode(item.id)
			.then(function (ok) { if (!ok) { self.endFabMode() } });
			self.mode("fab");
			self.fabCount(0);
		} else {
			api.unit.build(item.id, 1, false).then(function (success) {
				if (success) api.audio.playSound("/SE/UI/UI_Command_Build");
			});
		}
	},
	buildItemBySpec: function (spec_id) {
		let item = self.unitSpecs[spec_id];
		if (!item && spec_id) {
			const currentTag = currentGwUnitSpecTag();
			const strip = (/(.*\.json)[^\/]*$/).exec(spec_id);
			const canonicalId = strip && strip[1];
			item = self.unitSpecs[spec_id + currentTag] || self.unitSpecs[spec_id + ".player"] || self.unitSpecs[spec_id + ".ai"];

			if (!item && canonicalId) item = self.unitSpecs[canonicalId + currentTag] || self.unitSpecs[canonicalId + ".player"] || self.unitSpecs[canonicalId + ".ai"];

			if (!item && canonicalId) item = self.unitSpecs[canonicalId];
		}
		if (item) self.buildItem(item);
	},
	executeStartBuild: function (params) {
		const id = params.item;
		const batch = params.batch;
		const cancel = params.cancel;
		const urgent = params.urgent;
		const more = params.more;

		if (self.selectedMobile()) {
			self.endCommandMode();
			self.currentBuildStructureId(id);
			api.arch.beginFabMode(id)
			.then(function (ok) {
				if (!ok) self.endFabMode();
			});

			self.mode("fab");
			self.fabCount(0);
		} else {
			const count = batch ? self.batchBuildSize() : 1;
			if (cancel) {
				api.unit.cancelBuild(id, count, urgent);
				api.audio.playSound("/SE/UI/UI_factory_remove_from_queue");
			} else {
				api.unit.build(id, count, urgent).then(function (success) {
					if (success) {
						const secondary = more ? "_secondary" : "";
						api.audio.playSound("/SE/UI/UI_Command_Build" + secondary);
					}
				});
			}
		}
	},
	endFabMode: function () {
		self.mode("default");
		api.arch.endFabMode();
		self.currentBuildStructureId("");
	},
	maybeSetBuildTarget: function (spec_id) {
		const list = (self.buildTabLists().length) ? self.buildTabLists()[0] : [];
		let i;

		engine.call("unit.debug.setSpecId", spec_id);

		for (i = 0; i < list.length; i++) {
			if (list[i].id === spec_id) {
				self.buildItemBySpec(spec_id);
				return;
			}
		}
	},
	maybeSetBuildTargetFromSequence: function (target_index, spec_id_list) {
		const list = (self.buildTabLists().length) ? self.buildTabLists()[0] : [];
		const index = -1;

		const valid = [];

		_.forEach(spec_id_list, function (target) {
			_.forEach(list, function (element) {
				if (element.id === target.specId()) valid.push(element.id);
			});
		});

		if (valid.length) self.buildItemBySpec(valid[target_index % valid.length]);
	},
	spawnCommander: function () {
		engine.call("send_launch_message");
	},
	landingOk: function () {
		engine.call("launch_commander");
	},
	abandon: function () {
		self.resetGameInfo();
		const removeDeferred = $.Deferred();
		$.when(self.haveUberNet() && api.net.removePlayerFromGame()).always(removeDeferred.resolve);

		if (self.serverMode() !== "replay") {
			const surrenderDeferred = $.Deferred();
			api.select.commander().always(function () {
				api.camera.track(true);
				self.send_message("surrender", {}, function () {
					surrenderDeferred.resolve();
				});
			});

			// Make sure this promise is fulfilled in at least 3 seconds.
			_.delay(function () {
				// Calling reject() after resolve() leaves the promise as resolved,
				// *not* rejected, and fail() callbacks are not called. This is
				// intended & documented. That makes this fine to do unconditionally.
				surrenderDeferred.reject();
			}, 3000);

			return $.when(removeDeferred, surrenderDeferred);
		} else {
			return removeDeferred.promise();
		}
	},
	navToGameOptions: function () {
		engine.call("pop_mouse_constraint_flag");
		engine.call("game.allowKeyboard", true);

		window.location.href = "coui://ui/main/game/settings/settings.html";
		/* window.location.href will not stop execution. */
	},
	mainMenuUrl: undefined,
	navToUrl: function (url) {
		self.transitPrimaryMessage(loc("!LOC:Returning to Main Menu"));
		self.transitSecondaryMessage("");
		self.transitDestination(url);
		self.transitDelay(0);
		window.location.href = "coui://ui/main/game/transit/transit.html";
		/* window.location.href will not stop execution. */
	},
	navToStart: function () {
		self.navToUrl(self.mainMenuUrl());
	},
	navToMainMenu: function () {
		engine.call("pop_mouse_constraint_flag");
		engine.call("game.allowKeyboard", true);

		self.abandon().always(function () {
			self.userTriggeredDisconnect(true);
			self.disconnect();
			self.navToStart();
		});
	},
	navToTransit: function () {
		engine.call("pop_mouse_constraint_flag");
		engine.call("game.allowKeyboard", true);

		self.disconnect();

		window.location.href = "coui://ui/main/game/transit/transit.html";
		/* window.location.href will not stop execution. */
	},
	exitGame: function () {
		engine.call("pop_mouse_constraint_flag");
		engine.call("game.allowKeyboard", true);

		self.abandon().always(function () {
			self.userTriggeredDisconnect(true);
			self.disconnect();
			self.exit();
		});
	},
	selection: undefined,
	hasSelection: undefined,
	selectionTypes: undefined,
	selectedAllMatchingCurrentSelectionOnScreen: function () {
		self.holodeck.selectMatchingTypes("add", self.selectionTypes());
	},
	onSelectionDisplayClick: function (index, event, force_remove) {
		let option = getSelectOption(event);
		if (event.button === 2 || force_remove) /* right click */
			option = "remove";
		const now = new Date().getTime();
		const double = (now <= selectionDisplayClickState.doubleTime) && (index === selectionDisplayClickState.index) && !force_remove;
		let invert = false;
		let types = self.selectionTypes();

		selectionDisplayClickState = {
			doubleTime: now + input.doubleTap.timeout,
			index: index,
		};

		switch (option) {
			case "toggle": option = "remove"; break;
			case "add": if (!double) return; break; // Already in the selection
			case "":
				if (!double) {
					if (types.length === 1) return;
					invert = true;
					option = "remove";
				}
				break;
		}
		const type = types[index % types.length];
		if (type) {
			if (invert) {
				types = types.slice(0);
				types.splice(index % types.length, 1);
				self.holodeck.view.selectByTypes(option, types);
			} else self.holodeck.view.selectByTypes(option, [type]);
		}
	},
	build_orders: {},
	showOrders: undefined,
	showBuildList: undefined,
	showCommands: undefined,
	showActionBar: undefined,
	parseSelection: function (payload) {
		let i = 0;
		const tabs = {};
		let selectionCanBuild = false;

		const resolveUnitSpec = function (id) {
			let unit = self.unitSpecs[id];
			if (unit) {
				logGwCoopOnce("parseSelection resolveUnitSpec", "id=" + id + " resolvedBy=exact");
				return unit;
			}

			const currentTag = currentGwUnitSpecTag();

			// Fallback across tagged/untagged ids:
			// foo/bar/unit.json.player <-> foo/bar/unit.json
			const strip = (/(.*\.json)[^\/]*$/).exec(id);
			if (strip && strip[1]) {
				unit = self.unitSpecs[strip[1] + currentTag];
				if (unit) {
					logGwCoopOnce("parseSelection resolveUnitSpec", "id=" + id + " resolvedBy=canonical+currentTag target=" + strip[1] + currentTag);
					return unit;
				}

				unit = self.unitSpecs[strip[1]];
				if (unit) {
					logGwCoopOnce("parseSelection resolveUnitSpec", "id=" + id + " resolvedBy=canonical target=" + strip[1]);
					return unit;
				}
			}

			// If id is untagged, also try common GW tags.
			unit = self.unitSpecs[id + currentTag];
			if (unit) {
				logGwCoopOnce("parseSelection resolveUnitSpec", "id=" + id + " resolvedBy=currentTag target=" + id + currentTag);
				return unit;
			}

			unit = self.unitSpecs[id + ".player"] || self.unitSpecs[id + ".ai"];
			if (unit) {
				logGwCoopOnce("parseSelection resolveUnitSpec", "id=" + id + " resolvedBy=playerOrAi target=" + unit.id);
				return unit;
			}

			logGwCoopOnce("parseSelection resolveUnitSpec", "id=" + id + " resolvedBy=missing");
			return null;
		};

		self.allowedCommands = {};

		self.buildItemMinIndex(0);

		self.cmdIndex(-1);
		self.selectionTypes([]);

		for (const id in payload.spec_ids) {
			const unit = resolveUnitSpec(id);
			if (!unit) continue;

			for (i = 0; i < unit.commands.length; i++) self.allowedCommands[unit.commands[i]] = true;

			selectionCanBuild |= unit.canBuild;

			self.selectionTypes().push(id);
		}

		if (!tabs[self.activeBuildGroup()]) self.activeBuildGroup(null);

		self.selectedMobile(payload.selected_mobile);

		if (self.reviewMode() || self.isSpectator()) selectionCanBuild = false;

		if (selectionCanBuild) {
			if (self.selectedMobile()) {
				modify_keybinds({ remove: ["build unit"], add: ["build structure"] });
			} else {
				modify_keybinds({ remove: ["build structure"], add: ["build unit"] });
			}
		} else {
			modify_keybinds({ remove: ["build structure", "build unit"] });
			model.clearBuildSequence();
		}

		if (!$.isEmptyObject(payload.spec_ids)) self.selection(payload);
		else self.selection(null);
	},
	actionBarState: undefined,
	actionBarStateMutation: undefined,
	focusedHolodeck: undefined,
	cameraMode: undefined,
	updateCameraMode: function () {
		const holodeck = api.Holodeck.focused;

		const cameraMode = holodeck.cameraMode();

		const existingCameraMode = model.cameraMode();

		if (existingCameraMode == cameraMode) return;

		model.cameraMode(cameraMode);

		if (cameraMode == "space" || cameraMode == "planet") {
			remove_keybinds("free camera controls");
		} else {
			apply_keybinds("free camera controls");
		}
	},
	pauseCamera: undefined,
	alignCameraToPole: function () {
		api.camera.alignToPole();
	},
	focusSun: function () {
		api.camera.focusPlanet(-1);
	},
	changeFocusPlanet: function (delta) {
		let planets = model.celestialViewModels(),
			oldFocus = api.camera.getFocus(api.Holodeck.focused.id).planet(),
			idx = (oldFocus != -1) ? oldFocus : (delta > 0 ? 0 : planets.length - 1),
			sentinel = idx,
			advance = function () {
				idx = (idx + delta + planets.length) % planets.length;
				return (idx === sentinel) ? null : planets[idx];
			},
			planet;

		if (delta !== -1 && delta !== 1) return;

		while (planet = advance()) {
			if (!planet.dead() && !planet.isSun()) {
				api.camera.focusPlanet(idx);
				api.audio.playSound("/SE/UI/UI_planet_switch_select");
				return;
			}
		}

		// Begin change
		// we wrapped around to the starting planet
		api.camera.focusPlanet(idx);
		api.audio.playSound("/SE/UI/UI_planet_switch_select");
		// End change
	},
	focusNextPlanet: function () {
		self.changeFocusPlanet(1);
	},
	focusPreviousPlanet: function () {
		self.changeFocusPlanet(-1);
	},
	doCustomAlert: function (payload) {
		return api.panels.unit_alert.query("custom_alert", payload);
	},
	clippingPanels: { build_bar:true },
	showAlertPreview: function (request) {
		const target = request.target,
			placement = request.placement,
			previewHolodeck = placement.holodeck ? (new Function("self", "return self." + placement.holodeck))(self) : self.preview;

		if (previewHolodeck === self.pips[0] && self.pips.length > 0) self.showPips(true);
		else previewHolodeck.$div.show();

		if (previewHolodeck === self.preview) {
			const
				panelOffset = $(api.panels[placement.panelName]._div).offset(),
				left = panelOffset.left + placement.offset[0] + placement.alignDeck[0] * $(previewHolodeck.div).width(),
				top = panelOffset.top + placement.offset[1] + placement.alignDeck[1] * $(previewHolodeck.div).height();

			// todo soon: grab planet info off the holodeck's camera and use it to display the planet name!
			previewHolodeck.$div.css({ left: left + "px", top: top + "px", position: "absolute" });
		}

		previewHolodeck.update();
		_.delay(api.Panel.update);

		const focused = api.Holodeck.focused;
		previewHolodeck.focus();

		if (!previewHolodeck.hasLookedAtPlanet) {
			/* patch around an arcane focus issue */
			api.camera.focusPlanet(0);
			previewHolodeck.hasLookedAtPlanet = true;
		}

		if (typeof target.control_group === "number") {
			api.camera.track(true, target.control_group);
		} else if (typeof target.planetIdx === "number") {
			const anchor = api.camera.getPlanetAnchor(self.holodeck, target.planetIdx);
			/* this could be a nice place to use holodeck tracking, if the primary holodeck is currently looking at this planet */
			if (anchor) {
				api.camera.recallAnchor(anchor);
			} else {
				api.camera.focusPlanet(target.planetIdx);
			}
		} else if (target.planetIdx === "sun") {
			api.camera.setZoom("celestial", false);
		} else {
			api.camera.lookAt(target);
		}
		if (focused) focused.focus();

		updatePreviewClipping();
	},
	hideAlertPreview: function () {
		self.preview.$div.hide();
		self.preview.update();

		updatePreviewClipping();

		_.delay(api.Panel.update);
	},
	trackCommander: function (holodeck, armyId) {
		let focusToRestore = false;

		if (holodeck) {
			holodeck = (new Function("self", "return self." + holodeck))(self);

			if (holodeck) {
				if (self.pips.length > 0 && holodeck === self.pips[0]) self.showPips(true);

				focusToRestore = api.Holodeck.focused;
				holodeck.focus();
			}
		}

		if (armyId) api.select.armyCommanders(armyId);
		else api.select.commander();

		api.camera.track(true);

		if (focusToRestore) {
			focusToRestore.focus();
		}
	},
	update: function () {
		if (self.defeated()) return;

		if (!self.showTimeControls()) {
			triggerModel.testEvent(constants.event_type.low_metal, self.metalFraction());
			triggerModel.testEvent(constants.event_type.full_metal, 1.0 - self.metalFraction());
			triggerModel.testEvent(constants.event_type.low_energy, self.energyFraction());
			triggerModel.testEvent(constants.event_type.full_energy, 1.0 - self.energyFraction());
			triggerModel.testEvent(constants.event_type.under_attack, self.metalLost());
			if (self.commanderHealth() > 0) {
				triggerModel.testEvent(constants.event_type.commander_under_attack, self.commanderHealth());
				triggerModel.testEvent(constants.event_type.commander_healed, self.commanderHealth());
				triggerModel.testEvent(constants.event_type.commander_low_health, self.commanderHealth());
				triggerModel.testEvent(constants.event_type.commander_under_attack_very_low_health, self.commanderHealth());
			}
			triggerModel.testEvent(constants.event_type.in_combat, self.combatUnitsInCombat());
			triggerModel.testEvent(constants.event_type.metal_lost, self.metalLost());
			triggerModel.testEvent(constants.event_type.enemy_metal_destroyed, self.enemyMetalDestroyed());
		}
	},
	startRagnarokMusic: function () {
		audioModel.triggerRagnarokMusic();
	},
	stopRagnarokMusic: function () {
		audioModel.stopRagnarokMusic();
	},
	processExternalUnitEvent: function (type, payload) {
		eventSystem.processEvent(type, payload);
	},
	musicHasStarted: undefined,
	maybePlayStartingMusic: function () {
		if (self.musicHasStarted()) return;

		const starting_music_map = {
			earth: "/Music/Music_Planet_Load_Earth",
			lava: "/Music/Music_Planet_Load_Lava",
			moon: "/Music/Music_Planet_Load_Moon",
			ice: "/Music/Music_Planet_Load_Ice",
			tropical: "/Music/Music_Planet_Load_Tropical",
			gas: "/Music/Music_Planet_Load_Gas",
			water: "/Music/Music_Planet_Load_water",
			metal: "/Music/Music_Planet_Load_Metal",
		};

		let starting_music = starting_music_map[model.startingPlanetBiome()];
		starting_music ||= starting_music_map.earth;

		api.audio.setMusic(starting_music);

		self.musicHasStarted(true);
	},
	gamestatsPanelIsOpen: undefined,
	toggleGamestatsPanel: function () {
		self.gamestatsPanelIsOpen(!self.gamestatsPanelIsOpen());
		self.closeMenu();
	},
	setStatsPanelState: function (open) {
		self.gamestatsPanelIsOpen(open);
	},
	toggleMenu: function () {
		if (self.saving()) return;

		self.menuIsOpen(!self.menuIsOpen());

		if (self.menuIsOpen()) engine.call("push_mouse_constraint_flag", false);
		else engine.call("pop_mouse_constraint_flag");
	},
	closeMenu: function () {
		if (self.menuIsOpen()) self.toggleMenu();
	},
	menuPauseGame: function () {
		self.pauseSim();
		self.closeMenu();
	},
	menuResumeGame: function () {
		self.playSim();
		self.closeMenu();
	},
	menuTogglePlayerGuide: function () {
		self.toggleShowPlayerGuide();
		self.closeMenu();
	},
	menuToggleChronoCam: function () {
		self.showTimeControls(!self.showTimeControls());
		self.closeMenu();
	},
	menuTogglePOV: function () {
		self.togglePrimaryPOV();
		self.closeMenu();
	},
	menuSettings: function () {
		self.showSettings(true);
		self.closeMenu();
	},
	menuSurrender: function () {
		self.closeMenu();
		self.popUp({ message: "!LOC:Surrender Game?" }).then(function (result) {
			if (result === 0) {
				self.closeMenu();

				// Abandoning should take you to the game_over state, but if it fails (times out), we disconnect
				// and move you to the main menu. It's probably happening because the server is hanging.
				self.abandon().fail(function () {
					engine.call("pop_mouse_constraint_flag");
					engine.call("game.allowKeyboard", true);

					self.userTriggeredDisconnect(true);
					self.disconnect();
					self.navToStart();
				});
			}
		});
	},
	menuExit: function () {
		self.closeMenu();
		self.popUp({
			buttons : [
				"!LOC:Quit to Main Menu",
				"!LOC:Cancel",
			],
			message: "!LOC:Quit Game",
		}).then(function (result) {
			switch (result) {
				case 0: self.navToMainMenu(); break;
				case 2: /* do nothing */ break;
			}
		});
	},
	menuSave: function () {
		self.closeMenu();

		const was_paused = self.paused();
		if (!was_paused && !self.gameOver()) self.pauseSim();

		const text = (self.singleHumanPlayer() ? "AI Skirmish" : "Multiplayer Battle") +
                    " " + UberUtility.createDateTimeString();

		self.popUp({
			message: "!LOC:Save Game",
			textfield: true,
			defaultText: text,
			filename: true,
			buttons: [
				"!LOC:Save",
				"!LOC:Cancel",
			],
		}).then(function (result) {
			if (result) { /* popup will return the entered text or a falsely value */
				const payload = { name: String(result), type: String("") };
				model.send_message("write_replay", payload);
			} else if (!was_paused) self.playSim();
		});
	},
	maybeDeleteUnits: function () {
		if (!model.selection()) return;

		self.popUp({ message: "!LOC:Destroy selected units?" }).then(function (result) {
			if (result === 0) api.unit.selfDestruct();
		});
	},
	menuAction: function (action) { self[action]() },
	menuConfigGenerator: undefined,
	menuConfig: undefined,
	modalBack: function () {
		if (model.mode() === "fab") model.endFabMode();
		else if (model.chatSelected()) {
			model.chatSelected(false);
		} else if (model.mode() === "landing") {
			model.toggleMenu();
		} else if (model.mode() === "default") {
			if (model.hasSelection()) {
				if (model.activeBuildGroup()) model.clearBuildSequence();
				else {
					api.select.empty();
					model.selection(null);
				}
			} else if (model.showTimeControls()) {
				model.showTimeControls(false);
			} else {
				model.toggleMenu();
			}
		} else if ((model.mode() || "").indexOf("command_") === 0) model.endCommandMode();
		else model.mode("default");
	},
	globalMousemoveHandler: function (element, event) {
		self.idleTime = 0;
	},
	globalClickHandler: function (element, event) {
		input.doubleTap.reset();
	},
	globalKeyupHandler: function (element, event) {
		if (keyupResponse) keyupResponse();
		keyupResponse = null;
	},
	setupWatchList: function () {
		engine.call("watchlist.setCreationAlertTypes", JSON.stringify(["Factory", "Recon", "Titan", "Important"]), JSON.stringify([]));
		engine.call("watchlist.setIdleAlertTypes", JSON.stringify([/* 'Factory' */]), JSON.stringify([])); /* disabled until the alert ui can be cleaned up. */
		engine.call("watchlist.setArrivalAlertTypes", JSON.stringify(["Commander", "Transport"]), JSON.stringify([]));
		engine.call("watchlist.setDamageAlertTypes", JSON.stringify(["Commander", "Titan"]), JSON.stringify([]));
		engine.call("watchlist.setDeathAlertTypes", JSON.stringify(["Factory", "Commander", "Recon", "Important", "Titan"]), JSON.stringify(["Wall"]));
		engine.call("watchlist.setSightAlertTypes", JSON.stringify(["Factory", "Commander", "Recon", "Important", "Titan"]), JSON.stringify(["Wall"]));
		engine.call("watchlist.setTargetDestroyedAlertTypes", JSON.stringify(["Factory", "Commander", "Recon", "Titan", "Important"]), JSON.stringify(["Wall"]));
		engine.call("watchlist.setAmmoAlertTypes", JSON.stringify(["SelfDestruct", "Nuke", "Artillery", "NukeDefense"]), JSON.stringify([]));
	},
	setup: function () {
		self.refreshSettings();

		ko.observable().extend({ session: "has_entered_game" })(true);

		engine.call("push_mouse_constraint_flag", true);
		engine.call("request_spec_data", -1);
		engine.call("request_model_refresh");
		engine.call("set_ui_music_state", "in_game");

		self.showGameLoading(true);
		self.holodeck.view.arePlanetsReady().then(function (ready) {
			if (!ready) {
				self.holodeck.view.whenPlanetsReady().done(function () {
					// Note: delayed a bit to avoid a black screen in some situations
					setTimeout(function () { self.showGameLoading(false) }, 10);
				});
			} else {
				self.showGameLoading(false);
			}
		});

		self.lastSceneUrl("coui://ui/main/game/live_game/live_game.html");

		// start periodic update
		setInterval(model.update, 250);
		if (!self.isLocalGame()) setInterval(model.updateIdleTimer, 60000);

		active_dictionary.subscribe(function () {
			apply_camera_controls();
		});

		modify_keybinds({ add: ["camera controls", "gameplay", "camera", "hacks"] });

		self.setupWatchList();

		$(window).on("beforeunload", function () {
			api.Panel.message(api.Panel.parentId, "game.layout", false);
		});

		self.checkPlayerPlanet();
	},
	startOrSendChat: function () {
		if (self.chatSelected()) api.panels.chat.message("submit");

		self.chatSelected(!self.chatSelected());
		engine.call("game.allowKeyboard", !self.chatSelected());

		if (self.chatSelected()) {
			api.panels.chat.message("scrollToTop");

			const oldMode = self.mode();
			self.mode("default");
			var modeChangeSubscription = self.chatSelected.subscribe(function (newValue) {
				if (!newValue) {
					self.mode(oldMode);
					modeChangeSubscription.dispose();
				}
			});
		}
	},
	startTeamChat: function () {
		self.startOrSendChat();

		// if game over then enable global chat

		if (self.gameOver()) {
			self.teamChat(false);
			return;
		}

		if (self.isSpectator()) {
			self.teamChat(true);
			return;
		}

		self.teamChat(self.playerInTeam());
	},
	startNormalChat: function () {
		self.startOrSendChat();

		// if game over then enable global chat

		if (self.gameOver()) {
			self.teamChat(false);
			return;
		}

		if (self.isSpectator()) {
			self.teamChat(!self.gameOptions.listenToSpectators());
			return;
		}

		self.teamChat(false);
	},
	chatState: undefined,
	keybindsForBuildTabs: undefined,
	keybindsForBuildItems: undefined,
	keybindsForCommandModes: undefined,
	keybindsForOrders: undefined,
	actionKeybinds: undefined,
	acknowledgeAlert: function () {
		api.panels.unit_alert.message("acknowledge_alert");
	},
	acknowledgeCombat: function () {
		api.panels.unit_alert.message("acknowledge_combat");
	},
	pips: "[object Object]",
	preview: "[object Object]",
	holodeck: "[object Object]",
	showPips: undefined,
	togglePips: function () {
		self.showPips(!self.showPips());
	},
	swapPips: function () {
		if (firstPipShow) return;
		if (api.Holodeck.focused === self.holodeck) {
			for (let h = 0; h < self.pips.length; ++h) {
				const swap = (h + 1) < self.pips.length ? self.pips[h + 1] : self.holodeck;
				self.pips[h].swapCamera(swap);
			}
		} else {
			self.holodeck.swapCamera(api.Holodeck.focused);
		}
	},
	copyToPip: function () {
		if (!self.pips.length) return;
		self.pips[0].copyCamera(self.holodeck);
		if (!self.showPips()) self.togglePips();
	},
	showPipControls: undefined,
	pipAlertMode: undefined,
	togglePipAlertMode: function () { self.pipAlertMode(!self.pipAlertMode()) },
	pipMirrorMode: undefined,
	togglePipMirrorMode: function () { self.pipMirrorMode(!self.pipMirrorMode()) },
	pipState: undefined,
	unitAlertState: undefined,
	showSocial: undefined,
	showUberBar: undefined,
	updateSocialVisibility: function () {
		api.Panel.message("uberbar", "visible", { value: self.showSocial() });
	},
	updateUberBarVisibility: function () {
		api.Panel.message("uberbar", "visible", { value: self.showSocial() });
	},
	toggleSocial: function () {
		self.showSocial(!self.showSocial());
	},
	toggleUberBar: function () {
		self.showSocial(!self.showSocial());
	},
	optionsBarState: undefined,
	optionsBarStateMutation: undefined,
	playSelectionSound: function (wasSelected, prevSelection, isSelected, curSelection) {
		if (!isSelected) {
			if (wasSelected) api.audio.playSound("/SE/UI/UI_Unit_UnSelect");
			return;
		}

		let playSelect = !wasSelected;
		let playUnselect = false;
		if (!playSelect) {
			for (var id in curSelection.spec_ids) {
				const prev = prevSelection.spec_ids[id];
				if (!prev) {
					playSelect = true;
					break;
				}
				const cur = curSelection.spec_ids[id];
				const selected = _.difference(cur, prev);
				if (selected.length) {
					playSelect = true;
					break;
				}
				if (!playUnselect) {
					const removed = _.difference(prev, cur);
					if (removed.length) {
						playUnselect = true;
					}
				}
			}
			if (!playSelect && !playUnselect) {
				for (var id in prevSelection.spec_ids) {
					if (!curSelection.spec_ids[id]) {
						playUnselect = true;
						break;
					}
				}
			}
		}
		if (playSelect) api.audio.playSound("/SE/UI/UI_Unit_Select");
		else if (playUnselect) api.audio.playSound("/SE/UI/UI_Unit_UnSelect");
	},
	uiScale: undefined,
	refreshSettings: function () {
		self.uiScale(api.settings.getSynchronous("ui", "ui_scale") || 1.0);
		api.ar_system.changeSkyBoxSpec(api.settings.getSynchronous("graphics", "skybox"));
	},
	allowDynamicAlliances: undefined,
	allianceRequestsReceived: undefined,
	showEconSharing: undefined,
	updateShowEconSharing: function () {
		let sharing = false;
		// check if our army is sharing eco
		_.forEach(self.player().diplomaticState, function (item) {
			if (item.state === "allied_eco") sharing = true;
		});
		// check if allies are sharing eco with us.
		_.forEach(self.player().allies, function (ally) {
			if (ally.diplomaticState[self.armyId()].state === "allied_eco") sharing = true;
		});
		self.showEconSharing(sharing);
	},
	newInvite: undefined,
	previousInviteNumber: undefined,
	processDiplomaticState: function (army) {
		const allies = [];
		if (self.players() && self.players().length && army) {
			_.forEach(_.keys(army.diplomaticState), function (key) {
				const target_army = _.find(self.players(), function (player) {
					return player.id === parseInt(key);
				});
				if (target_army) {
					if (army.diplomaticState[key].state === "allied" || army.diplomaticState[key].state === "allied_eco") allies.push(target_army);
				}
			});
		}
		army.allies = allies;
		if (!self.isSpectator()) {
			army.stateToPlayer = army.diplomaticState && army.diplomaticState[self.armyId()] ? army.diplomaticState[self.armyId()].state : "self";
			if (!(army.stateToPlayer === "allied" || army.stateToPlayer === "allied_eco")) {
				if (army.diplomaticState && army.diplomaticState[self.armyId()] && army.diplomaticState[self.armyId()].allianceRequest) {
					var request = _.find(self.allianceRequestsReceived(), function (request) { return request.id === army.id });
					if (!request) self.allianceRequestsReceived.push({ id: army.id });
				}
			}
			if (army.diplomaticState && army.diplomaticState[self.armyId()] && !army.diplomaticState[self.armyId()].allianceRequest) {
				var request = _.find(self.allianceRequestsReceived(), function (request) { return request.id === army.id });
				if (request) {
					const i = self.allianceRequestsReceived().indexOf(request);
					self.allianceRequestsReceived.splice(i, 1);
				}
			}
		}
	},
	playerListState: undefined,
	playerListStateMutation: 14,
	devModePanelUrl: undefined,
	devModeState: undefined,
	sandboxPanelUrl: undefined,
	sandboxState: undefined,
	pauseSim: function () { self.send_message("control_sim", { paused: true  }) },
	playSim: function () { self.send_message("control_sim", { paused: false }) },
	togglePause: function () {
		if (self.paused()) self.playSim();
		else self.pauseSim();
	},
	serverRate: undefined,
	simSpeedMultiplier: undefined,
	increaseSimSpeed: function () {
		const sim_speed_multiplier = self.simSpeedMultiplier() + 0.5;
		if (sim_speed_multiplier > 5) return;
		model.send_message("set_sim_speed_multiplier", { sim_speed_multiplier: sim_speed_multiplier });
	},
	decreaseSimSpeed: function () {
		const sim_speed_multiplier = self.simSpeedMultiplier() - 0.5;
		if (sim_speed_multiplier < 0.5) return;
		model.send_message("set_sim_speed_multiplier", { sim_speed_multiplier: sim_speed_multiplier });
	},
	planetListState: undefined,
	showCelestialControl: undefined,
	celestialControlState: undefined,
	layoutMode: undefined,
	hideAllExceptGameOver: undefined,
	tutorial: undefined,
	hasTutorial: undefined,
	showTutorial: undefined,
	tutorialPanelSource: undefined,
	unitDataSubscribers: { unit_alert:"{\"/pa/units/air/fabrication_aircraft/fabrication_aircraft.json\":{\"name\":\"Fabrication Aircraft\",\"desc\":\"Basic Fabricator - Build basic structures. Weaker than other fabricators.\",\"cost\":225,\"maxHealth\":100,\"moveSpeed\":35,\"build_arm\":{\"metal\":9,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_aircraft\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_aircraft.png\"},\"/pa/units/air/fabrication_aircraft/fabrication_aircraft.json.player\":{\"name\":\"Fabrication Aircraft\",\"desc\":\"Basic Fabricator - Build basic structures. Weaker than other fabricators.\",\"cost\":225,\"maxHealth\":100,\"moveSpeed\":35,\"build_arm\":{\"metal\":9,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_aircraft\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_aircraft.png\"},\"/pa/units/air/fabrication_aircraft/fabrication_aircraft.json.ai\":{\"name\":\"Fabrication Aircraft\",\"desc\":\"Basic Fabricator - Build basic structures. Weaker than other fabricators.\",\"cost\":225,\"maxHealth\":100,\"moveSpeed\":35,\"build_arm\":{\"metal\":9,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_aircraft\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_aircraft.png\"},\"/pa/units/air/fabrication_aircraft_adv/fabrication_aircraft_adv.json\":{\"name\":\"Advanced Fab Aircraft\",\"desc\":\"Advanced Fabricator - Builds basic and advanced structures.\",\"cost\":2200,\"maxHealth\":100,\"moveSpeed\":35,\"build_arm\":{\"metal\":54,\"energy\":2250},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_aircraft_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_aircraft_adv.png\"},\"/pa/units/air/fabrication_aircraft_adv/fabrication_aircraft_adv.json.player\":{\"name\":\"Advanced Fab Aircraft\",\"desc\":\"Advanced Fabricator - Builds basic and advanced structures.\",\"cost\":2200,\"maxHealth\":100,\"moveSpeed\":35,\"build_arm\":{\"metal\":54,\"energy\":2250},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_aircraft_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_aircraft_adv.png\"},\"/pa/units/air/fabrication_aircraft_adv/fabrication_aircraft_adv.json.ai\":{\"name\":\"Advanced Fab Aircraft\",\"desc\":\"Advanced Fabricator - Builds basic and advanced structures.\",\"cost\":2200,\"maxHealth\":100,\"moveSpeed\":35,\"build_arm\":{\"metal\":54,\"energy\":2250},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_aircraft_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_aircraft_adv.png\"},\"/pa/units/air/air_factory_adv/air_factory_adv.json\":{\"name\":\"Advanced Air Factory\",\"desc\":\"Advanced Manufacturing - Builds basic and advanced air units.\",\"cost\":4800,\"maxHealth\":30000,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_factory_adv.png\"},\"/pa/units/air/air_factory_adv/air_factory_adv.json.player\":{\"name\":\"Advanced Air Factory\",\"desc\":\"Advanced Manufacturing - Builds basic and advanced air units.\",\"cost\":4800,\"maxHealth\":30000,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_factory_adv.png\"},\"/pa/units/air/air_factory_adv/air_factory_adv.json.ai\":{\"name\":\"Advanced Air Factory\",\"desc\":\"Advanced Manufacturing - Builds basic and advanced air units.\",\"cost\":4800,\"maxHealth\":30000,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_factory_adv.png\"},\"/pa/units/air/bomber_adv/bomber_adv.json\":{\"name\":\"Hornet\",\"desc\":\"Tactical Bomber - Long range. High damage tactical missiles. Attacks land and sea targets.\",\"cost\":3200,\"maxHealth\":600,\"moveSpeed\":30,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":180,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bomber_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bomber_adv.png\"},\"/pa/units/air/bomber_adv/bomber_adv.json.player\":{\"name\":\"Hornet\",\"desc\":\"Tactical Bomber - Long range. High damage tactical missiles. Attacks land and sea targets.\",\"cost\":3200,\"maxHealth\":600,\"moveSpeed\":30,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":180,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bomber_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bomber_adv.png\"},\"/pa/units/air/bomber_adv/bomber_adv.json.ai\":{\"name\":\"Hornet\",\"desc\":\"Tactical Bomber - Long range. High damage tactical missiles. Attacks land and sea targets.\",\"cost\":3200,\"maxHealth\":600,\"moveSpeed\":30,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":180,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bomber_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bomber_adv.png\"},\"/pa/units/air/air_factory/air_factory.json\":{\"name\":\"Air Factory\",\"desc\":\"Basic Manufacturing - Builds basic air units.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":15,\"energy\":675},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_factory.png\"},\"/pa/units/air/air_factory/air_factory.json.player\":{\"name\":\"Air Factory\",\"desc\":\"Basic Manufacturing - Builds basic air units.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":15,\"energy\":675},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_factory.png\"},\"/pa/units/air/air_factory/air_factory.json.ai\":{\"name\":\"Air Factory\",\"desc\":\"Basic Manufacturing - Builds basic air units.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":15,\"energy\":675},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_factory.png\"},\"/pa/units/air/bomber/bomber.json\":{\"name\":\"Bumblebee\",\"desc\":\"Carpet Bomber - High damage over a wide area. Fragile and slow. Attacks land, sea and undersea targets.\",\"cost\":320,\"maxHealth\":100,\"moveSpeed\":75,\"damage\":75,\"fireRate\":7.5,\"dps\":562.5,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":425,\"ammo_demand\":100,\"ammo_per_shot\":75},\"sicon\":\"bomber\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bomber.png\"},\"/pa/units/air/bomber/bomber.json.player\":{\"name\":\"Bumblebee\",\"desc\":\"Carpet Bomber - High damage over a wide area. Fragile and slow. Attacks land, sea and undersea targets.\",\"cost\":320,\"maxHealth\":100,\"moveSpeed\":75,\"damage\":75,\"fireRate\":7.5,\"dps\":562.5,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":425,\"ammo_demand\":100,\"ammo_per_shot\":75},\"sicon\":\"bomber\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bomber.png\"},\"/pa/units/air/bomber/bomber.json.ai\":{\"name\":\"Bumblebee\",\"desc\":\"Carpet Bomber - High damage over a wide area. Fragile and slow. Attacks land, sea and undersea targets.\",\"cost\":320,\"maxHealth\":100,\"moveSpeed\":75,\"damage\":75,\"fireRate\":7.5,\"dps\":562.5,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":425,\"ammo_demand\":100,\"ammo_per_shot\":75},\"sicon\":\"bomber\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bomber.png\"},\"/pa/units/air/fighter/fighter.json\":{\"name\":\"Hummingbird\",\"desc\":\"Fighter - Fast. High damage. Only attacks air targets.\",\"cost\":220,\"maxHealth\":120,\"moveSpeed\":90,\"damage\":80,\"fireRate\":1,\"dps\":80,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fighter\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fighter.png\"},\"/pa/units/air/fighter/fighter.json.player\":{\"name\":\"Hummingbird\",\"desc\":\"Fighter - Fast. High damage. Only attacks air targets.\",\"cost\":220,\"maxHealth\":120,\"moveSpeed\":90,\"damage\":80,\"fireRate\":1,\"dps\":80,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fighter\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fighter.png\"},\"/pa/units/air/fighter/fighter.json.ai\":{\"name\":\"Hummingbird\",\"desc\":\"Fighter - Fast. High damage. Only attacks air targets.\",\"cost\":220,\"maxHealth\":120,\"moveSpeed\":90,\"damage\":80,\"fireRate\":1,\"dps\":80,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fighter\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fighter.png\"},\"/pa/units/air/bomber_heavy/bomber_heavy.json\":{\"name\":\"Wyrm\",\"desc\":\"Siege Bomber - Durable. Slow. Devastating damage. Attacks land and sea targets.\",\"cost\":3300,\"maxHealth\":3000,\"moveSpeed\":30,\"damage\":5000,\"fireRate\":0.4000000059604645,\"dps\":2000,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1500,\"ammo_demand\":500,\"ammo_per_shot\":1500},\"sicon\":\"bomber_heavy\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bomber_heavy.png\"},\"/pa/units/air/bomber_heavy/bomber_heavy.json.player\":{\"name\":\"Wyrm\",\"desc\":\"Siege Bomber - Durable. Slow. Devastating damage. Attacks land and sea targets.\",\"cost\":3300,\"maxHealth\":3000,\"moveSpeed\":30,\"damage\":5000,\"fireRate\":0.4000000059604645,\"dps\":2000,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1500,\"ammo_demand\":500,\"ammo_per_shot\":1500},\"sicon\":\"bomber_heavy\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bomber_heavy.png\"},\"/pa/units/air/bomber_heavy/bomber_heavy.json.ai\":{\"name\":\"Wyrm\",\"desc\":\"Siege Bomber - Durable. Slow. Devastating damage. Attacks land and sea targets.\",\"cost\":3300,\"maxHealth\":3000,\"moveSpeed\":30,\"damage\":5000,\"fireRate\":0.4000000059604645,\"dps\":2000,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1500,\"ammo_demand\":500,\"ammo_per_shot\":1500},\"sicon\":\"bomber_heavy\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bomber_heavy.png\"},\"/pa/units/air/air_scout/air_scout.json\":{\"name\":\"Firefly\",\"desc\":\"Scout - Fast. Can see far away. Does not attack.\",\"cost\":100,\"maxHealth\":85,\"moveSpeed\":90,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_scout\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_scout.png\"},\"/pa/units/air/air_scout/air_scout.json.player\":{\"name\":\"Firefly\",\"desc\":\"Scout - Fast. Can see far away. Does not attack.\",\"cost\":100,\"maxHealth\":85,\"moveSpeed\":90,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_scout\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_scout.png\"},\"/pa/units/air/air_scout/air_scout.json.ai\":{\"name\":\"Firefly\",\"desc\":\"Scout - Fast. Can see far away. Does not attack.\",\"cost\":100,\"maxHealth\":85,\"moveSpeed\":90,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_scout\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_scout.png\"},\"/pa/units/air/base_flyer/base_flyer.json\":{\"name\":\"Base Flyer\",\"desc\":\"Base Flyer Description - If you're seeing this, something is wrong in your flyer.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_flyer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_flyer.png\"},\"/pa/units/air/base_flyer/base_flyer.json.player\":{\"name\":\"Base Flyer\",\"desc\":\"Base Flyer Description - If you're seeing this, something is wrong in your flyer.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_flyer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_flyer.png\"},\"/pa/units/air/base_flyer/base_flyer.json.ai\":{\"name\":\"Base Flyer\",\"desc\":\"Base Flyer Description - If you're seeing this, something is wrong in your flyer.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_flyer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_flyer.png\"},\"/pa/units/air/gunship/gunship.json\":{\"name\":\"Kestrel\",\"desc\":\"Gunship - Fast. Cheap. Durable. Attacks land and sea targets.\",\"cost\":800,\"maxHealth\":300,\"moveSpeed\":60,\"damage\":20,\"fireRate\":4,\"dps\":80,\"max_range\":60,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"gunship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_gunship.png\"},\"/pa/units/air/gunship/gunship.json.player\":{\"name\":\"Kestrel\",\"desc\":\"Gunship - Fast. Cheap. Durable. Attacks land and sea targets.\",\"cost\":800,\"maxHealth\":300,\"moveSpeed\":60,\"damage\":20,\"fireRate\":4,\"dps\":80,\"max_range\":60,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"gunship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_gunship.png\"},\"/pa/units/air/gunship/gunship.json.ai\":{\"name\":\"Kestrel\",\"desc\":\"Gunship - Fast. Cheap. Durable. Attacks land and sea targets.\",\"cost\":800,\"maxHealth\":300,\"moveSpeed\":60,\"damage\":20,\"fireRate\":4,\"dps\":80,\"max_range\":60,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"gunship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_gunship.png\"},\"/pa/units/air/fighter_adv/fighter_adv.json\":{\"name\":\"Phoenix\",\"desc\":\"Advanced Interplanetary Fighter - Stronger fighter. Can move between planets. Can only attack air targets.\",\"cost\":820,\"maxHealth\":240,\"moveSpeed\":80,\"damage\":150,\"fireRate\":3,\"dps\":450,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fighter_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fighter_adv.png\"},\"/pa/units/air/fighter_adv/fighter_adv.json.player\":{\"name\":\"Phoenix\",\"desc\":\"Advanced Interplanetary Fighter - Stronger fighter. Can move between planets. Can only attack air targets.\",\"cost\":820,\"maxHealth\":240,\"moveSpeed\":80,\"damage\":150,\"fireRate\":3,\"dps\":450,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fighter_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fighter_adv.png\"},\"/pa/units/air/fighter_adv/fighter_adv.json.ai\":{\"name\":\"Phoenix\",\"desc\":\"Advanced Interplanetary Fighter - Stronger fighter. Can move between planets. Can only attack air targets.\",\"cost\":820,\"maxHealth\":240,\"moveSpeed\":80,\"damage\":150,\"fireRate\":3,\"dps\":450,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fighter_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fighter_adv.png\"},\"/pa/units/air/transport/transport.json\":{\"name\":\"Pelican\",\"desc\":\"Air Transport - Load a land unit to transport for snipes or expansions.\",\"cost\":140,\"maxHealth\":150,\"moveSpeed\":70,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"transport\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_transport.png\"},\"/pa/units/air/transport/transport.json.player\":{\"name\":\"Pelican\",\"desc\":\"Air Transport - Load a land unit to transport for snipes or expansions.\",\"cost\":140,\"maxHealth\":150,\"moveSpeed\":70,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"transport\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_transport.png\"},\"/pa/units/air/transport/transport.json.ai\":{\"name\":\"Pelican\",\"desc\":\"Air Transport - Load a land unit to transport for snipes or expansions.\",\"cost\":140,\"maxHealth\":150,\"moveSpeed\":70,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"transport\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_transport.png\"},\"/pa/units/sea/naval_factory/naval_factory.json\":{\"name\":\"Naval Factory\",\"desc\":\"Basic Manufacturing - Builds basic naval units.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":20,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"naval_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_naval_factory.png\"},\"/pa/units/sea/naval_factory/naval_factory.json.player\":{\"name\":\"Naval Factory\",\"desc\":\"Basic Manufacturing - Builds basic naval units.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":20,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"naval_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_naval_factory.png\"},\"/pa/units/sea/naval_factory/naval_factory.json.ai\":{\"name\":\"Naval Factory\",\"desc\":\"Basic Manufacturing - Builds basic naval units.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":20,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"naval_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_naval_factory.png\"},\"/pa/units/commanders/avatar/avatar.json\":{\"name\":\"Avatar Commander\",\"desc\":\"For debugging purposes\",\"cost\":1,\"maxHealth\":200000,\"moveSpeed\":500,\"max_range\":10000,\"build_arm\":{\"metal\":10000,\"energy\":0},\"production\":{\"metal\":100000,\"energy\":100000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":10000,\"energy\":100000},\"energy_weapon\":null,\"sicon\":\"avatar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_avatar.png\"},\"/pa/units/commanders/avatar/avatar.json.player\":{\"name\":\"Avatar Commander\",\"desc\":\"For debugging purposes\",\"cost\":1,\"maxHealth\":200000,\"moveSpeed\":500,\"max_range\":10000,\"build_arm\":{\"metal\":10000,\"energy\":0},\"production\":{\"metal\":100000,\"energy\":100000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":10000,\"energy\":100000},\"energy_weapon\":null,\"sicon\":\"avatar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_avatar.png\"},\"/pa/units/commanders/avatar/avatar.json.ai\":{\"name\":\"Avatar Commander\",\"desc\":\"For debugging purposes\",\"cost\":1,\"maxHealth\":200000,\"moveSpeed\":500,\"max_range\":10000,\"build_arm\":{\"metal\":10000,\"energy\":0},\"production\":{\"metal\":100000,\"energy\":100000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":10000,\"energy\":100000},\"energy_weapon\":null,\"sicon\":\"avatar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_avatar.png\"},\"/pa/units/commanders/imperial_seniorhelix/imperial_seniorhelix.json\":{\"name\":\"Seniorhelix Commander\",\"desc\":\"Imperial Seniorhelix Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_seniorhelix/imperial_seniorhelix.json.player\":{\"name\":\"Seniorhelix Commander\",\"desc\":\"Imperial Seniorhelix Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_seniorhelix/imperial_seniorhelix.json.ai\":{\"name\":\"Seniorhelix Commander\",\"desc\":\"Imperial Seniorhelix Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_aceal/imperial_aceal.json\":{\"name\":\"AceAl Commander\",\"desc\":\"Imperial AceAl Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_aceal/imperial_aceal.json.player\":{\"name\":\"AceAl Commander\",\"desc\":\"Imperial AceAl Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_aceal/imperial_aceal.json.ai\":{\"name\":\"AceAl Commander\",\"desc\":\"Imperial AceAl Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/base_commander/base_commander.json\":{\"name\":\"Base Commander\",\"desc\":\"Base Commander Description - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/base_commander/base_commander.json.player\":{\"name\":\"Base Commander\",\"desc\":\"Base Commander Description - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/base_commander/base_commander.json.ai\":{\"name\":\"Base Commander\",\"desc\":\"Base Commander Description - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_sangudo/imperial_sangudo.json\":{\"name\":\"Sangudo Commander\",\"desc\":\"Imperial Sangudo Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_sangudo/imperial_sangudo.json.player\":{\"name\":\"Sangudo Commander\",\"desc\":\"Imperial Sangudo Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_sangudo/imperial_sangudo.json.ai\":{\"name\":\"Sangudo Commander\",\"desc\":\"Imperial Sangudo Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_able/imperial_able.json\":{\"name\":\"Able Commander\",\"desc\":\"Imperial Able Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_able/imperial_able.json.player\":{\"name\":\"Able Commander\",\"desc\":\"Imperial Able Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_able/imperial_able.json.ai\":{\"name\":\"Able Commander\",\"desc\":\"Imperial Able Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_chronoblip/imperial_chronoblip.json\":{\"name\":\"chronoblip Commander\",\"desc\":\"Imperial Chronoblip Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_chronoblip/imperial_chronoblip.json.player\":{\"name\":\"chronoblip Commander\",\"desc\":\"Imperial Chronoblip Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_chronoblip/imperial_chronoblip.json.ai\":{\"name\":\"chronoblip Commander\",\"desc\":\"Imperial Chronoblip Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/land/bot_factory_adv/bot_factory_adv.json\":{\"name\":\"Advanced Bot Factory\",\"desc\":\"Advanced Manufacturing - Builds basic and advanced bots.\",\"cost\":4800,\"maxHealth\":30000,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_factory_adv.png\"},\"/pa/units/land/bot_factory_adv/bot_factory_adv.json.player\":{\"name\":\"Advanced Bot Factory\",\"desc\":\"Advanced Manufacturing - Builds basic and advanced bots.\",\"cost\":4800,\"maxHealth\":30000,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_factory_adv.png\"},\"/pa/units/land/bot_factory_adv/bot_factory_adv.json.ai\":{\"name\":\"Advanced Bot Factory\",\"desc\":\"Advanced Manufacturing - Builds basic and advanced bots.\",\"cost\":4800,\"maxHealth\":30000,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_factory_adv.png\"},\"/pa/units/commanders/quad_xenosentryprime/quad_xenosentryprime.json\":{\"name\":\"XenosentryPrime Commander\",\"desc\":\"Quadruped XenosentryPrime Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_xenosentryprime/quad_xenosentryprime.json.player\":{\"name\":\"XenosentryPrime Commander\",\"desc\":\"Quadruped XenosentryPrime Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_xenosentryprime/quad_xenosentryprime.json.ai\":{\"name\":\"XenosentryPrime Commander\",\"desc\":\"Quadruped XenosentryPrime Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_theta/imperial_theta.json\":{\"name\":\"Theta Commander\",\"desc\":\"Imperial Theta Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_theta/imperial_theta.json.player\":{\"name\":\"Theta Commander\",\"desc\":\"Imperial Theta Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_theta/imperial_theta.json.ai\":{\"name\":\"Theta Commander\",\"desc\":\"Imperial Theta Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_sacrificiallamb/quad_sacrificiallamb.json\":{\"name\":\"SacrificialLamb Commander\",\"desc\":\"Quadruped SacrificialLamb Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_sacrificiallamb/quad_sacrificiallamb.json.player\":{\"name\":\"SacrificialLamb Commander\",\"desc\":\"Quadruped SacrificialLamb Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_sacrificiallamb/quad_sacrificiallamb.json.ai\":{\"name\":\"SacrificialLamb Commander\",\"desc\":\"Quadruped SacrificialLamb Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_alpha/imperial_alpha.json\":{\"name\":\"Alpha Commander\",\"desc\":\"Imperial Alpha Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_alpha/imperial_alpha.json.player\":{\"name\":\"Alpha Commander\",\"desc\":\"Imperial Alpha Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_alpha/imperial_alpha.json.ai\":{\"name\":\"Alpha Commander\",\"desc\":\"Imperial Alpha Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_gambitdfa/quad_gambitdfa.json\":{\"name\":\"Gambitdfa Commander\",\"desc\":\"Quadruped Gambitdfa Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_gambitdfa/quad_gambitdfa.json.player\":{\"name\":\"Gambitdfa Commander\",\"desc\":\"Quadruped Gambitdfa Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_gambitdfa/quad_gambitdfa.json.ai\":{\"name\":\"Gambitdfa Commander\",\"desc\":\"Quadruped Gambitdfa Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_zaazzaa/raptor_zaazzaa.json\":{\"name\":\"Zaazzaa Commander\",\"desc\":\"Raptor Zaazzaa Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_zaazzaa/raptor_zaazzaa.json.player\":{\"name\":\"Zaazzaa Commander\",\"desc\":\"Raptor Zaazzaa Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_zaazzaa/raptor_zaazzaa.json.ai\":{\"name\":\"Zaazzaa Commander\",\"desc\":\"Raptor Zaazzaa Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_visionik/imperial_visionik.json\":{\"name\":\"Visionik Commander\",\"desc\":\"Imperial Visionik Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_visionik/imperial_visionik.json.player\":{\"name\":\"Visionik Commander\",\"desc\":\"Imperial Visionik Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_visionik/imperial_visionik.json.ai\":{\"name\":\"Visionik Commander\",\"desc\":\"Imperial Visionik Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/land/tank_laser_adv/tank_laser_adv.json\":{\"name\":\"Leveler\",\"desc\":\"Assault Tank - Devastating damage with heavy armor. Vulnerable to flanking. Attacks land and sea targets.\",\"cost\":800,\"maxHealth\":1500,\"moveSpeed\":10,\"damage\":300,\"fireRate\":1,\"dps\":600,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_laser_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_laser_adv.png\"},\"/pa/units/land/tank_laser_adv/tank_laser_adv.json.player\":{\"name\":\"Leveler\",\"desc\":\"Assault Tank - Devastating damage with heavy armor. Vulnerable to flanking. Attacks land and sea targets.\",\"cost\":800,\"maxHealth\":1500,\"moveSpeed\":10,\"damage\":300,\"fireRate\":1,\"dps\":600,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_laser_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_laser_adv.png\"},\"/pa/units/land/tank_laser_adv/tank_laser_adv.json.ai\":{\"name\":\"Leveler\",\"desc\":\"Assault Tank - Devastating damage with heavy armor. Vulnerable to flanking. Attacks land and sea targets.\",\"cost\":800,\"maxHealth\":1500,\"moveSpeed\":10,\"damage\":300,\"fireRate\":1,\"dps\":600,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_laser_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_laser_adv.png\"},\"/pa/units/commanders/imperial_aryst0krat/imperial_aryst0krat.json\":{\"name\":\"Aryst0krat Commander\",\"desc\":\"Imperial Aryst0krat Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_aryst0krat/imperial_aryst0krat.json.player\":{\"name\":\"Aryst0krat Commander\",\"desc\":\"Imperial Aryst0krat Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_aryst0krat/imperial_aryst0krat.json.ai\":{\"name\":\"Aryst0krat Commander\",\"desc\":\"Imperial Aryst0krat Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/land/energy_storage/energy_storage.json\":{\"name\":\"Energy Storage\",\"desc\":\"Storage - Increases maximum energy storage capacity.\",\"cost\":450,\"maxHealth\":3500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":300000},\"energy_weapon\":null,\"sicon\":\"energy_storage\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_energy_storage.png\"},\"/pa/units/land/energy_storage/energy_storage.json.player\":{\"name\":\"Energy Storage\",\"desc\":\"Storage - Increases maximum energy storage capacity.\",\"cost\":450,\"maxHealth\":3500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":300000},\"energy_weapon\":null,\"sicon\":\"energy_storage\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_energy_storage.png\"},\"/pa/units/land/energy_storage/energy_storage.json.ai\":{\"name\":\"Energy Storage\",\"desc\":\"Storage - Increases maximum energy storage capacity.\",\"cost\":450,\"maxHealth\":3500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":300000},\"energy_weapon\":null,\"sicon\":\"energy_storage\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_energy_storage.png\"},\"/pa/units/commanders/tank_sadiga/tank_sadiga.json\":{\"name\":\"Sadiga Commander\",\"desc\":\"Tank Sadiga Commander \",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_sadiga/tank_sadiga.json.player\":{\"name\":\"Sadiga Commander\",\"desc\":\"Tank Sadiga Commander \",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_sadiga/tank_sadiga.json.ai\":{\"name\":\"Sadiga Commander\",\"desc\":\"Tank Sadiga Commander \",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_mobiousblack/quad_mobiousblack.json\":{\"name\":\"Berlinetta Commander\",\"desc\":\"Quadruped Berlinetta Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_mobiousblack/quad_mobiousblack.json.player\":{\"name\":\"Berlinetta Commander\",\"desc\":\"Quadruped Berlinetta Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_mobiousblack/quad_mobiousblack.json.ai\":{\"name\":\"Berlinetta Commander\",\"desc\":\"Quadruped Berlinetta Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/orbital/delta_v_engine/delta_v_engine.json\":{\"name\":\"Halley\",\"desc\":\"Delta V Engine - Used to move small to medium celestial bodies.\",\"cost\":40000,\"maxHealth\":20000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"delta_v_engine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_delta_v_engine.png\"},\"/pa/units/orbital/delta_v_engine/delta_v_engine.json.player\":{\"name\":\"Halley\",\"desc\":\"Delta V Engine - Used to move small to medium celestial bodies.\",\"cost\":40000,\"maxHealth\":20000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"delta_v_engine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_delta_v_engine.png\"},\"/pa/units/orbital/delta_v_engine/delta_v_engine.json.ai\":{\"name\":\"Halley\",\"desc\":\"Delta V Engine - Used to move small to medium celestial bodies.\",\"cost\":40000,\"maxHealth\":20000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"delta_v_engine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_delta_v_engine.png\"},\"/pa/units/commanders/imperial_base/imperial_base.json\":{\"name\":\"Imperial Class Commander\",\"desc\":\"Imperial Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_base/imperial_base.json.player\":{\"name\":\"Imperial Class Commander\",\"desc\":\"Imperial Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_base/imperial_base.json.ai\":{\"name\":\"Imperial Class Commander\",\"desc\":\"Imperial Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_delta/imperial_delta.json\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_delta/imperial_delta.json.player\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_delta/imperial_delta.json.ai\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_fiveleafclover/imperial_fiveleafclover.json\":{\"name\":\"Fiveleafclover Commander\",\"desc\":\"Imperial Fiveleafclover Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_fiveleafclover/imperial_fiveleafclover.json.player\":{\"name\":\"Fiveleafclover Commander\",\"desc\":\"Imperial Fiveleafclover Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_fiveleafclover/imperial_fiveleafclover.json.ai\":{\"name\":\"Fiveleafclover Commander\",\"desc\":\"Imperial Fiveleafclover Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_invictus/imperial_invictus.json\":{\"name\":\"Invictus Commander\",\"desc\":\"Imperial Invictus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_invictus/imperial_invictus.json.player\":{\"name\":\"Invictus Commander\",\"desc\":\"Imperial Invictus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_invictus/imperial_invictus.json.ai\":{\"name\":\"Invictus Commander\",\"desc\":\"Imperial Invictus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_spartandano/quad_spartandano.json\":{\"name\":\"Spartandano Commander\",\"desc\":\"Quadruped Spartandano Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_spartandano/quad_spartandano.json.player\":{\"name\":\"Spartandano Commander\",\"desc\":\"Quadruped Spartandano Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_spartandano/quad_spartandano.json.ai\":{\"name\":\"Spartandano Commander\",\"desc\":\"Quadruped Spartandano Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_twoboots/quad_twoboots.json\":{\"name\":\"Twoboots Commander\",\"desc\":\"Quadruped Twoboots Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_twoboots/quad_twoboots.json.player\":{\"name\":\"Twoboots Commander\",\"desc\":\"Quadruped Twoboots Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_twoboots/quad_twoboots.json.ai\":{\"name\":\"Twoboots Commander\",\"desc\":\"Quadruped Twoboots Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_base/tank_base.json\":{\"name\":\"Tank Class Commander\",\"desc\":\"Tank Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_base/tank_base.json.player\":{\"name\":\"Tank Class Commander\",\"desc\":\"Tank Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_base/tank_base.json.ai\":{\"name\":\"Tank Class Commander\",\"desc\":\"Tank Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_kapowaz/imperial_kapowaz.json\":{\"name\":\"Kapowaz Commander\",\"desc\":\"Imperial Kapowaz Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_kapowaz/imperial_kapowaz.json.player\":{\"name\":\"Kapowaz Commander\",\"desc\":\"Imperial Kapowaz Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_kapowaz/imperial_kapowaz.json.ai\":{\"name\":\"Kapowaz Commander\",\"desc\":\"Imperial Kapowaz Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_spiderofmean/quad_spiderofmean.json\":{\"name\":\"Xenosentry Commander\",\"desc\":\"Quadruped Xenosentry Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_spiderofmean/quad_spiderofmean.json.player\":{\"name\":\"Xenosentry Commander\",\"desc\":\"Quadruped Xenosentry Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_spiderofmean/quad_spiderofmean.json.ai\":{\"name\":\"Xenosentry Commander\",\"desc\":\"Quadruped Xenosentry Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/sea/hover_ship/hover_ship.json\":{\"name\":\"Kaiju\",\"desc\":\"Hover Destroyer- Long-Range. Durable. Hover. Attacks land and sea targets.\",\"cost\":1500,\"maxHealth\":2000,\"moveSpeed\":11,\"damage\":200,\"fireRate\":0.5,\"dps\":200,\"max_range\":180,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"hover_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_hover_ship.png\"},\"/pa/units/sea/hover_ship/hover_ship.json.player\":{\"name\":\"Kaiju\",\"desc\":\"Hover Destroyer- Long-Range. Durable. Hover. Attacks land and sea targets.\",\"cost\":1500,\"maxHealth\":2000,\"moveSpeed\":11,\"damage\":200,\"fireRate\":0.5,\"dps\":200,\"max_range\":180,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"hover_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_hover_ship.png\"},\"/pa/units/sea/hover_ship/hover_ship.json.ai\":{\"name\":\"Kaiju\",\"desc\":\"Hover Destroyer- Long-Range. Durable. Hover. Attacks land and sea targets.\",\"cost\":1500,\"maxHealth\":2000,\"moveSpeed\":11,\"damage\":200,\"fireRate\":0.5,\"dps\":200,\"max_range\":180,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"hover_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_hover_ship.png\"},\"/pa/units/sea/nuclear_sub/nuclear_sub.json\":{\"name\":\"Kraken\",\"desc\":\"Advanced Submarine - Radar stealth with very high damage. Attacks land, sea and undersea targets.\",\"cost\":1800,\"maxHealth\":2100,\"moveSpeed\":12,\"damage\":250,\"fireRate\":0.6000000238418579,\"dps\":150,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"nuclear_sub\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_nuclear_sub.png\"},\"/pa/units/sea/nuclear_sub/nuclear_sub.json.player\":{\"name\":\"Kraken\",\"desc\":\"Advanced Submarine - Radar stealth with very high damage. Attacks land, sea and undersea targets.\",\"cost\":1800,\"maxHealth\":2100,\"moveSpeed\":12,\"damage\":250,\"fireRate\":0.6000000238418579,\"dps\":150,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"nuclear_sub\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_nuclear_sub.png\"},\"/pa/units/sea/nuclear_sub/nuclear_sub.json.ai\":{\"name\":\"Kraken\",\"desc\":\"Advanced Submarine - Radar stealth with very high damage. Attacks land, sea and undersea targets.\",\"cost\":1800,\"maxHealth\":2100,\"moveSpeed\":12,\"damage\":250,\"fireRate\":0.6000000238418579,\"dps\":150,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"nuclear_sub\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_nuclear_sub.png\"},\"/pa/units/commanders/raptor_spz58624/raptor_spz58624.json\":{\"name\":\"SPZ58624 Commander\",\"desc\":\"Raptor SPZ58624 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_spz58624/raptor_spz58624.json.player\":{\"name\":\"SPZ58624 Commander\",\"desc\":\"Raptor SPZ58624 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_spz58624/raptor_spz58624.json.ai\":{\"name\":\"SPZ58624 Commander\",\"desc\":\"Raptor SPZ58624 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_enzomatrix/imperial_enzomatrix.json\":{\"name\":\"Enzomatrix Commander\",\"desc\":\"Imperial Enzomatrix Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_enzomatrix/imperial_enzomatrix.json.player\":{\"name\":\"Enzomatrix Commander\",\"desc\":\"Imperial Enzomatrix Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_enzomatrix/imperial_enzomatrix.json.ai\":{\"name\":\"Enzomatrix Commander\",\"desc\":\"Imperial Enzomatrix Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_nagasher/imperial_nagasher.json\":{\"name\":\"Nagasher Commander\",\"desc\":\"Imperial Nagasher Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_nagasher/imperial_nagasher.json.player\":{\"name\":\"Nagasher Commander\",\"desc\":\"Imperial Nagasher Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_nagasher/imperial_nagasher.json.ai\":{\"name\":\"Nagasher Commander\",\"desc\":\"Imperial Nagasher Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_progenitor/imperial_progenitor.json\":{\"name\":\"Progenitor Commander\",\"desc\":\"Imperial Progenitor Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_progenitor/imperial_progenitor.json.player\":{\"name\":\"Progenitor Commander\",\"desc\":\"Imperial Progenitor Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_progenitor/imperial_progenitor.json.ai\":{\"name\":\"Progenitor Commander\",\"desc\":\"Imperial Progenitor Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_gamma/imperial_gamma.json\":{\"name\":\"Gamma Commander\",\"desc\":\"Imperial Gamma Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_gamma/imperial_gamma.json.player\":{\"name\":\"Gamma Commander\",\"desc\":\"Imperial Gamma Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_gamma/imperial_gamma.json.ai\":{\"name\":\"Gamma Commander\",\"desc\":\"Imperial Gamma Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_kevin4001/imperial_kevin4001.json\":{\"name\":\"Kevin4001 Commander\",\"desc\":\"Imperial Kevin4001 Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_kevin4001/imperial_kevin4001.json.player\":{\"name\":\"Kevin4001 Commander\",\"desc\":\"Imperial Kevin4001 Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_kevin4001/imperial_kevin4001.json.ai\":{\"name\":\"Kevin4001 Commander\",\"desc\":\"Imperial Kevin4001 Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/orbital/solar_array/solar_array.json\":{\"name\":\"Solar Array\",\"desc\":\"Economy - Orbital energy generation.\",\"cost\":1600,\"maxHealth\":1000,\"moveSpeed\":10,\"production\":{\"metal\":0,\"energy\":2800},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"solar_array\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_solar_array.png\"},\"/pa/units/orbital/solar_array/solar_array.json.player\":{\"name\":\"Solar Array\",\"desc\":\"Economy - Orbital energy generation.\",\"cost\":1600,\"maxHealth\":1000,\"moveSpeed\":10,\"production\":{\"metal\":0,\"energy\":2800},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"solar_array\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_solar_array.png\"},\"/pa/units/orbital/solar_array/solar_array.json.ai\":{\"name\":\"Solar Array\",\"desc\":\"Economy - Orbital energy generation.\",\"cost\":1600,\"maxHealth\":1000,\"moveSpeed\":10,\"production\":{\"metal\":0,\"energy\":2800},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"solar_array\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_solar_array.png\"},\"/pa/units/commanders/imperial_gnugfur/imperial_gnugfur.json\":{\"name\":\"Gnugfur Commander\",\"desc\":\"Imperial Gnugfur Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_gnugfur/imperial_gnugfur.json.player\":{\"name\":\"Gnugfur Commander\",\"desc\":\"Imperial Gnugfur Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_gnugfur/imperial_gnugfur.json.ai\":{\"name\":\"Gnugfur Commander\",\"desc\":\"Imperial Gnugfur Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_jt100010117/imperial_jt100010117.json\":{\"name\":\"JT100010117 Commander\",\"desc\":\"Imperial JT100010117 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_jt100010117/imperial_jt100010117.json.player\":{\"name\":\"JT100010117 Commander\",\"desc\":\"Imperial JT100010117 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_jt100010117/imperial_jt100010117.json.ai\":{\"name\":\"JT100010117 Commander\",\"desc\":\"Imperial JT100010117 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_potbelly79/quad_potbelly79.json\":{\"name\":\"Potbelly79 Commander\",\"desc\":\"Quadruped Potbelly79 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_potbelly79/quad_potbelly79.json.player\":{\"name\":\"Potbelly79 Commander\",\"desc\":\"Quadruped Potbelly79 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_potbelly79/quad_potbelly79.json.ai\":{\"name\":\"Potbelly79 Commander\",\"desc\":\"Quadruped Potbelly79 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_fusion/imperial_fusion.json\":{\"name\":\"Fusion Commander\",\"desc\":\"Imperial Fusion Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_fusion/imperial_fusion.json.player\":{\"name\":\"Fusion Commander\",\"desc\":\"Imperial Fusion Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_fusion/imperial_fusion.json.ai\":{\"name\":\"Fusion Commander\",\"desc\":\"Imperial Fusion Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_betadyne/raptor_betadyne.json\":{\"name\":\"Betadyne Commander\",\"desc\":\"Raptor Betadyne Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_betadyne/raptor_betadyne.json.player\":{\"name\":\"Betadyne Commander\",\"desc\":\"Raptor Betadyne Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_betadyne/raptor_betadyne.json.ai\":{\"name\":\"Betadyne Commander\",\"desc\":\"Raptor Betadyne Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_mjon/imperial_mjon.json\":{\"name\":\"Mjon Commander\",\"desc\":\"Imperial Mjon Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_mjon/imperial_mjon.json.player\":{\"name\":\"Mjon Commander\",\"desc\":\"Imperial Mjon Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_mjon/imperial_mjon.json.ai\":{\"name\":\"Mjon Commander\",\"desc\":\"Imperial Mjon Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_shadowdaemon/quad_shadowdaemon.json\":{\"name\":\"Shadowdaemon Commander\",\"desc\":\"Quadruped Shadowdaemon Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_shadowdaemon/quad_shadowdaemon.json.player\":{\"name\":\"Shadowdaemon Commander\",\"desc\":\"Quadruped Shadowdaemon Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_shadowdaemon/quad_shadowdaemon.json.ai\":{\"name\":\"Shadowdaemon Commander\",\"desc\":\"Quadruped Shadowdaemon Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_mostlikely/imperial_mostlikely.json\":{\"name\":\"Mostlikely Commander\",\"desc\":\"Imperial Mostlikely Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_mostlikely/imperial_mostlikely.json.player\":{\"name\":\"Mostlikely Commander\",\"desc\":\"Imperial Mostlikely Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_mostlikely/imperial_mostlikely.json.ai\":{\"name\":\"Mostlikely Commander\",\"desc\":\"Imperial Mostlikely Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/orbital/orbital_battleship/orbital_battleship.json\":{\"name\":\"Omega\",\"desc\":\"Orbital Battleship - Rapid-Fire. Very durable. Heavy damage. Attacks everything.\",\"cost\":14000,\"maxHealth\":4000,\"moveSpeed\":15,\"damage\":30,\"fireRate\":2,\"dps\":120,\"max_range\":130,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_battleship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_battleship.png\"},\"/pa/units/orbital/orbital_battleship/orbital_battleship.json.player\":{\"name\":\"Omega\",\"desc\":\"Orbital Battleship - Rapid-Fire. Very durable. Heavy damage. Attacks everything.\",\"cost\":14000,\"maxHealth\":4000,\"moveSpeed\":15,\"damage\":30,\"fireRate\":2,\"dps\":120,\"max_range\":130,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_battleship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_battleship.png\"},\"/pa/units/orbital/orbital_battleship/orbital_battleship.json.ai\":{\"name\":\"Omega\",\"desc\":\"Orbital Battleship - Rapid-Fire. Very durable. Heavy damage. Attacks everything.\",\"cost\":14000,\"maxHealth\":4000,\"moveSpeed\":15,\"damage\":30,\"fireRate\":2,\"dps\":120,\"max_range\":130,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_battleship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_battleship.png\"},\"/pa/units/sea/fabrication_ship/fabrication_ship.json\":{\"name\":\"Fabrication Ship\",\"desc\":\"Basic Fabricator - Builds basic naval structures. Water hover.\",\"cost\":200,\"maxHealth\":150,\"moveSpeed\":12,\"build_arm\":{\"metal\":14,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_ship.png\"},\"/pa/units/sea/fabrication_ship/fabrication_ship.json.player\":{\"name\":\"Fabrication Ship\",\"desc\":\"Basic Fabricator - Builds basic naval structures. Water hover.\",\"cost\":200,\"maxHealth\":150,\"moveSpeed\":12,\"build_arm\":{\"metal\":14,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_ship.png\"},\"/pa/units/sea/fabrication_ship/fabrication_ship.json.ai\":{\"name\":\"Fabrication Ship\",\"desc\":\"Basic Fabricator - Builds basic naval structures. Water hover.\",\"cost\":200,\"maxHealth\":150,\"moveSpeed\":12,\"build_arm\":{\"metal\":14,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_ship.png\"},\"/pa/units/commanders/quad_osiris/quad_osiris.json\":{\"name\":\"Osiris Commander\",\"desc\":\"Quadruped Osiris Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_osiris/quad_osiris.json.player\":{\"name\":\"Osiris Commander\",\"desc\":\"Quadruped Osiris Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_osiris/quad_osiris.json.ai\":{\"name\":\"Osiris Commander\",\"desc\":\"Quadruped Osiris Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_nefelpitou/raptor_nefelpitou.json\":{\"name\":\"Nefelpitou Commander\",\"desc\":\"Raptor Nefelpitou Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_nefelpitou/raptor_nefelpitou.json.player\":{\"name\":\"Nefelpitou Commander\",\"desc\":\"Raptor Nefelpitou Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_nefelpitou/raptor_nefelpitou.json.ai\":{\"name\":\"Nefelpitou Commander\",\"desc\":\"Raptor Nefelpitou Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_stelarch/imperial_stelarch.json\":{\"name\":\"Stelarch Commander\",\"desc\":\"Imperial Stelarch Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_stelarch/imperial_stelarch.json.player\":{\"name\":\"Stelarch Commander\",\"desc\":\"Imperial Stelarch Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_stelarch/imperial_stelarch.json.ai\":{\"name\":\"Stelarch Commander\",\"desc\":\"Imperial Stelarch Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_base/quad_base.json\":{\"name\":\"Quadruped Class Commander\",\"desc\":\"Quadruped Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_base/quad_base.json.player\":{\"name\":\"Quadruped Class Commander\",\"desc\":\"Quadruped Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_base/quad_base.json.ai\":{\"name\":\"Quadruped Class Commander\",\"desc\":\"Quadruped Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_commandonut/quad_commandonut.json\":{\"name\":\"Commandonut Commander\",\"desc\":\"Quadruped Commandonut Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_commandonut/quad_commandonut.json.player\":{\"name\":\"Commandonut Commander\",\"desc\":\"Quadruped Commandonut Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_commandonut/quad_commandonut.json.ai\":{\"name\":\"Commandonut Commander\",\"desc\":\"Quadruped Commandonut Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_thechessknight/imperial_thechessknight.json\":{\"name\":\"TheChessKnight Commander\",\"desc\":\"Imperial TheChessKnight Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_thechessknight/imperial_thechessknight.json.player\":{\"name\":\"TheChessKnight Commander\",\"desc\":\"Imperial TheChessKnight Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_thechessknight/imperial_thechessknight.json.ai\":{\"name\":\"TheChessKnight Commander\",\"desc\":\"Imperial TheChessKnight Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_toddfather/imperial_toddfather.json\":{\"name\":\"ToddFather Commander\",\"desc\":\"Imperial ToddFather Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_toddfather/imperial_toddfather.json.player\":{\"name\":\"ToddFather Commander\",\"desc\":\"Imperial ToddFather Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_toddfather/imperial_toddfather.json.ai\":{\"name\":\"ToddFather Commander\",\"desc\":\"Imperial ToddFather Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_tykus24/imperial_tykus24.json\":{\"name\":\"Tykus24 Commander\",\"desc\":\"Imperial Tykus24 Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_tykus24/imperial_tykus24.json.player\":{\"name\":\"Tykus24 Commander\",\"desc\":\"Imperial Tykus24 Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_tykus24/imperial_tykus24.json.ai\":{\"name\":\"Tykus24 Commander\",\"desc\":\"Imperial Tykus24 Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_tokamaktech/quad_tokamaktech.json\":{\"name\":\"Tokamaktech Commander\",\"desc\":\"Quadruped Tokamaktech Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_tokamaktech/quad_tokamaktech.json.player\":{\"name\":\"Tokamaktech Commander\",\"desc\":\"Quadruped Tokamaktech Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_tokamaktech/quad_tokamaktech.json.ai\":{\"name\":\"Tokamaktech Commander\",\"desc\":\"Quadruped Tokamaktech Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_vidicarus/imperial_vidicarus.json\":{\"name\":\"Vidicarus Commander\",\"desc\":\"Imperial Vidicarus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_vidicarus/imperial_vidicarus.json.player\":{\"name\":\"Vidicarus Commander\",\"desc\":\"Imperial Vidicarus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/imperial_vidicarus/imperial_vidicarus.json.ai\":{\"name\":\"Vidicarus Commander\",\"desc\":\"Imperial Vidicarus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_ajax/quad_ajax.json\":{\"name\":\"Ajax Commander\",\"desc\":\"Quadruped Ajax Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_ajax/quad_ajax.json.player\":{\"name\":\"Ajax Commander\",\"desc\":\"Quadruped Ajax Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_ajax/quad_ajax.json.ai\":{\"name\":\"Ajax Commander\",\"desc\":\"Quadruped Ajax Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_locust/quad_locust.json\":{\"name\":\"Locust Commander\",\"desc\":\"Quadruped Locust Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_locust/quad_locust.json.player\":{\"name\":\"Locust Commander\",\"desc\":\"Quadruped Locust Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_locust/quad_locust.json.ai\":{\"name\":\"Locust Commander\",\"desc\":\"Quadruped Locust Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_armalisk/quad_armalisk.json\":{\"name\":\"Armalisk Commander\",\"desc\":\"Quadruped Armalisk Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_armalisk/quad_armalisk.json.player\":{\"name\":\"Armalisk Commander\",\"desc\":\"Quadruped Armalisk Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_armalisk/quad_armalisk.json.ai\":{\"name\":\"Armalisk Commander\",\"desc\":\"Quadruped Armalisk Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_aeson/tank_aeson.json\":{\"name\":\"Aeson Commander\",\"desc\":\"Tank Aeson Commander \",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_aeson/tank_aeson.json.player\":{\"name\":\"Aeson Commander\",\"desc\":\"Tank Aeson Commander \",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_aeson/tank_aeson.json.ai\":{\"name\":\"Aeson Commander\",\"desc\":\"Tank Aeson Commander \",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_calyx/quad_calyx.json\":{\"name\":\"Calyx Commander\",\"desc\":\"Quadruped Calyx Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_calyx/quad_calyx.json.player\":{\"name\":\"Calyx Commander\",\"desc\":\"Quadruped Calyx Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_calyx/quad_calyx.json.ai\":{\"name\":\"Calyx Commander\",\"desc\":\"Quadruped Calyx Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_pumpkin/quad_pumpkin.json\":{\"name\":\"Pumpkin Commander\",\"desc\":\"Quadruped Pumpkin Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander_pumpkin\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander_pumpkin.png\"},\"/pa/units/commanders/quad_pumpkin/quad_pumpkin.json.player\":{\"name\":\"Pumpkin Commander\",\"desc\":\"Quadruped Pumpkin Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander_pumpkin\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander_pumpkin.png\"},\"/pa/units/commanders/quad_pumpkin/quad_pumpkin.json.ai\":{\"name\":\"Pumpkin Commander\",\"desc\":\"Quadruped Pumpkin Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander_pumpkin\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander_pumpkin.png\"},\"/pa/units/commanders/quad_raventhornn/quad_raventhornn.json\":{\"name\":\"Raventhornn Commander\",\"desc\":\"Quadruped Raventhornn Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_raventhornn/quad_raventhornn.json.player\":{\"name\":\"Raventhornn Commander\",\"desc\":\"Quadruped Raventhornn Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_raventhornn/quad_raventhornn.json.ai\":{\"name\":\"Raventhornn Commander\",\"desc\":\"Quadruped Raventhornn Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_theflax/quad_theflax.json\":{\"name\":\"TheFlax Commander\",\"desc\":\"Quadruped TheFlax Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_theflax/quad_theflax.json.player\":{\"name\":\"TheFlax Commander\",\"desc\":\"Quadruped TheFlax Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_theflax/quad_theflax.json.ai\":{\"name\":\"TheFlax Commander\",\"desc\":\"Quadruped TheFlax Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/orbital/orbital_railgun/orbital_railgun.json\":{\"name\":\"Artemis\",\"desc\":\"Railgun Platform - Long range with high damage. Very low rate of fire. Uses energy. Attacks orbital.\",\"cost\":2000,\"maxHealth\":350,\"moveSpeed\":30,\"damage\":300,\"fireRate\":0.20000000298023224,\"dps\":60,\"max_range\":350,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1000,\"ammo_demand\":200,\"ammo_per_shot\":1000},\"sicon\":\"orbital_railgun\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_railgun.png\"},\"/pa/units/orbital/orbital_railgun/orbital_railgun.json.player\":{\"name\":\"Artemis\",\"desc\":\"Railgun Platform - Long range with high damage. Very low rate of fire. Uses energy. Attacks orbital.\",\"cost\":2000,\"maxHealth\":350,\"moveSpeed\":30,\"damage\":300,\"fireRate\":0.20000000298023224,\"dps\":60,\"max_range\":350,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1000,\"ammo_demand\":200,\"ammo_per_shot\":1000},\"sicon\":\"orbital_railgun\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_railgun.png\"},\"/pa/units/orbital/orbital_railgun/orbital_railgun.json.ai\":{\"name\":\"Artemis\",\"desc\":\"Railgun Platform - Long range with high damage. Very low rate of fire. Uses energy. Attacks orbital.\",\"cost\":2000,\"maxHealth\":350,\"moveSpeed\":30,\"damage\":300,\"fireRate\":0.20000000298023224,\"dps\":60,\"max_range\":350,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1000,\"ammo_demand\":200,\"ammo_per_shot\":1000},\"sicon\":\"orbital_railgun\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_railgun.png\"},\"/pa/units/land/assault_bot_adv/assault_bot_adv.json\":{\"name\":\"Slammer\",\"desc\":\"Assault Bot - Armoured with high damage guns and torpedoes. Amphibious. Attacks land and sea.\",\"cost\":500,\"maxHealth\":360,\"moveSpeed\":14,\"damage\":60,\"fireRate\":6,\"dps\":360,\"max_range\":160,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"assault_bot_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_assault_bot_adv.png\"},\"/pa/units/land/assault_bot_adv/assault_bot_adv.json.player\":{\"name\":\"Slammer\",\"desc\":\"Assault Bot - Armoured with high damage guns and torpedoes. Amphibious. Attacks land and sea.\",\"cost\":500,\"maxHealth\":360,\"moveSpeed\":14,\"damage\":60,\"fireRate\":6,\"dps\":360,\"max_range\":160,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"assault_bot_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_assault_bot_adv.png\"},\"/pa/units/land/assault_bot_adv/assault_bot_adv.json.ai\":{\"name\":\"Slammer\",\"desc\":\"Assault Bot - Armoured with high damage guns and torpedoes. Amphibious. Attacks land and sea.\",\"cost\":500,\"maxHealth\":360,\"moveSpeed\":14,\"damage\":60,\"fireRate\":6,\"dps\":360,\"max_range\":160,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"assault_bot_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_assault_bot_adv.png\"},\"/pa/units/commanders/quad_xinthar/quad_xinthar.json\":{\"name\":\"Xinthar Commander\",\"desc\":\"Quadruped Xinthar Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_xinthar/quad_xinthar.json.player\":{\"name\":\"Xinthar Commander\",\"desc\":\"Quadruped Xinthar Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_xinthar/quad_xinthar.json.ai\":{\"name\":\"Xinthar Commander\",\"desc\":\"Quadruped Xinthar Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_zancrowe/quad_zancrowe.json\":{\"name\":\"Zancrowe Commander\",\"desc\":\"Quadruped Zancrowe Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_zancrowe/quad_zancrowe.json.player\":{\"name\":\"Zancrowe Commander\",\"desc\":\"Quadruped Zancrowe Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/quad_zancrowe/quad_zancrowe.json.ai\":{\"name\":\"Zancrowe Commander\",\"desc\":\"Quadruped Zancrowe Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_base/raptor_base.json\":{\"name\":\"Raptor Class Commander\",\"desc\":\"Raptor Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_base/raptor_base.json.player\":{\"name\":\"Raptor Class Commander\",\"desc\":\"Raptor Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_base/raptor_base.json.ai\":{\"name\":\"Raptor Class Commander\",\"desc\":\"Raptor Class Commander. - If you're seeing this, something is wrong in your commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_beast/raptor_beast.json\":{\"name\":\"Beast Commander\",\"desc\":\"Raptor Beast Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_beast/raptor_beast.json.player\":{\"name\":\"Beast Commander\",\"desc\":\"Raptor Beast Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_beast/raptor_beast.json.ai\":{\"name\":\"Beast Commander\",\"desc\":\"Raptor Beast Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_beast_king/raptor_beast_king.json\":{\"name\":\"Beast King Commander\",\"desc\":\"Raptor Beast King Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander_beast_king\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander_beast_king.png\"},\"/pa/units/commanders/raptor_beast_king/raptor_beast_king.json.player\":{\"name\":\"Beast King Commander\",\"desc\":\"Raptor Beast King Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander_beast_king\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander_beast_king.png\"},\"/pa/units/commanders/raptor_beast_king/raptor_beast_king.json.ai\":{\"name\":\"Beast King Commander\",\"desc\":\"Raptor Beast King Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander_beast_king\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander_beast_king.png\"},\"/pa/units/commanders/raptor_diremachine/raptor_diremachine.json\":{\"name\":\"Diremachine Commander\",\"desc\":\"Raptor Diremachine Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_diremachine/raptor_diremachine.json.player\":{\"name\":\"Diremachine Commander\",\"desc\":\"Raptor Diremachine Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_diremachine/raptor_diremachine.json.ai\":{\"name\":\"Diremachine Commander\",\"desc\":\"Raptor Diremachine Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_beniesk/raptor_beniesk.json\":{\"name\":\"Beniesk Commander\",\"desc\":\"Raptor Beniesk Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_beniesk/raptor_beniesk.json.player\":{\"name\":\"Beniesk Commander\",\"desc\":\"Raptor Beniesk Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_beniesk/raptor_beniesk.json.ai\":{\"name\":\"Beniesk Commander\",\"desc\":\"Raptor Beniesk Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_centurion/raptor_centurion.json\":{\"name\":\"Centurion Commander\",\"desc\":\"Raptor Centurion Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_centurion/raptor_centurion.json.player\":{\"name\":\"Centurion Commander\",\"desc\":\"Raptor Centurion Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_centurion/raptor_centurion.json.ai\":{\"name\":\"Centurion Commander\",\"desc\":\"Raptor Centurion Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_damubbster/raptor_damubbster.json\":{\"name\":\"Damubbster Commander\",\"desc\":\"Raptor Damubbster Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_damubbster/raptor_damubbster.json.player\":{\"name\":\"Damubbster Commander\",\"desc\":\"Raptor Damubbster Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_damubbster/raptor_damubbster.json.ai\":{\"name\":\"Damubbster Commander\",\"desc\":\"Raptor Damubbster Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_enderstryke71/raptor_enderstryke71.json\":{\"name\":\"Enderstryke71 Commander\",\"desc\":\"Raptor Enderstryke71 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_enderstryke71/raptor_enderstryke71.json.player\":{\"name\":\"Enderstryke71 Commander\",\"desc\":\"Raptor Enderstryke71 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_enderstryke71/raptor_enderstryke71.json.ai\":{\"name\":\"Enderstryke71 Commander\",\"desc\":\"Raptor Enderstryke71 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_iwmiked/raptor_iwmiked.json\":{\"name\":\"Iwmiked Commander\",\"desc\":\"Raptor Iwmiked Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_iwmiked/raptor_iwmiked.json.player\":{\"name\":\"Iwmiked Commander\",\"desc\":\"Raptor Iwmiked Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_iwmiked/raptor_iwmiked.json.ai\":{\"name\":\"Iwmiked Commander\",\"desc\":\"Raptor Iwmiked Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_majuju/raptor_majuju.json\":{\"name\":\"Majuju Commander\",\"desc\":\"Raptor Majuju Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_majuju/raptor_majuju.json.player\":{\"name\":\"Majuju Commander\",\"desc\":\"Raptor Majuju Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_majuju/raptor_majuju.json.ai\":{\"name\":\"Majuju Commander\",\"desc\":\"Raptor Majuju Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_player_commander/tutorial_player_commander.json\":{\"name\":\"Tutorial Commander\",\"desc\":\"Imperial Invictus Commander\",\"cost\":25000,\"maxHealth\":1000000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":40,\"energy\":1000},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":100000,\"energy\":100000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_player_commander/tutorial_player_commander.json.player\":{\"name\":\"Tutorial Commander\",\"desc\":\"Imperial Invictus Commander\",\"cost\":25000,\"maxHealth\":1000000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":40,\"energy\":1000},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":100000,\"energy\":100000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_player_commander/tutorial_player_commander.json.ai\":{\"name\":\"Tutorial Commander\",\"desc\":\"Imperial Invictus Commander\",\"cost\":25000,\"maxHealth\":1000000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":40,\"energy\":1000},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":100000,\"energy\":100000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_nemicus/raptor_nemicus.json\":{\"name\":\"Nemicus Commander\",\"desc\":\"Raptor Nemicus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_nemicus/raptor_nemicus.json.player\":{\"name\":\"Nemicus Commander\",\"desc\":\"Raptor Nemicus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_nemicus/raptor_nemicus.json.ai\":{\"name\":\"Nemicus Commander\",\"desc\":\"Raptor Nemicus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_xov/raptor_xov.json\":{\"name\":\"XOV Commander\",\"desc\":\"Raptor XOV Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_xov/raptor_xov.json.player\":{\"name\":\"XOV Commander\",\"desc\":\"Raptor XOV Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_xov/raptor_xov.json.ai\":{\"name\":\"XOV Commander\",\"desc\":\"Raptor XOV Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_raizell/raptor_raizell.json\":{\"name\":\"Raizell Commander\",\"desc\":\"Raptor Raizell Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_raizell/raptor_raizell.json.player\":{\"name\":\"Raizell Commander\",\"desc\":\"Raptor Raizell Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_raizell/raptor_raizell.json.ai\":{\"name\":\"Raizell Commander\",\"desc\":\"Raptor Raizell Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_rallus/raptor_rallus.json\":{\"name\":\"Rallus Commander\",\"desc\":\"Raptor Rallus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_rallus/raptor_rallus.json.player\":{\"name\":\"Rallus Commander\",\"desc\":\"Raptor Rallus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_rallus/raptor_rallus.json.ai\":{\"name\":\"Rallus Commander\",\"desc\":\"Raptor Rallus Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/land/teleporter/teleporter.json\":{\"name\":\"Teleporter\",\"desc\":\"Interplanetary Teleporter: Teleports units between linked Teleporters.\",\"cost\":1000,\"maxHealth\":7000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"energy\":1000,\"mental\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"teleporter\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_teleporter.png\"},\"/pa/units/land/teleporter/teleporter.json.player\":{\"name\":\"Teleporter\",\"desc\":\"Interplanetary Teleporter: Teleports units between linked Teleporters.\",\"cost\":1000,\"maxHealth\":7000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"energy\":1000,\"mental\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"teleporter\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_teleporter.png\"},\"/pa/units/land/teleporter/teleporter.json.ai\":{\"name\":\"Teleporter\",\"desc\":\"Interplanetary Teleporter: Teleports units between linked Teleporters.\",\"cost\":1000,\"maxHealth\":7000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"energy\":1000,\"mental\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"teleporter\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_teleporter.png\"},\"/pa/units/commanders/raptor_stickman9000/raptor_stickman9000.json\":{\"name\":\"Stickman9000 Commander\",\"desc\":\"Raptor Stickman9000 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_stickman9000/raptor_stickman9000.json.player\":{\"name\":\"Stickman9000 Commander\",\"desc\":\"Raptor Stickman9000 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/raptor_stickman9000/raptor_stickman9000.json.ai\":{\"name\":\"Stickman9000 Commander\",\"desc\":\"Raptor Stickman9000 Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/sea/destroyer/destroyer.json\":{\"name\":\"Orca\",\"desc\":\"Deep Water Destroyer - Medium range with high damage. Very durable. Attacks land and sea targets.\",\"cost\":600,\"maxHealth\":1500,\"moveSpeed\":12,\"damage\":50,\"fireRate\":0.6000000238418579,\"dps\":60.000003814697266,\"max_range\":180,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"destroyer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_destroyer.png\"},\"/pa/units/sea/destroyer/destroyer.json.player\":{\"name\":\"Orca\",\"desc\":\"Deep Water Destroyer - Medium range with high damage. Very durable. Attacks land and sea targets.\",\"cost\":600,\"maxHealth\":1500,\"moveSpeed\":12,\"damage\":50,\"fireRate\":0.6000000238418579,\"dps\":60.000003814697266,\"max_range\":180,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"destroyer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_destroyer.png\"},\"/pa/units/sea/destroyer/destroyer.json.ai\":{\"name\":\"Orca\",\"desc\":\"Deep Water Destroyer - Medium range with high damage. Very durable. Attacks land and sea targets.\",\"cost\":600,\"maxHealth\":1500,\"moveSpeed\":12,\"damage\":50,\"fireRate\":0.6000000238418579,\"dps\":60.000003814697266,\"max_range\":180,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"destroyer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_destroyer.png\"},\"/pa/units/land/tank_armor/tank_armor.json\":{\"name\":\"Inferno\",\"desc\":\"Flame Tank - Short range, heavy armored vehicle.\",\"cost\":225,\"maxHealth\":1000,\"moveSpeed\":10,\"damage\":100,\"fireRate\":4,\"dps\":400,\"max_range\":20,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_armor\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_armor.png\"},\"/pa/units/land/tank_armor/tank_armor.json.player\":{\"name\":\"Inferno\",\"desc\":\"Flame Tank - Short range, heavy armored vehicle.\",\"cost\":225,\"maxHealth\":1000,\"moveSpeed\":10,\"damage\":100,\"fireRate\":4,\"dps\":400,\"max_range\":20,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_armor\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_armor.png\"},\"/pa/units/land/tank_armor/tank_armor.json.ai\":{\"name\":\"Inferno\",\"desc\":\"Flame Tank - Short range, heavy armored vehicle.\",\"cost\":225,\"maxHealth\":1000,\"moveSpeed\":10,\"damage\":100,\"fireRate\":4,\"dps\":400,\"max_range\":20,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_armor\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_armor.png\"},\"/pa/units/commanders/raptor_unicorn/raptor_unicorn.json\":{\"name\":\"Unicorn Commander\",\"desc\":\"Raptor Unicorn Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander_unicorn\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander_unicorn.png\"},\"/pa/units/commanders/raptor_unicorn/raptor_unicorn.json.player\":{\"name\":\"Unicorn Commander\",\"desc\":\"Raptor Unicorn Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander_unicorn\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander_unicorn.png\"},\"/pa/units/commanders/raptor_unicorn/raptor_unicorn.json.ai\":{\"name\":\"Unicorn Commander\",\"desc\":\"Raptor Unicorn Commander.\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander_unicorn\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander_unicorn.png\"},\"/pa/units/commanders/tank_banditks/tank_banditks.json\":{\"name\":\"Banditks Commander\",\"desc\":\"Tank Banditks Commander \",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_banditks/tank_banditks.json.player\":{\"name\":\"Banditks Commander\",\"desc\":\"Tank Banditks Commander \",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_banditks/tank_banditks.json.ai\":{\"name\":\"Banditks Commander\",\"desc\":\"Tank Banditks Commander \",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/land/tank_heavy_armor/tank_heavy_armor.json\":{\"name\":\"Vanguard\",\"desc\":\"Heavy Tank - Advanced short range, heavily armored vehicle.\",\"cost\":1500,\"maxHealth\":5000,\"moveSpeed\":10,\"damage\":1000,\"fireRate\":1,\"dps\":1000,\"max_range\":50,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_heavy_armor\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_heavy_armor.png\"},\"/pa/units/land/tank_heavy_armor/tank_heavy_armor.json.player\":{\"name\":\"Vanguard\",\"desc\":\"Heavy Tank - Advanced short range, heavily armored vehicle.\",\"cost\":1500,\"maxHealth\":5000,\"moveSpeed\":10,\"damage\":1000,\"fireRate\":1,\"dps\":1000,\"max_range\":50,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_heavy_armor\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_heavy_armor.png\"},\"/pa/units/land/tank_heavy_armor/tank_heavy_armor.json.ai\":{\"name\":\"Vanguard\",\"desc\":\"Heavy Tank - Advanced short range, heavily armored vehicle.\",\"cost\":1500,\"maxHealth\":5000,\"moveSpeed\":10,\"damage\":1000,\"fireRate\":1,\"dps\":1000,\"max_range\":50,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_heavy_armor\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_heavy_armor.png\"},\"/pa/units/commanders/tank_reaver/tank_reaver.json\":{\"name\":\"Reaver Commander\",\"desc\":\"Tank Reaver Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_reaver/tank_reaver.json.player\":{\"name\":\"Reaver Commander\",\"desc\":\"Tank Reaver Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tank_reaver/tank_reaver.json.ai\":{\"name\":\"Reaver Commander\",\"desc\":\"Tank Reaver Commander\",\"cost\":25000,\"maxHealth\":12500,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/land/aa_missile_vehicle/aa_missile_vehicle.json\":{\"name\":\"Spinner\",\"desc\":\"Mobile Anti-Air - Equipped with homing missiles. Only attacks air.\",\"cost\":150,\"maxHealth\":160,\"moveSpeed\":10,\"damage\":25,\"fireRate\":2.4000000953674316,\"dps\":60.000003814697266,\"max_range\":130,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"aa_missile_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_aa_missile_vehicle.png\"},\"/pa/units/land/aa_missile_vehicle/aa_missile_vehicle.json.player\":{\"name\":\"Spinner\",\"desc\":\"Mobile Anti-Air - Equipped with homing missiles. Only attacks air.\",\"cost\":150,\"maxHealth\":160,\"moveSpeed\":10,\"damage\":25,\"fireRate\":2.4000000953674316,\"dps\":60.000003814697266,\"max_range\":130,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"aa_missile_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_aa_missile_vehicle.png\"},\"/pa/units/land/aa_missile_vehicle/aa_missile_vehicle.json.ai\":{\"name\":\"Spinner\",\"desc\":\"Mobile Anti-Air - Equipped with homing missiles. Only attacks air.\",\"cost\":150,\"maxHealth\":160,\"moveSpeed\":10,\"damage\":25,\"fireRate\":2.4000000953674316,\"dps\":60.000003814697266,\"max_range\":130,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"aa_missile_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_aa_missile_vehicle.png\"},\"/pa/units/land/air_defense/air_defense.json\":{\"name\":\"Galata Turret\",\"desc\":\"Anti-Air Defense - Equipped with homing missiles. Only attacks air.\",\"cost\":225,\"maxHealth\":1000,\"damage\":25,\"fireRate\":4,\"dps\":100,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_defense\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_defense.png\"},\"/pa/units/land/air_defense/air_defense.json.player\":{\"name\":\"Galata Turret\",\"desc\":\"Anti-Air Defense - Equipped with homing missiles. Only attacks air.\",\"cost\":225,\"maxHealth\":1000,\"damage\":25,\"fireRate\":4,\"dps\":100,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_defense\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_defense.png\"},\"/pa/units/land/air_defense/air_defense.json.ai\":{\"name\":\"Galata Turret\",\"desc\":\"Anti-Air Defense - Equipped with homing missiles. Only attacks air.\",\"cost\":225,\"maxHealth\":1000,\"damage\":25,\"fireRate\":4,\"dps\":100,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_defense\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_defense.png\"},\"/pa/units/orbital/base_orbital/base_orbital.json\":{\"name\":\"Base Orbital\",\"desc\":\"Base Orbital: Why are you seeing this? It's not a full spec.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_orbital\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_orbital.png\"},\"/pa/units/orbital/base_orbital/base_orbital.json.player\":{\"name\":\"Base Orbital\",\"desc\":\"Base Orbital: Why are you seeing this? It's not a full spec.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_orbital\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_orbital.png\"},\"/pa/units/orbital/base_orbital/base_orbital.json.ai\":{\"name\":\"Base Orbital\",\"desc\":\"Base Orbital: Why are you seeing this? It's not a full spec.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_orbital\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_orbital.png\"},\"/pa/units/land/vehicle_factory/vehicle_factory.json\":{\"name\":\"Vehicle Factory\",\"desc\":\"Basic Manufacturing - Builds basic land vehicles.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":15,\"energy\":675},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"vehicle_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_vehicle_factory.png\"},\"/pa/units/land/vehicle_factory/vehicle_factory.json.player\":{\"name\":\"Vehicle Factory\",\"desc\":\"Basic Manufacturing - Builds basic land vehicles.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":15,\"energy\":675},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"vehicle_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_vehicle_factory.png\"},\"/pa/units/land/vehicle_factory/vehicle_factory.json.ai\":{\"name\":\"Vehicle Factory\",\"desc\":\"Basic Manufacturing - Builds basic land vehicles.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":15,\"energy\":675},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"vehicle_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_vehicle_factory.png\"},\"/pa/units/land/air_defense_adv/air_defense_adv.json\":{\"name\":\"Flak Cannon\",\"desc\":\"Advanced Anti-Air - Overhead heavy damage. Only attacks air.\",\"cost\":900,\"maxHealth\":2000,\"damage\":40,\"fireRate\":1.2000000476837158,\"dps\":192,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_defense_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_defense_adv.png\"},\"/pa/units/land/air_defense_adv/air_defense_adv.json.player\":{\"name\":\"Flak Cannon\",\"desc\":\"Advanced Anti-Air - Overhead heavy damage. Only attacks air.\",\"cost\":900,\"maxHealth\":2000,\"damage\":40,\"fireRate\":1.2000000476837158,\"dps\":192,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_defense_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_defense_adv.png\"},\"/pa/units/land/air_defense_adv/air_defense_adv.json.ai\":{\"name\":\"Flak Cannon\",\"desc\":\"Advanced Anti-Air - Overhead heavy damage. Only attacks air.\",\"cost\":900,\"maxHealth\":2000,\"damage\":40,\"fireRate\":1.2000000476837158,\"dps\":192,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"air_defense_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_air_defense_adv.png\"},\"/pa/units/land/tank_jammer/tank_jammer.json\":{\"name\":\"Nyx\",\"desc\":\"Jamming Vehicle - Equipped with mobile radar and radar jamming.\",\"cost\":700,\"maxHealth\":1000,\"moveSpeed\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":700},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_jammer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_jammer.png\"},\"/pa/units/land/tank_jammer/tank_jammer.json.player\":{\"name\":\"Nyx\",\"desc\":\"Jamming Vehicle - Equipped with mobile radar and radar jamming.\",\"cost\":700,\"maxHealth\":1000,\"moveSpeed\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":700},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_jammer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_jammer.png\"},\"/pa/units/land/tank_jammer/tank_jammer.json.ai\":{\"name\":\"Nyx\",\"desc\":\"Jamming Vehicle - Equipped with mobile radar and radar jamming.\",\"cost\":700,\"maxHealth\":1000,\"moveSpeed\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":700},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_jammer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_jammer.png\"},\"/pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json\":{\"name\":\"Anti-Nuke Launcher\",\"desc\":\"Anti-Nuke - Builds advanced anti-nuclear missiles.\",\"cost\":12000,\"maxHealth\":3500,\"damage\":1,\"fireRate\":1.5,\"dps\":1.5,\"max_range\":300,\"build_arm\":{\"metal\":60,\"energy\":4000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"anti_nuke_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_anti_nuke_launcher.png\"},\"/pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json.player\":{\"name\":\"Anti-Nuke Launcher\",\"desc\":\"Anti-Nuke - Builds advanced anti-nuclear missiles.\",\"cost\":12000,\"maxHealth\":3500,\"damage\":1,\"fireRate\":1.5,\"dps\":1.5,\"max_range\":300,\"build_arm\":{\"metal\":60,\"energy\":4000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"anti_nuke_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_anti_nuke_launcher.png\"},\"/pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json.ai\":{\"name\":\"Anti-Nuke Launcher\",\"desc\":\"Anti-Nuke - Builds advanced anti-nuclear missiles.\",\"cost\":12000,\"maxHealth\":3500,\"damage\":1,\"fireRate\":1.5,\"dps\":1.5,\"max_range\":300,\"build_arm\":{\"metal\":60,\"energy\":4000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"anti_nuke_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_anti_nuke_launcher.png\"},\"/pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json\":{\"name\":\"SR-24 Shield Missile Defense\",\"desc\":\"Anti-nuke - Intercepts incoming nuclear missiles.\",\"cost\":5000,\"damage\":1,\"energy_weapon\":null,\"sicon\":\"anti_nuke_launcher_ammo\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_anti_nuke_launcher_ammo.png\"},\"/pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json.player\":{\"name\":\"SR-24 Shield Missile Defense\",\"desc\":\"Anti-nuke - Intercepts incoming nuclear missiles.\",\"cost\":5000,\"damage\":1,\"energy_weapon\":null,\"sicon\":\"anti_nuke_launcher_ammo\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_anti_nuke_launcher_ammo.png\"},\"/pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json.ai\":{\"name\":\"SR-24 Shield Missile Defense\",\"desc\":\"Anti-nuke - Intercepts incoming nuclear missiles.\",\"cost\":5000,\"damage\":1,\"energy_weapon\":null,\"sicon\":\"anti_nuke_launcher_ammo\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_anti_nuke_launcher_ammo.png\"},\"/pa/units/orbital/orbital_mine/orbital_mine.json\":{\"name\":\"Kessler\",\"desc\":\"Orbital Mine - Self destructs to deal very heavy damage to nearby enemy units\",\"cost\":300,\"maxHealth\":80,\"moveSpeed\":90,\"damage\":600,\"fireRate\":5,\"dps\":3000,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_mine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_mine.png\"},\"/pa/units/orbital/orbital_mine/orbital_mine.json.player\":{\"name\":\"Kessler\",\"desc\":\"Orbital Mine - Self destructs to deal very heavy damage to nearby enemy units\",\"cost\":300,\"maxHealth\":80,\"moveSpeed\":90,\"damage\":600,\"fireRate\":5,\"dps\":3000,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_mine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_mine.png\"},\"/pa/units/orbital/orbital_mine/orbital_mine.json.ai\":{\"name\":\"Kessler\",\"desc\":\"Orbital Mine - Self destructs to deal very heavy damage to nearby enemy units\",\"cost\":300,\"maxHealth\":80,\"moveSpeed\":90,\"damage\":600,\"fireRate\":5,\"dps\":3000,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_mine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_mine.png\"},\"/pa/units/land/land_barrier/land_barrier.json\":{\"name\":\"Wall\",\"desc\":\"Barrier - Blocks units and protects from incoming fire.\",\"cost\":50,\"maxHealth\":2000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"land_barrier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_land_barrier.png\"},\"/pa/units/land/land_barrier/land_barrier.json.player\":{\"name\":\"Wall\",\"desc\":\"Barrier - Blocks units and protects from incoming fire.\",\"cost\":50,\"maxHealth\":2000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"land_barrier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_land_barrier.png\"},\"/pa/units/land/land_barrier/land_barrier.json.ai\":{\"name\":\"Wall\",\"desc\":\"Barrier - Blocks units and protects from incoming fire.\",\"cost\":50,\"maxHealth\":2000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"land_barrier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_land_barrier.png\"},\"/pa/units/land/artillery_long/artillery_long.json\":{\"name\":\"Holkins\",\"desc\":\"Advanced Artillery - Extremely long range heavy damage. Can lay siege from very far away. Attacks land and sea targets.\",\"cost\":10000,\"maxHealth\":5000,\"damage\":5000,\"fireRate\":0.07000000029802322,\"dps\":350,\"max_range\":600,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":37500,\"ammo_demand\":2500,\"ammo_per_shot\":37500},\"sicon\":\"artillery_long\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_artillery_long.png\"},\"/pa/units/land/artillery_long/artillery_long.json.player\":{\"name\":\"Holkins\",\"desc\":\"Advanced Artillery - Extremely long range heavy damage. Can lay siege from very far away. Attacks land and sea targets.\",\"cost\":10000,\"maxHealth\":5000,\"damage\":5000,\"fireRate\":0.07000000029802322,\"dps\":350,\"max_range\":600,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":37500,\"ammo_demand\":2500,\"ammo_per_shot\":37500},\"sicon\":\"artillery_long\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_artillery_long.png\"},\"/pa/units/land/artillery_long/artillery_long.json.ai\":{\"name\":\"Holkins\",\"desc\":\"Advanced Artillery - Extremely long range heavy damage. Can lay siege from very far away. Attacks land and sea targets.\",\"cost\":10000,\"maxHealth\":5000,\"damage\":5000,\"fireRate\":0.07000000029802322,\"dps\":350,\"max_range\":600,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":37500,\"ammo_demand\":2500,\"ammo_per_shot\":37500},\"sicon\":\"artillery_long\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_artillery_long.png\"},\"/pa/units/land/artillery_short/artillery_short.json\":{\"name\":\"Pelter\",\"desc\":\"Artillery - Medium range for siege and area denial. Attacks land and sea targets.\",\"cost\":900,\"maxHealth\":1000,\"damage\":300,\"fireRate\":0.20000000298023224,\"dps\":60,\"max_range\":240,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1000,\"ammo_demand\":200,\"ammo_per_shot\":1000},\"sicon\":\"artillery_short\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_artillery_short.png\"},\"/pa/units/land/artillery_short/artillery_short.json.player\":{\"name\":\"Pelter\",\"desc\":\"Artillery - Medium range for siege and area denial. Attacks land and sea targets.\",\"cost\":900,\"maxHealth\":1000,\"damage\":300,\"fireRate\":0.20000000298023224,\"dps\":60,\"max_range\":240,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1000,\"ammo_demand\":200,\"ammo_per_shot\":1000},\"sicon\":\"artillery_short\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_artillery_short.png\"},\"/pa/units/land/artillery_short/artillery_short.json.ai\":{\"name\":\"Pelter\",\"desc\":\"Artillery - Medium range for siege and area denial. Attacks land and sea targets.\",\"cost\":900,\"maxHealth\":1000,\"damage\":300,\"fireRate\":0.20000000298023224,\"dps\":60,\"max_range\":240,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1000,\"ammo_demand\":200,\"ammo_per_shot\":1000},\"sicon\":\"artillery_short\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_artillery_short.png\"},\"/pa/units/land/assault_bot/assault_bot.json\":{\"name\":\"Dox\",\"desc\":\"Basic Infantry - Fast, adaptable, expendable. Amphibious. Attacks surface targets when on land.\",\"cost\":45,\"maxHealth\":40,\"moveSpeed\":20,\"damage\":10,\"fireRate\":0.8999999761581421,\"dps\":18,\"max_range\":75,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"assault_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_assault_bot.png\"},\"/pa/units/land/assault_bot/assault_bot.json.player\":{\"name\":\"Dox\",\"desc\":\"Basic Infantry - Fast, adaptable, expendable. Amphibious. Attacks surface targets when on land.\",\"cost\":45,\"maxHealth\":40,\"moveSpeed\":20,\"damage\":10,\"fireRate\":0.8999999761581421,\"dps\":18,\"max_range\":75,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"assault_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_assault_bot.png\"},\"/pa/units/land/assault_bot/assault_bot.json.ai\":{\"name\":\"Dox\",\"desc\":\"Basic Infantry - Fast, adaptable, expendable. Amphibious. Attacks surface targets when on land.\",\"cost\":45,\"maxHealth\":40,\"moveSpeed\":20,\"damage\":10,\"fireRate\":0.8999999761581421,\"dps\":18,\"max_range\":75,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"assault_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_assault_bot.png\"},\"/pa/units/land/avatar_factory/avatar_factory.json\":{\"name\":\"Avatar Factory\",\"desc\":\"For debugging purposes\",\"cost\":600,\"maxHealth\":2000,\"build_arm\":{\"metal\":10000,\"energy\":100000},\"production\":{\"metal\":10000,\"energy\":100000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"avatar_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_avatar_factory.png\"},\"/pa/units/land/avatar_factory/avatar_factory.json.player\":{\"name\":\"Avatar Factory\",\"desc\":\"For debugging purposes\",\"cost\":600,\"maxHealth\":2000,\"build_arm\":{\"metal\":10000,\"energy\":100000},\"production\":{\"metal\":10000,\"energy\":100000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"avatar_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_avatar_factory.png\"},\"/pa/units/land/avatar_factory/avatar_factory.json.ai\":{\"name\":\"Avatar Factory\",\"desc\":\"For debugging purposes\",\"cost\":600,\"maxHealth\":2000,\"build_arm\":{\"metal\":10000,\"energy\":100000},\"production\":{\"metal\":10000,\"energy\":100000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"avatar_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_avatar_factory.png\"},\"/pa/units/orbital/orbital_probe/orbital_probe.json\":{\"name\":\"Hermes\",\"desc\":\"Space Probe - Fast. Cheap. Expendable. Provides ground vision. Does not attack.\",\"cost\":200,\"maxHealth\":50,\"moveSpeed\":75,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_probe\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_probe.png\"},\"/pa/units/orbital/orbital_probe/orbital_probe.json.player\":{\"name\":\"Hermes\",\"desc\":\"Space Probe - Fast. Cheap. Expendable. Provides ground vision. Does not attack.\",\"cost\":200,\"maxHealth\":50,\"moveSpeed\":75,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_probe\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_probe.png\"},\"/pa/units/orbital/orbital_probe/orbital_probe.json.ai\":{\"name\":\"Hermes\",\"desc\":\"Space Probe - Fast. Cheap. Expendable. Provides ground vision. Does not attack.\",\"cost\":200,\"maxHealth\":50,\"moveSpeed\":75,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_probe\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_probe.png\"},\"/pa/units/land/base_bot/base_bot.json\":{\"name\":\"Base Bot\",\"desc\":\"Base Bot Description - If you're seeing this, something is wrong in your bot.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_bot.png\"},\"/pa/units/land/base_bot/base_bot.json.player\":{\"name\":\"Base Bot\",\"desc\":\"Base Bot Description - If you're seeing this, something is wrong in your bot.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_bot.png\"},\"/pa/units/land/base_bot/base_bot.json.ai\":{\"name\":\"Base Bot\",\"desc\":\"Base Bot Description - If you're seeing this, something is wrong in your bot.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_bot.png\"},\"/pa/units/land/base_structure/base_structure.json\":{\"name\":\"Base Structure\",\"desc\":\"Base Structure Description - If you're seeing this, something is wrong in your structure.\",\"cost\":1,\"maxHealth\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_structure\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_structure.png\"},\"/pa/units/land/base_structure/base_structure.json.player\":{\"name\":\"Base Structure\",\"desc\":\"Base Structure Description - If you're seeing this, something is wrong in your structure.\",\"cost\":1,\"maxHealth\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_structure\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_structure.png\"},\"/pa/units/land/base_structure/base_structure.json.ai\":{\"name\":\"Base Structure\",\"desc\":\"Base Structure Description - If you're seeing this, something is wrong in your structure.\",\"cost\":1,\"maxHealth\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_structure\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_structure.png\"},\"/pa/units/sea/missile_ship/missile_ship.json\":{\"name\":\"Stingray\",\"desc\":\"Missile Ship - Long range with radar. High damage anti-air and tactical missiles. Attacks land, sea, air, and orbital targets.\",\"cost\":3200,\"maxHealth\":3000,\"moveSpeed\":11,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":260,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":150},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"missile_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_missile_ship.png\"},\"/pa/units/sea/missile_ship/missile_ship.json.player\":{\"name\":\"Stingray\",\"desc\":\"Missile Ship - Long range with radar. High damage anti-air and tactical missiles. Attacks land, sea, air, and orbital targets.\",\"cost\":3200,\"maxHealth\":3000,\"moveSpeed\":11,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":260,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":150},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"missile_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_missile_ship.png\"},\"/pa/units/sea/missile_ship/missile_ship.json.ai\":{\"name\":\"Stingray\",\"desc\":\"Missile Ship - Long range with radar. High damage anti-air and tactical missiles. Attacks land, sea, air, and orbital targets.\",\"cost\":3200,\"maxHealth\":3000,\"moveSpeed\":11,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":260,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":150},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"missile_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_missile_ship.png\"},\"/pa/units/land/base_vehicle/base_vehicle.json\":{\"name\":\"Base Vehicle\",\"desc\":\"Base Vehicle Description - If you're seeing this, something is wrong in your vehicle.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_vehicle.png\"},\"/pa/units/land/base_vehicle/base_vehicle.json.player\":{\"name\":\"Base Vehicle\",\"desc\":\"Base Vehicle Description - If you're seeing this, something is wrong in your vehicle.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_vehicle.png\"},\"/pa/units/land/base_vehicle/base_vehicle.json.ai\":{\"name\":\"Base Vehicle\",\"desc\":\"Base Vehicle Description - If you're seeing this, something is wrong in your vehicle.\",\"cost\":1,\"maxHealth\":1,\"moveSpeed\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_vehicle.png\"},\"/pa/units/land/bot_aa/bot_aa.json\":{\"name\":\"Stinger\",\"desc\":\"Anti-Air Bot - Equipped with basic anti-air missiles.\",\"cost\":120,\"maxHealth\":55,\"moveSpeed\":16,\"damage\":10,\"fireRate\":1.5,\"dps\":30,\"max_range\":90,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_aa\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_aa.png\"},\"/pa/units/land/bot_aa/bot_aa.json.player\":{\"name\":\"Stinger\",\"desc\":\"Anti-Air Bot - Equipped with basic anti-air missiles.\",\"cost\":120,\"maxHealth\":55,\"moveSpeed\":16,\"damage\":10,\"fireRate\":1.5,\"dps\":30,\"max_range\":90,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_aa\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_aa.png\"},\"/pa/units/land/bot_aa/bot_aa.json.ai\":{\"name\":\"Stinger\",\"desc\":\"Anti-Air Bot - Equipped with basic anti-air missiles.\",\"cost\":120,\"maxHealth\":55,\"moveSpeed\":16,\"damage\":10,\"fireRate\":1.5,\"dps\":30,\"max_range\":90,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_aa\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_aa.png\"},\"/pa/units/land/bot_bomb/bot_bomb.json\":{\"name\":\"Boom\",\"desc\":\"Bomb bot- Self-Destructs to deal very heavy damage over an area. Extremely fast.\",\"cost\":45,\"maxHealth\":10,\"moveSpeed\":40,\"damage\":600,\"fireRate\":10,\"dps\":6000,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1,\"ammo_demand\":10,\"ammo_per_shot\":1},\"sicon\":\"bot_bomb\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_bomb.png\"},\"/pa/units/land/bot_bomb/bot_bomb.json.player\":{\"name\":\"Boom\",\"desc\":\"Bomb bot- Self-Destructs to deal very heavy damage over an area. Extremely fast.\",\"cost\":45,\"maxHealth\":10,\"moveSpeed\":40,\"damage\":600,\"fireRate\":10,\"dps\":6000,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1,\"ammo_demand\":10,\"ammo_per_shot\":1},\"sicon\":\"bot_bomb\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_bomb.png\"},\"/pa/units/land/bot_bomb/bot_bomb.json.ai\":{\"name\":\"Boom\",\"desc\":\"Bomb bot- Self-Destructs to deal very heavy damage over an area. Extremely fast.\",\"cost\":45,\"maxHealth\":10,\"moveSpeed\":40,\"damage\":600,\"fireRate\":10,\"dps\":6000,\"max_range\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1,\"ammo_demand\":10,\"ammo_per_shot\":1},\"sicon\":\"bot_bomb\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_bomb.png\"},\"/pa/units/land/bot_factory/bot_factory.json\":{\"name\":\"Bot Factory\",\"desc\":\"Basic Manufacturing - Builds basic bots.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":15,\"energy\":675},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_factory.png\"},\"/pa/units/land/bot_factory/bot_factory.json.player\":{\"name\":\"Bot Factory\",\"desc\":\"Basic Manufacturing - Builds basic bots.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":15,\"energy\":675},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_factory.png\"},\"/pa/units/land/bot_factory/bot_factory.json.ai\":{\"name\":\"Bot Factory\",\"desc\":\"Basic Manufacturing - Builds basic bots.\",\"cost\":600,\"maxHealth\":6000,\"build_arm\":{\"metal\":15,\"energy\":675},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_factory.png\"},\"/pa/units/land/fabrication_bot_combat_adv/fabrication_bot_combat_adv.json\":{\"name\":\"Mend\",\"desc\":\"Advanced Combat Fabricator - Repairs much faster and auto reclaims wreckage. Can build teleporters and defences in addition to mines.\",\"cost\":1000,\"maxHealth\":350,\"moveSpeed\":12,\"max_range\":75,\"build_arm\":{\"metal\":60,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot_combat_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot_combat_adv.png\"},\"/pa/units/land/fabrication_bot_combat_adv/fabrication_bot_combat_adv.json.player\":{\"name\":\"Mend\",\"desc\":\"Advanced Combat Fabricator - Repairs much faster and auto reclaims wreckage. Can build teleporters and defences in addition to mines.\",\"cost\":1000,\"maxHealth\":350,\"moveSpeed\":12,\"max_range\":75,\"build_arm\":{\"metal\":60,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot_combat_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot_combat_adv.png\"},\"/pa/units/land/fabrication_bot_combat_adv/fabrication_bot_combat_adv.json.ai\":{\"name\":\"Mend\",\"desc\":\"Advanced Combat Fabricator - Repairs much faster and auto reclaims wreckage. Can build teleporters and defences in addition to mines.\",\"cost\":1000,\"maxHealth\":350,\"moveSpeed\":12,\"max_range\":75,\"build_arm\":{\"metal\":60,\"energy\":800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot_combat_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot_combat_adv.png\"},\"/pa/units/land/bot_grenadier/bot_grenadier.json\":{\"name\":\"Grenadier\",\"desc\":\"Fire Support - Medium range. Can fire over walls. Attacks land and sea targets.\",\"cost\":100,\"maxHealth\":80,\"moveSpeed\":12,\"damage\":60,\"fireRate\":0.5,\"dps\":30,\"max_range\":140,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_grenadier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_grenadier.png\"},\"/pa/units/land/bot_grenadier/bot_grenadier.json.player\":{\"name\":\"Grenadier\",\"desc\":\"Fire Support - Medium range. Can fire over walls. Attacks land and sea targets.\",\"cost\":100,\"maxHealth\":80,\"moveSpeed\":12,\"damage\":60,\"fireRate\":0.5,\"dps\":30,\"max_range\":140,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_grenadier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_grenadier.png\"},\"/pa/units/land/bot_grenadier/bot_grenadier.json.ai\":{\"name\":\"Grenadier\",\"desc\":\"Fire Support - Medium range. Can fire over walls. Attacks land and sea targets.\",\"cost\":100,\"maxHealth\":80,\"moveSpeed\":12,\"damage\":60,\"fireRate\":0.5,\"dps\":30,\"max_range\":140,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_grenadier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_grenadier.png\"},\"/pa/units/land/land_mine/land_mine.json\":{\"name\":\"Land Mine\",\"desc\":\"Land Mine - Detonates when enemy units are in proximity.\",\"cost\":20,\"maxHealth\":5,\"damage\":1000,\"fireRate\":5,\"dps\":5000,\"max_range\":5,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"land_mine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_land_mine.png\"},\"/pa/units/land/land_mine/land_mine.json.player\":{\"name\":\"Land Mine\",\"desc\":\"Land Mine - Detonates when enemy units are in proximity.\",\"cost\":20,\"maxHealth\":5,\"damage\":1000,\"fireRate\":5,\"dps\":5000,\"max_range\":5,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"land_mine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_land_mine.png\"},\"/pa/units/land/land_mine/land_mine.json.ai\":{\"name\":\"Land Mine\",\"desc\":\"Land Mine - Detonates when enemy units are in proximity.\",\"cost\":20,\"maxHealth\":5,\"damage\":1000,\"fireRate\":5,\"dps\":5000,\"max_range\":5,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"land_mine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_land_mine.png\"},\"/pa/units/land/bot_sniper/bot_sniper.json\":{\"name\":\"Gil-E\",\"desc\":\"Sniper - Long range. High damage. Slow rate of fire. Intercepts missiles. Attacks land, air and sea targets.\",\"cost\":800,\"maxHealth\":150,\"moveSpeed\":12,\"damage\":600,\"fireRate\":0.20000000298023224,\"dps\":120,\"max_range\":200,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_sniper\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_sniper.png\"},\"/pa/units/land/bot_sniper/bot_sniper.json.player\":{\"name\":\"Gil-E\",\"desc\":\"Sniper - Long range. High damage. Slow rate of fire. Intercepts missiles. Attacks land, air and sea targets.\",\"cost\":800,\"maxHealth\":150,\"moveSpeed\":12,\"damage\":600,\"fireRate\":0.20000000298023224,\"dps\":120,\"max_range\":200,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_sniper\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_sniper.png\"},\"/pa/units/land/bot_sniper/bot_sniper.json.ai\":{\"name\":\"Gil-E\",\"desc\":\"Sniper - Long range. High damage. Slow rate of fire. Intercepts missiles. Attacks land, air and sea targets.\",\"cost\":800,\"maxHealth\":150,\"moveSpeed\":12,\"damage\":600,\"fireRate\":0.20000000298023224,\"dps\":120,\"max_range\":200,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_sniper\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_sniper.png\"},\"/pa/units/land/attack_vehicle/attack_vehicle.json\":{\"name\":\"Stryker\",\"desc\":\"Attack Vehicle - Fast, adaptable, expendable. Attacks surface and Air targets.\",\"cost\":55,\"maxHealth\":60,\"moveSpeed\":15,\"damage\":15,\"fireRate\":1,\"dps\":30,\"max_range\":80,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"attack_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_attack_vehicle.png\"},\"/pa/units/land/attack_vehicle/attack_vehicle.json.player\":{\"name\":\"Stryker\",\"desc\":\"Attack Vehicle - Fast, adaptable, expendable. Attacks surface and Air targets.\",\"cost\":55,\"maxHealth\":60,\"moveSpeed\":15,\"damage\":15,\"fireRate\":1,\"dps\":30,\"max_range\":80,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"attack_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_attack_vehicle.png\"},\"/pa/units/land/attack_vehicle/attack_vehicle.json.ai\":{\"name\":\"Stryker\",\"desc\":\"Attack Vehicle - Fast, adaptable, expendable. Attacks surface and Air targets.\",\"cost\":55,\"maxHealth\":60,\"moveSpeed\":15,\"damage\":15,\"fireRate\":1,\"dps\":30,\"max_range\":80,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"attack_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_attack_vehicle.png\"},\"/pa/units/sea/torpedo_launcher_adv/torpedo_launcher_adv.json\":{\"name\":\"Advanced Torpedo Launcher\",\"desc\":\"Torpedo Launcher - Advanced anti-ship defense.\",\"cost\":1000,\"maxHealth\":4000,\"damage\":250,\"fireRate\":2,\"dps\":500,\"max_range\":210,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"torpedo_launcher_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_torpedo_launcher_adv.png\"},\"/pa/units/sea/torpedo_launcher_adv/torpedo_launcher_adv.json.player\":{\"name\":\"Advanced Torpedo Launcher\",\"desc\":\"Torpedo Launcher - Advanced anti-ship defense.\",\"cost\":1000,\"maxHealth\":4000,\"damage\":250,\"fireRate\":2,\"dps\":500,\"max_range\":210,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"torpedo_launcher_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_torpedo_launcher_adv.png\"},\"/pa/units/sea/torpedo_launcher_adv/torpedo_launcher_adv.json.ai\":{\"name\":\"Advanced Torpedo Launcher\",\"desc\":\"Torpedo Launcher - Advanced anti-ship defense.\",\"cost\":1000,\"maxHealth\":4000,\"damage\":250,\"fireRate\":2,\"dps\":500,\"max_range\":210,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"torpedo_launcher_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_torpedo_launcher_adv.png\"},\"/pa/units/land/fabrication_bot/fabrication_bot.json\":{\"name\":\"Fabrication Bot\",\"desc\":\"Basic Fabricator - Build basic structures.\",\"cost\":150,\"maxHealth\":50,\"moveSpeed\":16,\"build_arm\":{\"metal\":7,\"energy\":525},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot.png\"},\"/pa/units/land/fabrication_bot/fabrication_bot.json.player\":{\"name\":\"Fabrication Bot\",\"desc\":\"Basic Fabricator - Build basic structures.\",\"cost\":150,\"maxHealth\":50,\"moveSpeed\":16,\"build_arm\":{\"metal\":7,\"energy\":525},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot.png\"},\"/pa/units/land/fabrication_bot/fabrication_bot.json.ai\":{\"name\":\"Fabrication Bot\",\"desc\":\"Basic Fabricator - Build basic structures.\",\"cost\":150,\"maxHealth\":50,\"moveSpeed\":16,\"build_arm\":{\"metal\":7,\"energy\":525},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot.png\"},\"/pa/units/land/bot_spider_adv/bot_spider_adv.json\":{\"name\":\"Recluse\",\"desc\":\"All Terrain Bot - Can crawl almost anywhere.\",\"cost\":1080,\"maxHealth\":400,\"moveSpeed\":10,\"damage\":65,\"fireRate\":2,\"dps\":130,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_spider_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_spider_adv.png\"},\"/pa/units/land/bot_spider_adv/bot_spider_adv.json.player\":{\"name\":\"Recluse\",\"desc\":\"All Terrain Bot - Can crawl almost anywhere.\",\"cost\":1080,\"maxHealth\":400,\"moveSpeed\":10,\"damage\":65,\"fireRate\":2,\"dps\":130,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_spider_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_spider_adv.png\"},\"/pa/units/land/bot_spider_adv/bot_spider_adv.json.ai\":{\"name\":\"Recluse\",\"desc\":\"All Terrain Bot - Can crawl almost anywhere.\",\"cost\":1080,\"maxHealth\":400,\"moveSpeed\":10,\"damage\":65,\"fireRate\":2,\"dps\":130,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_spider_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_spider_adv.png\"},\"/pa/units/land/bot_tactical_missile/bot_tactical_missile.json\":{\"name\":\"Bluehawk\",\"desc\":\"Mobile Tactical Missile - Long range with heavy damage. Fires homing missiles. Attacks land, sea and orbital targets.\",\"cost\":700,\"maxHealth\":800,\"moveSpeed\":12,\"damage\":300,\"fireRate\":0.30000001192092896,\"dps\":90,\"max_range\":200,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_tactical_missile\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_tactical_missile.png\"},\"/pa/units/land/bot_tactical_missile/bot_tactical_missile.json.player\":{\"name\":\"Bluehawk\",\"desc\":\"Mobile Tactical Missile - Long range with heavy damage. Fires homing missiles. Attacks land, sea and orbital targets.\",\"cost\":700,\"maxHealth\":800,\"moveSpeed\":12,\"damage\":300,\"fireRate\":0.30000001192092896,\"dps\":90,\"max_range\":200,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_tactical_missile\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_tactical_missile.png\"},\"/pa/units/land/bot_tactical_missile/bot_tactical_missile.json.ai\":{\"name\":\"Bluehawk\",\"desc\":\"Mobile Tactical Missile - Long range with heavy damage. Fires homing missiles. Attacks land, sea and orbital targets.\",\"cost\":700,\"maxHealth\":800,\"moveSpeed\":12,\"damage\":300,\"fireRate\":0.30000001192092896,\"dps\":90,\"max_range\":200,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_tactical_missile\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_tactical_missile.png\"},\"/pa/units/land/control_module/control_module.json\":{\"name\":\"Catalyst\",\"desc\":\"Super Weapon - Build five on a metal planet to activate the Annihilazer.\",\"cost\":40000,\"maxHealth\":20000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"control_module\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_control_module.png\"},\"/pa/units/land/control_module/control_module.json.player\":{\"name\":\"Catalyst\",\"desc\":\"Super Weapon - Build five on a metal planet to activate the Annihilazer.\",\"cost\":40000,\"maxHealth\":20000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"control_module\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_control_module.png\"},\"/pa/units/land/control_module/control_module.json.ai\":{\"name\":\"Catalyst\",\"desc\":\"Super Weapon - Build five on a metal planet to activate the Annihilazer.\",\"cost\":40000,\"maxHealth\":20000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"control_module\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_control_module.png\"},\"/pa/units/land/energy_plant/energy_plant.json\":{\"name\":\"Energy Plant\",\"desc\":\"Basic Economy - Produces energy.\",\"cost\":400,\"maxHealth\":1000,\"production\":{\"metal\":0,\"energy\":600},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"energy_plant\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_energy_plant.png\"},\"/pa/units/land/energy_plant/energy_plant.json.player\":{\"name\":\"Energy Plant\",\"desc\":\"Basic Economy - Produces energy.\",\"cost\":400,\"maxHealth\":1000,\"production\":{\"metal\":0,\"energy\":600},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"energy_plant\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_energy_plant.png\"},\"/pa/units/land/energy_plant/energy_plant.json.ai\":{\"name\":\"Energy Plant\",\"desc\":\"Basic Economy - Produces energy.\",\"cost\":400,\"maxHealth\":1000,\"production\":{\"metal\":0,\"energy\":600},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"energy_plant\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_energy_plant.png\"},\"/pa/units/land/energy_plant_adv/energy_plant_adv.json\":{\"name\":\"Advanced Energy Plant\",\"desc\":\"Advanced Economy - Produces energy.\",\"cost\":2800,\"maxHealth\":3000,\"production\":{\"metal\":0,\"energy\":6000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"energy_plant_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_energy_plant_adv.png\"},\"/pa/units/land/energy_plant_adv/energy_plant_adv.json.player\":{\"name\":\"Advanced Energy Plant\",\"desc\":\"Advanced Economy - Produces energy.\",\"cost\":2800,\"maxHealth\":3000,\"production\":{\"metal\":0,\"energy\":6000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"energy_plant_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_energy_plant_adv.png\"},\"/pa/units/land/energy_plant_adv/energy_plant_adv.json.ai\":{\"name\":\"Advanced Energy Plant\",\"desc\":\"Advanced Economy - Produces energy.\",\"cost\":2800,\"maxHealth\":3000,\"production\":{\"metal\":0,\"energy\":6000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"energy_plant_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_energy_plant_adv.png\"},\"/pa/units/land/fabrication_bot_adv/fabrication_bot_adv.json\":{\"name\":\"Advanced Fabrication Bot\",\"desc\":\"Advanced Fabricator - Build basic and advanced structures.\",\"cost\":1800,\"maxHealth\":150,\"moveSpeed\":16,\"build_arm\":{\"metal\":45,\"energy\":1800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot_adv.png\"},\"/pa/units/land/fabrication_bot_adv/fabrication_bot_adv.json.player\":{\"name\":\"Advanced Fabrication Bot\",\"desc\":\"Advanced Fabricator - Build basic and advanced structures.\",\"cost\":1800,\"maxHealth\":150,\"moveSpeed\":16,\"build_arm\":{\"metal\":45,\"energy\":1800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot_adv.png\"},\"/pa/units/land/fabrication_bot_adv/fabrication_bot_adv.json.ai\":{\"name\":\"Advanced Fabrication Bot\",\"desc\":\"Advanced Fabricator - Build basic and advanced structures.\",\"cost\":1800,\"maxHealth\":150,\"moveSpeed\":16,\"build_arm\":{\"metal\":45,\"energy\":1800},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot_adv.png\"},\"/pa/units/land/fabrication_bot_combat/fabrication_bot_combat.json\":{\"name\":\"Stitch\",\"desc\":\"Combat Fabricator - Repairs damaged units. Can build and detect mines. Can build teleporters. Can't help build other structures.\",\"cost\":250,\"maxHealth\":50,\"moveSpeed\":12,\"max_range\":60,\"build_arm\":{\"metal\":30,\"energy\":400},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot_combat\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot_combat.png\"},\"/pa/units/land/fabrication_bot_combat/fabrication_bot_combat.json.player\":{\"name\":\"Stitch\",\"desc\":\"Combat Fabricator - Repairs damaged units. Can build and detect mines. Can build teleporters. Can't help build other structures.\",\"cost\":250,\"maxHealth\":50,\"moveSpeed\":12,\"max_range\":60,\"build_arm\":{\"metal\":30,\"energy\":400},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot_combat\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot_combat.png\"},\"/pa/units/land/fabrication_bot_combat/fabrication_bot_combat.json.ai\":{\"name\":\"Stitch\",\"desc\":\"Combat Fabricator - Repairs damaged units. Can build and detect mines. Can build teleporters. Can't help build other structures.\",\"cost\":250,\"maxHealth\":50,\"moveSpeed\":12,\"max_range\":60,\"build_arm\":{\"metal\":30,\"energy\":400},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_bot_combat\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_bot_combat.png\"},\"/pa/units/land/fabrication_vehicle/fabrication_vehicle.json\":{\"name\":\"Fabrication Vehicle\",\"desc\":\"Basic Fabricator - Builds basic structures. Durable. More powerful than other fabricators.\",\"cost\":200,\"maxHealth\":150,\"moveSpeed\":12,\"build_arm\":{\"metal\":11,\"energy\":700},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_vehicle.png\"},\"/pa/units/land/fabrication_vehicle/fabrication_vehicle.json.player\":{\"name\":\"Fabrication Vehicle\",\"desc\":\"Basic Fabricator - Builds basic structures. Durable. More powerful than other fabricators.\",\"cost\":200,\"maxHealth\":150,\"moveSpeed\":12,\"build_arm\":{\"metal\":11,\"energy\":700},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_vehicle.png\"},\"/pa/units/land/fabrication_vehicle/fabrication_vehicle.json.ai\":{\"name\":\"Fabrication Vehicle\",\"desc\":\"Basic Fabricator - Builds basic structures. Durable. More powerful than other fabricators.\",\"cost\":200,\"maxHealth\":150,\"moveSpeed\":12,\"build_arm\":{\"metal\":11,\"energy\":700},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_vehicle.png\"},\"/pa/units/land/artillery_unit_launcher/artillery_unit_launcher.json\":{\"name\":\"Lob\",\"desc\":\"Dox Launcher - Builds and fires Dox at nearby targets.\",\"cost\":1200,\"maxHealth\":1000,\"damage\":0,\"fireRate\":4.5,\"dps\":0,\"max_range\":240,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"metal\",\"ammo_capacity\":432,\"ammo_demand\":13,\"ammo_per_shot\":50},\"sicon\":\"artillery_unit_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_artillery_unit_launcher.png\"},\"/pa/units/land/artillery_unit_launcher/artillery_unit_launcher.json.player\":{\"name\":\"Lob\",\"desc\":\"Dox Launcher - Builds and fires Dox at nearby targets.\",\"cost\":1200,\"maxHealth\":1000,\"damage\":0,\"fireRate\":4.5,\"dps\":0,\"max_range\":240,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"metal\",\"ammo_capacity\":432,\"ammo_demand\":13,\"ammo_per_shot\":50},\"sicon\":\"artillery_unit_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_artillery_unit_launcher.png\"},\"/pa/units/land/artillery_unit_launcher/artillery_unit_launcher.json.ai\":{\"name\":\"Lob\",\"desc\":\"Dox Launcher - Builds and fires Dox at nearby targets.\",\"cost\":1200,\"maxHealth\":1000,\"damage\":0,\"fireRate\":4.5,\"dps\":0,\"max_range\":240,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"metal\",\"ammo_capacity\":432,\"ammo_demand\":13,\"ammo_per_shot\":50},\"sicon\":\"artillery_unit_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_artillery_unit_launcher.png\"},\"/pa/units/land/fabrication_vehicle_adv/fabrication_vehicle_adv.json\":{\"name\":\"Advanced Fabrication Vehicle\",\"desc\":\"Advanced Fabricator - Builds basic and advanced structures. Durable. More powerful than other fabricators.\",\"cost\":2025,\"maxHealth\":400,\"moveSpeed\":12,\"build_arm\":{\"metal\":60,\"energy\":2250},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_vehicle_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_vehicle_adv.png\"},\"/pa/units/land/fabrication_vehicle_adv/fabrication_vehicle_adv.json.player\":{\"name\":\"Advanced Fabrication Vehicle\",\"desc\":\"Advanced Fabricator - Builds basic and advanced structures. Durable. More powerful than other fabricators.\",\"cost\":2025,\"maxHealth\":400,\"moveSpeed\":12,\"build_arm\":{\"metal\":60,\"energy\":2250},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_vehicle_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_vehicle_adv.png\"},\"/pa/units/land/fabrication_vehicle_adv/fabrication_vehicle_adv.json.ai\":{\"name\":\"Advanced Fabrication Vehicle\",\"desc\":\"Advanced Fabricator - Builds basic and advanced structures. Durable. More powerful than other fabricators.\",\"cost\":2025,\"maxHealth\":400,\"moveSpeed\":12,\"build_arm\":{\"metal\":60,\"energy\":2250},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_vehicle_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_vehicle_adv.png\"},\"/pa/units/land/land_scout/land_scout.json\":{\"name\":\"Skitter\",\"desc\":\"Scout - Fast. Can see far away and detects mines. Does not attack.\",\"cost\":75,\"maxHealth\":10,\"moveSpeed\":25,\"damage\":0,\"fireRate\":-1,\"dps\":0,\"max_range\":115,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"land_scout\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_land_scout.png\"},\"/pa/units/land/land_scout/land_scout.json.player\":{\"name\":\"Skitter\",\"desc\":\"Scout - Fast. Can see far away and detects mines. Does not attack.\",\"cost\":75,\"maxHealth\":10,\"moveSpeed\":25,\"damage\":0,\"fireRate\":-1,\"dps\":0,\"max_range\":115,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"land_scout\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_land_scout.png\"},\"/pa/units/land/land_scout/land_scout.json.ai\":{\"name\":\"Skitter\",\"desc\":\"Scout - Fast. Can see far away and detects mines. Does not attack.\",\"cost\":75,\"maxHealth\":10,\"moveSpeed\":25,\"damage\":0,\"fireRate\":-1,\"dps\":0,\"max_range\":115,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"land_scout\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_land_scout.png\"},\"/pa/units/land/titan_bot/titan_bot.json\":{\"name\":\"Atlas\",\"desc\":\"Seismic Titan - Devastating damage to everything nearby. Amphibious. Attacks land, sea, and undersea targets.\",\"cost\":30000,\"maxHealth\":60000,\"moveSpeed\":13,\"damage\":8000,\"fireRate\":0.20000000298023224,\"dps\":1600,\"max_range\":135,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_bot.png\"},\"/pa/units/land/titan_bot/titan_bot.json.player\":{\"name\":\"Atlas\",\"desc\":\"Seismic Titan - Devastating damage to everything nearby. Amphibious. Attacks land, sea, and undersea targets.\",\"cost\":30000,\"maxHealth\":60000,\"moveSpeed\":13,\"damage\":8000,\"fireRate\":0.20000000298023224,\"dps\":1600,\"max_range\":135,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_bot.png\"},\"/pa/units/land/titan_bot/titan_bot.json.ai\":{\"name\":\"Atlas\",\"desc\":\"Seismic Titan - Devastating damage to everything nearby. Amphibious. Attacks land, sea, and undersea targets.\",\"cost\":30000,\"maxHealth\":60000,\"moveSpeed\":13,\"damage\":8000,\"fireRate\":0.20000000298023224,\"dps\":1600,\"max_range\":135,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_bot.png\"},\"/pa/units/land/tank_light_laser/tank_light_laser.json\":{\"name\":\"Ant\",\"desc\":\"Light Tank - Well-rounded. Reliable. Attacks land and sea targets.\",\"cost\":150,\"maxHealth\":250,\"moveSpeed\":10,\"damage\":84,\"fireRate\":0.550000011920929,\"dps\":46.20000076293945,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_light_laser\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_light_laser.png\"},\"/pa/units/land/tank_light_laser/tank_light_laser.json.player\":{\"name\":\"Ant\",\"desc\":\"Light Tank - Well-rounded. Reliable. Attacks land and sea targets.\",\"cost\":150,\"maxHealth\":250,\"moveSpeed\":10,\"damage\":84,\"fireRate\":0.550000011920929,\"dps\":46.20000076293945,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_light_laser\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_light_laser.png\"},\"/pa/units/land/tank_light_laser/tank_light_laser.json.ai\":{\"name\":\"Ant\",\"desc\":\"Light Tank - Well-rounded. Reliable. Attacks land and sea targets.\",\"cost\":150,\"maxHealth\":250,\"moveSpeed\":10,\"damage\":84,\"fireRate\":0.550000011920929,\"dps\":46.20000076293945,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_light_laser\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_light_laser.png\"},\"/pa/units/land/metal_extractor_adv/metal_extractor_adv.json\":{\"name\":\"Advanced Metal Extractor\",\"desc\":\"Advanced Economy - Produces metal, can only be placed on metal deposits.\",\"cost\":1800,\"maxHealth\":3000,\"production\":{\"metal\":18,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"metal_extractor_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_metal_extractor_adv.png\"},\"/pa/units/land/metal_extractor_adv/metal_extractor_adv.json.player\":{\"name\":\"Advanced Metal Extractor\",\"desc\":\"Advanced Economy - Produces metal, can only be placed on metal deposits.\",\"cost\":1800,\"maxHealth\":3000,\"production\":{\"metal\":18,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"metal_extractor_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_metal_extractor_adv.png\"},\"/pa/units/land/metal_extractor_adv/metal_extractor_adv.json.ai\":{\"name\":\"Advanced Metal Extractor\",\"desc\":\"Advanced Economy - Produces metal, can only be placed on metal deposits.\",\"cost\":1800,\"maxHealth\":3000,\"production\":{\"metal\":18,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"metal_extractor_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_metal_extractor_adv.png\"},\"/pa/units/land/laser_defense/laser_defense.json\":{\"name\":\"Laser Defense Tower\",\"desc\":\"Basic Turret - Equipped with direct fire anti-land, and anti-ship defenses.\",\"cost\":350,\"maxHealth\":1500,\"damage\":75,\"fireRate\":2,\"dps\":150,\"max_range\":110,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"laser_defense\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_laser_defense.png\"},\"/pa/units/land/laser_defense/laser_defense.json.player\":{\"name\":\"Laser Defense Tower\",\"desc\":\"Basic Turret - Equipped with direct fire anti-land, and anti-ship defenses.\",\"cost\":350,\"maxHealth\":1500,\"damage\":75,\"fireRate\":2,\"dps\":150,\"max_range\":110,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"laser_defense\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_laser_defense.png\"},\"/pa/units/land/laser_defense/laser_defense.json.ai\":{\"name\":\"Laser Defense Tower\",\"desc\":\"Basic Turret - Equipped with direct fire anti-land, and anti-ship defenses.\",\"cost\":350,\"maxHealth\":1500,\"damage\":75,\"fireRate\":2,\"dps\":150,\"max_range\":110,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"laser_defense\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_laser_defense.png\"},\"/pa/units/land/laser_defense_adv/laser_defense_adv.json\":{\"name\":\"Advanced Laser Defense Tower\",\"desc\":\"Advanced Turret - Equipped with direct fire anti-land, and anti-ship defenses.\",\"cost\":900,\"maxHealth\":4000,\"damage\":250,\"fireRate\":3,\"dps\":750,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"laser_defense_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_laser_defense_adv.png\"},\"/pa/units/land/laser_defense_adv/laser_defense_adv.json.player\":{\"name\":\"Advanced Laser Defense Tower\",\"desc\":\"Advanced Turret - Equipped with direct fire anti-land, and anti-ship defenses.\",\"cost\":900,\"maxHealth\":4000,\"damage\":250,\"fireRate\":3,\"dps\":750,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"laser_defense_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_laser_defense_adv.png\"},\"/pa/units/land/laser_defense_adv/laser_defense_adv.json.ai\":{\"name\":\"Advanced Laser Defense Tower\",\"desc\":\"Advanced Turret - Equipped with direct fire anti-land, and anti-ship defenses.\",\"cost\":900,\"maxHealth\":4000,\"damage\":250,\"fireRate\":3,\"dps\":750,\"max_range\":120,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"laser_defense_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_laser_defense_adv.png\"},\"/pa/units/land/laser_defense_single/laser_defense_single.json\":{\"name\":\"Single Laser Defense Tower\",\"desc\":\"Basic Turret - Equipped with direct fire anti-land, and anti-ship defenses.\",\"cost\":225,\"maxHealth\":400,\"damage\":60,\"fireRate\":2,\"dps\":120,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"laser_defense_single\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_laser_defense_single.png\"},\"/pa/units/land/laser_defense_single/laser_defense_single.json.player\":{\"name\":\"Single Laser Defense Tower\",\"desc\":\"Basic Turret - Equipped with direct fire anti-land, and anti-ship defenses.\",\"cost\":225,\"maxHealth\":400,\"damage\":60,\"fireRate\":2,\"dps\":120,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"laser_defense_single\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_laser_defense_single.png\"},\"/pa/units/land/laser_defense_single/laser_defense_single.json.ai\":{\"name\":\"Single Laser Defense Tower\",\"desc\":\"Basic Turret - Equipped with direct fire anti-land, and anti-ship defenses.\",\"cost\":225,\"maxHealth\":400,\"damage\":60,\"fireRate\":2,\"dps\":120,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"laser_defense_single\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_laser_defense_single.png\"},\"/pa/units/land/metal_extractor/metal_extractor.json\":{\"name\":\"Metal Extractor\",\"desc\":\"Basic Economy - Produces metal, can only be placed on metal deposits.\",\"cost\":170,\"maxHealth\":1000,\"production\":{\"metal\":7,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"metal_extractor\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_metal_extractor.png\"},\"/pa/units/land/metal_extractor/metal_extractor.json.player\":{\"name\":\"Metal Extractor\",\"desc\":\"Basic Economy - Produces metal, can only be placed on metal deposits.\",\"cost\":170,\"maxHealth\":1000,\"production\":{\"metal\":7,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"metal_extractor\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_metal_extractor.png\"},\"/pa/units/land/metal_extractor/metal_extractor.json.ai\":{\"name\":\"Metal Extractor\",\"desc\":\"Basic Economy - Produces metal, can only be placed on metal deposits.\",\"cost\":170,\"maxHealth\":1000,\"production\":{\"metal\":7,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"metal_extractor\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_metal_extractor.png\"},\"/pa/units/land/metal_storage/metal_storage.json\":{\"name\":\"Metal Storage\",\"desc\":\"Storage - Increases maximum metal storage capacity.\",\"cost\":450,\"maxHealth\":3500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":20000,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"metal_storage\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_metal_storage.png\"},\"/pa/units/land/metal_storage/metal_storage.json.player\":{\"name\":\"Metal Storage\",\"desc\":\"Storage - Increases maximum metal storage capacity.\",\"cost\":450,\"maxHealth\":3500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":20000,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"metal_storage\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_metal_storage.png\"},\"/pa/units/land/metal_storage/metal_storage.json.ai\":{\"name\":\"Metal Storage\",\"desc\":\"Storage - Increases maximum metal storage capacity.\",\"cost\":450,\"maxHealth\":3500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":20000,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"metal_storage\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_metal_storage.png\"},\"/pa/units/sea/torpedo_launcher/torpedo_launcher.json\":{\"name\":\"Torpedo Launcher\",\"desc\":\"Torpedo Launcher - Basic anti-ship defense.\",\"cost\":350,\"maxHealth\":2000,\"damage\":250,\"fireRate\":0.6000000238418579,\"dps\":150,\"max_range\":200,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"torpedo_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_torpedo_launcher.png\"},\"/pa/units/sea/torpedo_launcher/torpedo_launcher.json.player\":{\"name\":\"Torpedo Launcher\",\"desc\":\"Torpedo Launcher - Basic anti-ship defense.\",\"cost\":350,\"maxHealth\":2000,\"damage\":250,\"fireRate\":0.6000000238418579,\"dps\":150,\"max_range\":200,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"torpedo_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_torpedo_launcher.png\"},\"/pa/units/sea/torpedo_launcher/torpedo_launcher.json.ai\":{\"name\":\"Torpedo Launcher\",\"desc\":\"Torpedo Launcher - Basic anti-ship defense.\",\"cost\":350,\"maxHealth\":2000,\"damage\":250,\"fireRate\":0.6000000238418579,\"dps\":150,\"max_range\":200,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"torpedo_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_torpedo_launcher.png\"},\"/pa/units/land/nuke_launcher/nuke_launcher.json\":{\"name\":\"Nuclear Missile Launcher\",\"desc\":\"Nuclear Missile Launcher - Builds interplanetary long range nuclear missile with large area damage.\",\"cost\":14400,\"maxHealth\":1500,\"damage\":33000,\"fireRate\":1,\"dps\":33000,\"max_range\":5000,\"build_arm\":{\"metal\":90,\"energy\":6000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"nuke_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_nuke_launcher.png\"},\"/pa/units/land/nuke_launcher/nuke_launcher.json.player\":{\"name\":\"Nuclear Missile Launcher\",\"desc\":\"Nuclear Missile Launcher - Builds interplanetary long range nuclear missile with large area damage.\",\"cost\":14400,\"maxHealth\":1500,\"damage\":33000,\"fireRate\":1,\"dps\":33000,\"max_range\":5000,\"build_arm\":{\"metal\":90,\"energy\":6000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"nuke_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_nuke_launcher.png\"},\"/pa/units/land/nuke_launcher/nuke_launcher.json.ai\":{\"name\":\"Nuclear Missile Launcher\",\"desc\":\"Nuclear Missile Launcher - Builds interplanetary long range nuclear missile with large area damage.\",\"cost\":14400,\"maxHealth\":1500,\"damage\":33000,\"fireRate\":1,\"dps\":33000,\"max_range\":5000,\"build_arm\":{\"metal\":90,\"energy\":6000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"nuke_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_nuke_launcher.png\"},\"/pa/units/land/nuke_launcher/nuke_launcher_ammo.json\":{\"name\":\"LR-96 Pacifier Nuclear Missile\",\"desc\":\"Nuclear missile - Long range interplanetary, large area damage, projectile\",\"cost\":30000,\"damage\":33000,\"energy_weapon\":null,\"sicon\":\"nuke_launcher_ammo\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_nuke_launcher_ammo.png\"},\"/pa/units/land/nuke_launcher/nuke_launcher_ammo.json.player\":{\"name\":\"LR-96 Pacifier Nuclear Missile\",\"desc\":\"Nuclear missile - Long range interplanetary, large area damage, projectile\",\"cost\":30000,\"damage\":33000,\"energy_weapon\":null,\"sicon\":\"nuke_launcher_ammo\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_nuke_launcher_ammo.png\"},\"/pa/units/land/nuke_launcher/nuke_launcher_ammo.json.ai\":{\"name\":\"LR-96 Pacifier Nuclear Missile\",\"desc\":\"Nuclear missile - Long range interplanetary, large area damage, projectile\",\"cost\":30000,\"damage\":33000,\"energy_weapon\":null,\"sicon\":\"nuke_launcher_ammo\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_nuke_launcher_ammo.png\"},\"/pa/units/land/radar/radar.json\":{\"name\":\"Radar\",\"desc\":\"Basic radar - Detects nearby enemy land, sea, and air units.\",\"cost\":200,\"maxHealth\":500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":150},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar.png\"},\"/pa/units/land/radar/radar.json.player\":{\"name\":\"Radar\",\"desc\":\"Basic radar - Detects nearby enemy land, sea, and air units.\",\"cost\":200,\"maxHealth\":500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":150},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar.png\"},\"/pa/units/land/radar/radar.json.ai\":{\"name\":\"Radar\",\"desc\":\"Basic radar - Detects nearby enemy land, sea, and air units.\",\"cost\":200,\"maxHealth\":500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":150},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar.png\"},\"/pa/units/land/radar_adv/radar_adv.json\":{\"name\":\"Advanced Radar\",\"desc\":\"Advanced Radar - Detects nearby enemy land, sea, and air units.\",\"cost\":2400,\"maxHealth\":1500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":4000},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_adv.png\"},\"/pa/units/land/radar_adv/radar_adv.json.player\":{\"name\":\"Advanced Radar\",\"desc\":\"Advanced Radar - Detects nearby enemy land, sea, and air units.\",\"cost\":2400,\"maxHealth\":1500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":4000},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_adv.png\"},\"/pa/units/land/radar_adv/radar_adv.json.ai\":{\"name\":\"Advanced Radar\",\"desc\":\"Advanced Radar - Detects nearby enemy land, sea, and air units.\",\"cost\":2400,\"maxHealth\":1500,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":4000},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_adv.png\"},\"/pa/units/land/tactical_missile_launcher/tactical_missile_launcher.json\":{\"name\":\"Catapult\",\"desc\":\"Tactical Missile Launcher - Long range with very heavy damage. Attacks land, sea, and orbital targets.\",\"cost\":2000,\"maxHealth\":1500,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":280,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tactical_missile_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tactical_missile_launcher.png\"},\"/pa/units/land/tactical_missile_launcher/tactical_missile_launcher.json.player\":{\"name\":\"Catapult\",\"desc\":\"Tactical Missile Launcher - Long range with very heavy damage. Attacks land, sea, and orbital targets.\",\"cost\":2000,\"maxHealth\":1500,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":280,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tactical_missile_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tactical_missile_launcher.png\"},\"/pa/units/land/tactical_missile_launcher/tactical_missile_launcher.json.ai\":{\"name\":\"Catapult\",\"desc\":\"Tactical Missile Launcher - Long range with very heavy damage. Attacks land, sea, and orbital targets.\",\"cost\":2000,\"maxHealth\":1500,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":280,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tactical_missile_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tactical_missile_launcher.png\"},\"/pa/units/land/tank_heavy_mortar/tank_heavy_mortar.json\":{\"name\":\"Sheller\",\"desc\":\"Mortar tank - Advanced long range mobile artillery.\",\"cost\":1200,\"maxHealth\":125,\"moveSpeed\":10,\"damage\":400,\"fireRate\":0.25,\"dps\":100,\"max_range\":260,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_heavy_mortar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_heavy_mortar.png\"},\"/pa/units/land/tank_heavy_mortar/tank_heavy_mortar.json.player\":{\"name\":\"Sheller\",\"desc\":\"Mortar tank - Advanced long range mobile artillery.\",\"cost\":1200,\"maxHealth\":125,\"moveSpeed\":10,\"damage\":400,\"fireRate\":0.25,\"dps\":100,\"max_range\":260,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_heavy_mortar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_heavy_mortar.png\"},\"/pa/units/land/tank_heavy_mortar/tank_heavy_mortar.json.ai\":{\"name\":\"Sheller\",\"desc\":\"Mortar tank - Advanced long range mobile artillery.\",\"cost\":1200,\"maxHealth\":125,\"moveSpeed\":10,\"damage\":400,\"fireRate\":0.25,\"dps\":100,\"max_range\":260,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_heavy_mortar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_heavy_mortar.png\"},\"/pa/units/land/unit_cannon/unit_cannon.json\":{\"name\":\"Unit Cannon\",\"desc\":\"Interplanetary Transport - Builds and launches up to 16 units at once anywhere in the system.\",\"cost\":5600,\"maxHealth\":18000,\"damage\":0,\"fireRate\":3,\"dps\":0,\"max_range\":5000,\"build_arm\":{\"metal\":45,\"energy\":2250},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"unit_cannon\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_unit_cannon.png\"},\"/pa/units/land/unit_cannon/unit_cannon.json.player\":{\"name\":\"Unit Cannon\",\"desc\":\"Interplanetary Transport - Builds and launches up to 16 units at once anywhere in the system.\",\"cost\":5600,\"maxHealth\":18000,\"damage\":0,\"fireRate\":3,\"dps\":0,\"max_range\":5000,\"build_arm\":{\"metal\":45,\"energy\":2250},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"unit_cannon\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_unit_cannon.png\"},\"/pa/units/land/unit_cannon/unit_cannon.json.ai\":{\"name\":\"Unit Cannon\",\"desc\":\"Interplanetary Transport - Builds and launches up to 16 units at once anywhere in the system.\",\"cost\":5600,\"maxHealth\":18000,\"damage\":0,\"fireRate\":3,\"dps\":0,\"max_range\":5000,\"build_arm\":{\"metal\":45,\"energy\":2250},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"unit_cannon\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_unit_cannon.png\"},\"/pa/units/land/vehicle_factory_adv/vehicle_factory_adv.json\":{\"name\":\"Advanced Vehicle Factory\",\"desc\":\"Advanced Manufacturing - Builds basic and advanced land vehicles.\",\"cost\":4800,\"maxHealth\":30000,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"vehicle_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_vehicle_factory_adv.png\"},\"/pa/units/land/vehicle_factory_adv/vehicle_factory_adv.json.player\":{\"name\":\"Advanced Vehicle Factory\",\"desc\":\"Advanced Manufacturing - Builds basic and advanced land vehicles.\",\"cost\":4800,\"maxHealth\":30000,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"vehicle_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_vehicle_factory_adv.png\"},\"/pa/units/land/vehicle_factory_adv/vehicle_factory_adv.json.ai\":{\"name\":\"Advanced Vehicle Factory\",\"desc\":\"Advanced Manufacturing - Builds basic and advanced land vehicles.\",\"cost\":4800,\"maxHealth\":30000,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"vehicle_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_vehicle_factory_adv.png\"},\"/pa/units/orbital/base_orbital_structure/base_orbital_structure.json\":{\"name\":\"Base Orbital Structure\",\"desc\":\"Base Orbital Structure Description - If you're seeing this, something is wrong in your structure.\",\"cost\":1,\"maxHealth\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_orbital_structure\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_orbital_structure.png\"},\"/pa/units/orbital/base_orbital_structure/base_orbital_structure.json.player\":{\"name\":\"Base Orbital Structure\",\"desc\":\"Base Orbital Structure Description - If you're seeing this, something is wrong in your structure.\",\"cost\":1,\"maxHealth\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_orbital_structure\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_orbital_structure.png\"},\"/pa/units/orbital/base_orbital_structure/base_orbital_structure.json.ai\":{\"name\":\"Base Orbital Structure\",\"desc\":\"Base Orbital Structure Description - If you're seeing this, something is wrong in your structure.\",\"cost\":1,\"maxHealth\":1,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_orbital_structure\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_orbital_structure.png\"},\"/pa/units/orbital/deep_space_radar/deep_space_radar.json\":{\"name\":\"Orbital and Deepspace Radar\",\"desc\":\"Orbital and Deepspace Radar - Orbital and celestial radar telemetry.\",\"cost\":600,\"maxHealth\":750,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":150},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"deep_space_radar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_deep_space_radar.png\"},\"/pa/units/orbital/deep_space_radar/deep_space_radar.json.player\":{\"name\":\"Orbital and Deepspace Radar\",\"desc\":\"Orbital and Deepspace Radar - Orbital and celestial radar telemetry.\",\"cost\":600,\"maxHealth\":750,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":150},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"deep_space_radar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_deep_space_radar.png\"},\"/pa/units/orbital/deep_space_radar/deep_space_radar.json.ai\":{\"name\":\"Orbital and Deepspace Radar\",\"desc\":\"Orbital and Deepspace Radar - Orbital and celestial radar telemetry.\",\"cost\":600,\"maxHealth\":750,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":150},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"deep_space_radar\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_deep_space_radar.png\"},\"/pa/units/orbital/defense_satellite/defense_satellite.json\":{\"name\":\"Anchor\",\"desc\":\"Defense Satellite - Heavy orbital offensive and defensive platform with basic laser.\",\"cost\":1500,\"maxHealth\":2000,\"damage\":100,\"fireRate\":1.5,\"dps\":150,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"defense_satellite\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_defense_satellite.png\"},\"/pa/units/orbital/defense_satellite/defense_satellite.json.player\":{\"name\":\"Anchor\",\"desc\":\"Defense Satellite - Heavy orbital offensive and defensive platform with basic laser.\",\"cost\":1500,\"maxHealth\":2000,\"damage\":100,\"fireRate\":1.5,\"dps\":150,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"defense_satellite\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_defense_satellite.png\"},\"/pa/units/orbital/defense_satellite/defense_satellite.json.ai\":{\"name\":\"Anchor\",\"desc\":\"Defense Satellite - Heavy orbital offensive and defensive platform with basic laser.\",\"cost\":1500,\"maxHealth\":2000,\"damage\":100,\"fireRate\":1.5,\"dps\":150,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"defense_satellite\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_defense_satellite.png\"},\"/pa/units/orbital/ion_defense/ion_defense.json\":{\"name\":\"Umbrella\",\"desc\":\"Anti-Orbital Defense - Rapid fire with high damage. Attacks orbital targets and intercepts drop pods.\",\"cost\":900,\"maxHealth\":900,\"damage\":100,\"fireRate\":2,\"dps\":200,\"max_range\":300,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"ion_defense\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_ion_defense.png\"},\"/pa/units/orbital/ion_defense/ion_defense.json.player\":{\"name\":\"Umbrella\",\"desc\":\"Anti-Orbital Defense - Rapid fire with high damage. Attacks orbital targets and intercepts drop pods.\",\"cost\":900,\"maxHealth\":900,\"damage\":100,\"fireRate\":2,\"dps\":200,\"max_range\":300,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"ion_defense\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_ion_defense.png\"},\"/pa/units/orbital/ion_defense/ion_defense.json.ai\":{\"name\":\"Umbrella\",\"desc\":\"Anti-Orbital Defense - Rapid fire with high damage. Attacks orbital targets and intercepts drop pods.\",\"cost\":900,\"maxHealth\":900,\"damage\":100,\"fireRate\":2,\"dps\":200,\"max_range\":300,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"ion_defense\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_ion_defense.png\"},\"/pa/units/sea/drone_carrier/drone/drone.json\":{\"name\":\"Squall\",\"desc\":\"Missile and Torpedo Drone - Fast, fragile, attacks sea and air.\",\"cost\":30,\"maxHealth\":40,\"moveSpeed\":40,\"damage\":75,\"fireRate\":0.800000011920929,\"dps\":60,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"drone\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_drone.png\"},\"/pa/units/sea/drone_carrier/drone/drone.json.player\":{\"name\":\"Squall\",\"desc\":\"Missile and Torpedo Drone - Fast, fragile, attacks sea and air.\",\"cost\":30,\"maxHealth\":40,\"moveSpeed\":40,\"damage\":75,\"fireRate\":0.800000011920929,\"dps\":60,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"drone\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_drone.png\"},\"/pa/units/sea/drone_carrier/drone/drone.json.ai\":{\"name\":\"Squall\",\"desc\":\"Missile and Torpedo Drone - Fast, fragile, attacks sea and air.\",\"cost\":30,\"maxHealth\":40,\"moveSpeed\":40,\"damage\":75,\"fireRate\":0.800000011920929,\"dps\":60,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"drone\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_drone.png\"},\"/pa/units/orbital/mining_platform/mining_platform.json\":{\"name\":\"Jig\",\"desc\":\"Gas Mining - Advanced energy and metal creation satellite. Only works above gas giant planets.\",\"cost\":4000,\"maxHealth\":3000,\"production\":{\"metal\":30,\"energy\":3750},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"mining_platform\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_mining_platform.png\"},\"/pa/units/orbital/mining_platform/mining_platform.json.player\":{\"name\":\"Jig\",\"desc\":\"Gas Mining - Advanced energy and metal creation satellite. Only works above gas giant planets.\",\"cost\":4000,\"maxHealth\":3000,\"production\":{\"metal\":30,\"energy\":3750},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"mining_platform\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_mining_platform.png\"},\"/pa/units/orbital/mining_platform/mining_platform.json.ai\":{\"name\":\"Jig\",\"desc\":\"Gas Mining - Advanced energy and metal creation satellite. Only works above gas giant planets.\",\"cost\":4000,\"maxHealth\":3000,\"production\":{\"metal\":30,\"energy\":3750},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"mining_platform\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_mining_platform.png\"},\"/pa/units/orbital/orbital_fabrication_bot/orbital_fabrication_bot.json\":{\"name\":\"Orbital Fabrication Bot\",\"desc\":\"Orbital Fabricator - Builds orbital satellites, spaceships and TITANS.\",\"cost\":1300,\"maxHealth\":100,\"moveSpeed\":20,\"max_range\":30,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_fabrication_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_fabrication_bot.png\"},\"/pa/units/orbital/orbital_fabrication_bot/orbital_fabrication_bot.json.player\":{\"name\":\"Orbital Fabrication Bot\",\"desc\":\"Orbital Fabricator - Builds orbital satellites, spaceships and TITANS.\",\"cost\":1300,\"maxHealth\":100,\"moveSpeed\":20,\"max_range\":30,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_fabrication_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_fabrication_bot.png\"},\"/pa/units/orbital/orbital_fabrication_bot/orbital_fabrication_bot.json.ai\":{\"name\":\"Orbital Fabrication Bot\",\"desc\":\"Orbital Fabricator - Builds orbital satellites, spaceships and TITANS.\",\"cost\":1300,\"maxHealth\":100,\"moveSpeed\":20,\"max_range\":30,\"build_arm\":{\"metal\":45,\"energy\":1500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_fabrication_bot\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_fabrication_bot.png\"},\"/pa/units/orbital/orbital_factory/orbital_factory.json\":{\"name\":\"Orbital Factory\",\"desc\":\"Advanced Manufacturing - Builds orbital satellites and spaceships.\",\"cost\":4200,\"maxHealth\":9000,\"build_arm\":{\"metal\":60,\"energy\":2000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_factory.png\"},\"/pa/units/orbital/orbital_factory/orbital_factory.json.player\":{\"name\":\"Orbital Factory\",\"desc\":\"Advanced Manufacturing - Builds orbital satellites and spaceships.\",\"cost\":4200,\"maxHealth\":9000,\"build_arm\":{\"metal\":60,\"energy\":2000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_factory.png\"},\"/pa/units/orbital/orbital_factory/orbital_factory.json.ai\":{\"name\":\"Orbital Factory\",\"desc\":\"Advanced Manufacturing - Builds orbital satellites and spaceships.\",\"cost\":4200,\"maxHealth\":9000,\"build_arm\":{\"metal\":60,\"energy\":2000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_factory\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_factory.png\"},\"/pa/units/orbital/orbital_fighter/orbital_fighter.json\":{\"name\":\"Avenger\",\"desc\":\"Orbital Fighter - Fast moving orbital fighter for offense and defense.\",\"cost\":300,\"maxHealth\":50,\"moveSpeed\":65,\"damage\":40,\"fireRate\":1,\"dps\":40,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_fighter\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_fighter.png\"},\"/pa/units/orbital/orbital_fighter/orbital_fighter.json.player\":{\"name\":\"Avenger\",\"desc\":\"Orbital Fighter - Fast moving orbital fighter for offense and defense.\",\"cost\":300,\"maxHealth\":50,\"moveSpeed\":65,\"damage\":40,\"fireRate\":1,\"dps\":40,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_fighter\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_fighter.png\"},\"/pa/units/orbital/orbital_fighter/orbital_fighter.json.ai\":{\"name\":\"Avenger\",\"desc\":\"Orbital Fighter - Fast moving orbital fighter for offense and defense.\",\"cost\":300,\"maxHealth\":50,\"moveSpeed\":65,\"damage\":40,\"fireRate\":1,\"dps\":40,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_fighter\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_fighter.png\"},\"/pa/units/orbital/orbital_lander/orbital_lander.json\":{\"name\":\"Astraeus\",\"desc\":\"Orbital Lander - Load it up and transport a unit to other planets.\",\"cost\":200,\"maxHealth\":150,\"moveSpeed\":50,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_lander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_lander.png\"},\"/pa/units/orbital/orbital_lander/orbital_lander.json.player\":{\"name\":\"Astraeus\",\"desc\":\"Orbital Lander - Load it up and transport a unit to other planets.\",\"cost\":200,\"maxHealth\":150,\"moveSpeed\":50,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_lander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_lander.png\"},\"/pa/units/orbital/orbital_lander/orbital_lander.json.ai\":{\"name\":\"Astraeus\",\"desc\":\"Orbital Lander - Load it up and transport a unit to other planets.\",\"cost\":200,\"maxHealth\":150,\"moveSpeed\":50,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_lander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_lander.png\"},\"/pa/units/orbital/orbital_laser/orbital_laser.json\":{\"name\":\"SXX-1304 Laser Platform\",\"desc\":\"Orbital Laser Platform - Rains death from above.\",\"cost\":4000,\"maxHealth\":1100,\"moveSpeed\":25,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":40,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":12000,\"ammo_demand\":3000,\"ammo_per_shot\":12000},\"sicon\":\"orbital_laser\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_laser.png\"},\"/pa/units/orbital/orbital_laser/orbital_laser.json.player\":{\"name\":\"SXX-1304 Laser Platform\",\"desc\":\"Orbital Laser Platform - Rains death from above.\",\"cost\":4000,\"maxHealth\":1100,\"moveSpeed\":25,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":40,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":12000,\"ammo_demand\":3000,\"ammo_per_shot\":12000},\"sicon\":\"orbital_laser\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_laser.png\"},\"/pa/units/orbital/orbital_laser/orbital_laser.json.ai\":{\"name\":\"SXX-1304 Laser Platform\",\"desc\":\"Orbital Laser Platform - Rains death from above.\",\"cost\":4000,\"maxHealth\":1100,\"moveSpeed\":25,\"damage\":1000,\"fireRate\":0.25,\"dps\":250,\"max_range\":40,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":12000,\"ammo_demand\":3000,\"ammo_per_shot\":12000},\"sicon\":\"orbital_laser\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_laser.png\"},\"/pa/units/orbital/orbital_launcher/orbital_launcher.json\":{\"name\":\"Orbital Launcher\",\"desc\":\"Basic Manufacturing - Builds and launches basic orbital units.\",\"cost\":600,\"maxHealth\":6000,\"max_range\":0,\"build_arm\":{\"metal\":30,\"energy\":1000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_launcher.png\"},\"/pa/units/orbital/orbital_launcher/orbital_launcher.json.player\":{\"name\":\"Orbital Launcher\",\"desc\":\"Basic Manufacturing - Builds and launches basic orbital units.\",\"cost\":600,\"maxHealth\":6000,\"max_range\":0,\"build_arm\":{\"metal\":30,\"energy\":1000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_launcher.png\"},\"/pa/units/orbital/orbital_launcher/orbital_launcher.json.ai\":{\"name\":\"Orbital Launcher\",\"desc\":\"Basic Manufacturing - Builds and launches basic orbital units.\",\"cost\":600,\"maxHealth\":6000,\"max_range\":0,\"build_arm\":{\"metal\":30,\"energy\":1000},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_launcher\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_launcher.png\"},\"/pa/units/orbital/radar_satellite/radar_satellite.json\":{\"name\":\"ARKYD\",\"desc\":\"Basic Radar - Detects a large area for enemy land, sea, and air units.\",\"cost\":800,\"maxHealth\":1000,\"moveSpeed\":15,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":700},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_satellite\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_satellite.png\"},\"/pa/units/orbital/radar_satellite/radar_satellite.json.player\":{\"name\":\"ARKYD\",\"desc\":\"Basic Radar - Detects a large area for enemy land, sea, and air units.\",\"cost\":800,\"maxHealth\":1000,\"moveSpeed\":15,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":700},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_satellite\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_satellite.png\"},\"/pa/units/orbital/radar_satellite/radar_satellite.json.ai\":{\"name\":\"ARKYD\",\"desc\":\"Basic Radar - Detects a large area for enemy land, sea, and air units.\",\"cost\":800,\"maxHealth\":1000,\"moveSpeed\":15,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":700},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_satellite\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_satellite.png\"},\"/pa/units/orbital/radar_satellite_adv/radar_satellite_adv.json\":{\"name\":\"Advanced Radar Satellite\",\"desc\":\"Advanced Radar - Detects a vast area for enemy land, sea, and air units.\",\"cost\":4800,\"maxHealth\":5000,\"moveSpeed\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":9000},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_satellite_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_satellite_adv.png\"},\"/pa/units/orbital/radar_satellite_adv/radar_satellite_adv.json.player\":{\"name\":\"Advanced Radar Satellite\",\"desc\":\"Advanced Radar - Detects a vast area for enemy land, sea, and air units.\",\"cost\":4800,\"maxHealth\":5000,\"moveSpeed\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":9000},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_satellite_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_satellite_adv.png\"},\"/pa/units/orbital/radar_satellite_adv/radar_satellite_adv.json.ai\":{\"name\":\"Advanced Radar Satellite\",\"desc\":\"Advanced Radar - Detects a vast area for enemy land, sea, and air units.\",\"cost\":4800,\"maxHealth\":5000,\"moveSpeed\":10,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":9000},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_satellite_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_satellite_adv.png\"},\"/pa/units/sea/attack_sub/attack_sub.json\":{\"name\":\"Barracuda\",\"desc\":\"Submarine - High damage. Cannot be targeted by cannons. Attacks sea and undersea targets.\",\"cost\":500,\"maxHealth\":550,\"moveSpeed\":14,\"damage\":250,\"fireRate\":0.6000000238418579,\"dps\":150,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"attack_sub\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_attack_sub.png\"},\"/pa/units/sea/attack_sub/attack_sub.json.player\":{\"name\":\"Barracuda\",\"desc\":\"Submarine - High damage. Cannot be targeted by cannons. Attacks sea and undersea targets.\",\"cost\":500,\"maxHealth\":550,\"moveSpeed\":14,\"damage\":250,\"fireRate\":0.6000000238418579,\"dps\":150,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"attack_sub\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_attack_sub.png\"},\"/pa/units/sea/attack_sub/attack_sub.json.ai\":{\"name\":\"Barracuda\",\"desc\":\"Submarine - High damage. Cannot be targeted by cannons. Attacks sea and undersea targets.\",\"cost\":500,\"maxHealth\":550,\"moveSpeed\":14,\"damage\":250,\"fireRate\":0.6000000238418579,\"dps\":150,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"attack_sub\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_attack_sub.png\"},\"/pa/units/sea/base_ship/base_ship.json\":{\"name\":\"Base Ship\",\"desc\":\"Base Ship Description - If you're seeing this, something is wrong in your ship.\",\"cost\":0,\"maxHealth\":0,\"moveSpeed\":1000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_ship.png\"},\"/pa/units/sea/base_ship/base_ship.json.player\":{\"name\":\"Base Ship\",\"desc\":\"Base Ship Description - If you're seeing this, something is wrong in your ship.\",\"cost\":0,\"maxHealth\":0,\"moveSpeed\":1000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_ship.png\"},\"/pa/units/sea/base_ship/base_ship.json.ai\":{\"name\":\"Base Ship\",\"desc\":\"Base Ship Description - If you're seeing this, something is wrong in your ship.\",\"cost\":0,\"maxHealth\":0,\"moveSpeed\":1000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"base_ship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_base_ship.png\"},\"/pa/units/sea/battleship/battleship.json\":{\"name\":\"Leviathan\",\"desc\":\"Battleship - Long range advanced anti-ship, and anti-land guns.\",\"cost\":4800,\"maxHealth\":6000,\"moveSpeed\":11,\"damage\":200,\"fireRate\":0.20000000298023224,\"dps\":120,\"max_range\":400,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"battleship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_battleship.png\"},\"/pa/units/sea/battleship/battleship.json.player\":{\"name\":\"Leviathan\",\"desc\":\"Battleship - Long range advanced anti-ship, and anti-land guns.\",\"cost\":4800,\"maxHealth\":6000,\"moveSpeed\":11,\"damage\":200,\"fireRate\":0.20000000298023224,\"dps\":120,\"max_range\":400,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"battleship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_battleship.png\"},\"/pa/units/sea/battleship/battleship.json.ai\":{\"name\":\"Leviathan\",\"desc\":\"Battleship - Long range advanced anti-ship, and anti-land guns.\",\"cost\":4800,\"maxHealth\":6000,\"moveSpeed\":11,\"damage\":200,\"fireRate\":0.20000000298023224,\"dps\":120,\"max_range\":400,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"battleship\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_battleship.png\"},\"/pa/units/sea/fabrication_ship_adv/fabrication_ship_adv.json\":{\"name\":\"Advanced Fabrication Ship\",\"desc\":\"Advanced Fabricator - Builds basic and advanced naval structures.\",\"cost\":2400,\"maxHealth\":600,\"moveSpeed\":10,\"build_arm\":{\"metal\":80,\"energy\":2500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_ship_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_ship_adv.png\"},\"/pa/units/sea/fabrication_ship_adv/fabrication_ship_adv.json.player\":{\"name\":\"Advanced Fabrication Ship\",\"desc\":\"Advanced Fabricator - Builds basic and advanced naval structures.\",\"cost\":2400,\"maxHealth\":600,\"moveSpeed\":10,\"build_arm\":{\"metal\":80,\"energy\":2500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_ship_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_ship_adv.png\"},\"/pa/units/sea/fabrication_ship_adv/fabrication_ship_adv.json.ai\":{\"name\":\"Advanced Fabrication Ship\",\"desc\":\"Advanced Fabricator - Builds basic and advanced naval structures.\",\"cost\":2400,\"maxHealth\":600,\"moveSpeed\":10,\"build_arm\":{\"metal\":80,\"energy\":2500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_ship_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_ship_adv.png\"},\"/pa/units/sea/frigate/frigate.json\":{\"name\":\"Narwhal\",\"desc\":\"Frigate - Durable. Rapid-fire. Attacks land, air, and sea targets.\",\"cost\":450,\"maxHealth\":750,\"moveSpeed\":12,\"damage\":50,\"fireRate\":1.5,\"dps\":75,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"frigate\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_frigate.png\"},\"/pa/units/sea/frigate/frigate.json.player\":{\"name\":\"Narwhal\",\"desc\":\"Frigate - Durable. Rapid-fire. Attacks land, air, and sea targets.\",\"cost\":450,\"maxHealth\":750,\"moveSpeed\":12,\"damage\":50,\"fireRate\":1.5,\"dps\":75,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"frigate\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_frigate.png\"},\"/pa/units/sea/frigate/frigate.json.ai\":{\"name\":\"Narwhal\",\"desc\":\"Frigate - Durable. Rapid-fire. Attacks land, air, and sea targets.\",\"cost\":450,\"maxHealth\":750,\"moveSpeed\":12,\"damage\":50,\"fireRate\":1.5,\"dps\":75,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"frigate\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_frigate.png\"},\"/pa/units/sea/naval_factory_adv/naval_factory_adv.json\":{\"name\":\"Advanced Naval Factory\",\"desc\":\"Advanced manufacturing- Builds naval units.\",\"cost\":3600,\"maxHealth\":30000,\"build_arm\":{\"metal\":60,\"energy\":1750},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"naval_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_naval_factory_adv.png\"},\"/pa/units/sea/naval_factory_adv/naval_factory_adv.json.player\":{\"name\":\"Advanced Naval Factory\",\"desc\":\"Advanced manufacturing- Builds naval units.\",\"cost\":3600,\"maxHealth\":30000,\"build_arm\":{\"metal\":60,\"energy\":1750},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"naval_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_naval_factory_adv.png\"},\"/pa/units/sea/naval_factory_adv/naval_factory_adv.json.ai\":{\"name\":\"Advanced Naval Factory\",\"desc\":\"Advanced manufacturing- Builds naval units.\",\"cost\":3600,\"maxHealth\":30000,\"build_arm\":{\"metal\":60,\"energy\":1750},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"naval_factory_adv\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_naval_factory_adv.png\"},\"/pa/units/sea/sea_mine/sea_mine.json\":{\"name\":\"Jellyfish\",\"desc\":\"Sea Mine - Detonates when ships are in proximity.\",\"cost\":300,\"maxHealth\":50,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"sea_mine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_sea_mine.png\"},\"/pa/units/sea/sea_mine/sea_mine.json.player\":{\"name\":\"Jellyfish\",\"desc\":\"Sea Mine - Detonates when ships are in proximity.\",\"cost\":300,\"maxHealth\":50,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"sea_mine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_sea_mine.png\"},\"/pa/units/sea/sea_mine/sea_mine.json.ai\":{\"name\":\"Jellyfish\",\"desc\":\"Sea Mine - Detonates when ships are in proximity.\",\"cost\":300,\"maxHealth\":50,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"sea_mine\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_sea_mine.png\"},\"/pa/units/sea/sea_scout/sea_scout.json\":{\"name\":\"Piranha\",\"desc\":\"Gunboat - Cheap. Fast. Expendable. Water hover. Attacks land and sea targets.\",\"cost\":150,\"maxHealth\":150,\"moveSpeed\":18,\"damage\":20,\"fireRate\":2,\"dps\":40,\"max_range\":105,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"sea_scout\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_sea_scout.png\"},\"/pa/units/sea/sea_scout/sea_scout.json.player\":{\"name\":\"Piranha\",\"desc\":\"Gunboat - Cheap. Fast. Expendable. Water hover. Attacks land and sea targets.\",\"cost\":150,\"maxHealth\":150,\"moveSpeed\":18,\"damage\":20,\"fireRate\":2,\"dps\":40,\"max_range\":105,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"sea_scout\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_sea_scout.png\"},\"/pa/units/sea/sea_scout/sea_scout.json.ai\":{\"name\":\"Piranha\",\"desc\":\"Gunboat - Cheap. Fast. Expendable. Water hover. Attacks land and sea targets.\",\"cost\":150,\"maxHealth\":150,\"moveSpeed\":18,\"damage\":20,\"fireRate\":2,\"dps\":40,\"max_range\":105,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"sea_scout\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_sea_scout.png\"},\"/pa/units/air/solar_drone/solar_drone.json\":{\"name\":\"Icarus\",\"desc\":\"Solar Drone - Produces energy. Mobile but slow. Weak. Attacks land, air, and sea targets.\",\"cost\":125,\"maxHealth\":40,\"moveSpeed\":50,\"damage\":25,\"fireRate\":1,\"dps\":25,\"max_range\":70,\"production\":{\"metal\":0,\"energy\":175},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1500,\"ammo_demand\":100,\"ammo_per_shot\":300},\"sicon\":\"solar_drone\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_solar_drone.png\"},\"/pa/units/air/solar_drone/solar_drone.json.player\":{\"name\":\"Icarus\",\"desc\":\"Solar Drone - Produces energy. Mobile but slow. Weak. Attacks land, air, and sea targets.\",\"cost\":125,\"maxHealth\":40,\"moveSpeed\":50,\"damage\":25,\"fireRate\":1,\"dps\":25,\"max_range\":70,\"production\":{\"metal\":0,\"energy\":175},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1500,\"ammo_demand\":100,\"ammo_per_shot\":300},\"sicon\":\"solar_drone\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_solar_drone.png\"},\"/pa/units/air/solar_drone/solar_drone.json.ai\":{\"name\":\"Icarus\",\"desc\":\"Solar Drone - Produces energy. Mobile but slow. Weak. Attacks land, air, and sea targets.\",\"cost\":125,\"maxHealth\":40,\"moveSpeed\":50,\"damage\":25,\"fireRate\":1,\"dps\":25,\"max_range\":70,\"production\":{\"metal\":0,\"energy\":175},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":1500,\"ammo_demand\":100,\"ammo_per_shot\":300},\"sicon\":\"solar_drone\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_solar_drone.png\"},\"/pa/units/air/strafer/strafer.json\":{\"name\":\"Horsefly\",\"desc\":\"Strafer Aircraft - Loud and annoying. Attacks land, air and sea targets.\",\"cost\":1800,\"maxHealth\":1250,\"moveSpeed\":70,\"damage\":15,\"fireRate\":8,\"dps\":240,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"strafer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_strafer.png\"},\"/pa/units/air/strafer/strafer.json.player\":{\"name\":\"Horsefly\",\"desc\":\"Strafer Aircraft - Loud and annoying. Attacks land, air and sea targets.\",\"cost\":1800,\"maxHealth\":1250,\"moveSpeed\":70,\"damage\":15,\"fireRate\":8,\"dps\":240,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"strafer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_strafer.png\"},\"/pa/units/air/strafer/strafer.json.ai\":{\"name\":\"Horsefly\",\"desc\":\"Strafer Aircraft - Loud and annoying. Attacks land, air and sea targets.\",\"cost\":1800,\"maxHealth\":1250,\"moveSpeed\":70,\"damage\":15,\"fireRate\":8,\"dps\":240,\"max_range\":150,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"strafer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_strafer.png\"},\"/pa/units/air/support_platform/support_platform.json\":{\"name\":\"Angel\",\"desc\":\"Support Platform - Repairs nearby units and auto reclaims wreckage. Intercepts homing missiles. Does not attack.\",\"cost\":4000,\"maxHealth\":1200,\"moveSpeed\":40,\"damage\":400,\"fireRate\":5,\"dps\":2000,\"max_range\":160,\"build_arm\":{\"metal\":120,\"energy\":400},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"support_platform\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_support_platform.png\"},\"/pa/units/air/support_platform/support_platform.json.player\":{\"name\":\"Angel\",\"desc\":\"Support Platform - Repairs nearby units and auto reclaims wreckage. Intercepts homing missiles. Does not attack.\",\"cost\":4000,\"maxHealth\":1200,\"moveSpeed\":40,\"damage\":400,\"fireRate\":5,\"dps\":2000,\"max_range\":160,\"build_arm\":{\"metal\":120,\"energy\":400},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"support_platform\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_support_platform.png\"},\"/pa/units/air/support_platform/support_platform.json.ai\":{\"name\":\"Angel\",\"desc\":\"Support Platform - Repairs nearby units and auto reclaims wreckage. Intercepts homing missiles. Does not attack.\",\"cost\":4000,\"maxHealth\":1200,\"moveSpeed\":40,\"damage\":400,\"fireRate\":5,\"dps\":2000,\"max_range\":160,\"build_arm\":{\"metal\":120,\"energy\":400},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"support_platform\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_support_platform.png\"},\"/pa/units/air/titan_air/titan_air.json\":{\"name\":\"Zeus\",\"desc\":\"Lightning Titan - Heavy damage over a wide area. Attacks any targets except orbital.\",\"cost\":30000,\"maxHealth\":12000,\"moveSpeed\":30,\"damage\":1500,\"fireRate\":0.550000011920929,\"dps\":825,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":10000,\"ammo_demand\":5500,\"ammo_per_shot\":10000},\"sicon\":\"titan_air\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_air.png\"},\"/pa/units/air/titan_air/titan_air.json.player\":{\"name\":\"Zeus\",\"desc\":\"Lightning Titan - Heavy damage over a wide area. Attacks any targets except orbital.\",\"cost\":30000,\"maxHealth\":12000,\"moveSpeed\":30,\"damage\":1500,\"fireRate\":0.550000011920929,\"dps\":825,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":10000,\"ammo_demand\":5500,\"ammo_per_shot\":10000},\"sicon\":\"titan_air\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_air.png\"},\"/pa/units/air/titan_air/titan_air.json.ai\":{\"name\":\"Zeus\",\"desc\":\"Lightning Titan - Heavy damage over a wide area. Attacks any targets except orbital.\",\"cost\":30000,\"maxHealth\":12000,\"moveSpeed\":30,\"damage\":1500,\"fireRate\":0.550000011920929,\"dps\":825,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":10000,\"ammo_demand\":5500,\"ammo_per_shot\":10000},\"sicon\":\"titan_air\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_air.png\"},\"/pa/units/commanders/tutorial_ai_commander/tutorial_ai_commander.json\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":10000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":200,\"energy\":1000},\"production\":{\"metal\":200,\"energy\":1000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1000,\"energy\":1000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_ai_commander/tutorial_ai_commander.json.player\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":10000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":200,\"energy\":1000},\"production\":{\"metal\":200,\"energy\":1000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1000,\"energy\":1000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_ai_commander/tutorial_ai_commander.json.ai\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":10000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":160,\"build_arm\":{\"metal\":200,\"energy\":1000},\"production\":{\"metal\":200,\"energy\":1000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1000,\"energy\":1000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_ai_commander_2/tutorial_ai_commander_2.json\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":1000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":100,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_ai_commander_2/tutorial_ai_commander_2.json.player\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":1000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":100,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_ai_commander_2/tutorial_ai_commander_2.json.ai\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":1000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"max_range\":100,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_ai_commander_3/tutorial_ai_commander_3.json\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":1000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_ai_commander_3/tutorial_ai_commander_3.json.player\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":1000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_ai_commander_3/tutorial_ai_commander_3.json.ai\":{\"name\":\"Delta Commander\",\"desc\":\"Imperial Delta Commander\",\"cost\":25000,\"maxHealth\":1000,\"moveSpeed\":8,\"damage\":80,\"fireRate\":2,\"dps\":160,\"build_arm\":{\"metal\":30,\"energy\":1750},\"production\":{\"metal\":20,\"energy\":2000},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":1500,\"energy\":45000},\"energy_weapon\":null,\"sicon\":\"commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_commander.png\"},\"/pa/units/commanders/tutorial_titan_commander/tutorial_titan_commander.json\":{\"name\":\"Tutorial Titan Commander\",\"desc\":\"Seismic Titan - Devastating damage to everything nearby. Amphibious. Attacks land, sea, and undersea targets.\",\"cost\":30000,\"maxHealth\":1000000,\"moveSpeed\":13,\"damage\":8000,\"fireRate\":0.20000000298023224,\"dps\":1600,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tutorial_titan_commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tutorial_titan_commander.png\"},\"/pa/units/commanders/tutorial_titan_commander/tutorial_titan_commander.json.player\":{\"name\":\"Tutorial Titan Commander\",\"desc\":\"Seismic Titan - Devastating damage to everything nearby. Amphibious. Attacks land, sea, and undersea targets.\",\"cost\":30000,\"maxHealth\":1000000,\"moveSpeed\":13,\"damage\":8000,\"fireRate\":0.20000000298023224,\"dps\":1600,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tutorial_titan_commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tutorial_titan_commander.png\"},\"/pa/units/commanders/tutorial_titan_commander/tutorial_titan_commander.json.ai\":{\"name\":\"Tutorial Titan Commander\",\"desc\":\"Seismic Titan - Devastating damage to everything nearby. Amphibious. Attacks land, sea, and undersea targets.\",\"cost\":30000,\"maxHealth\":1000000,\"moveSpeed\":13,\"damage\":8000,\"fireRate\":0.20000000298023224,\"dps\":1600,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tutorial_titan_commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tutorial_titan_commander.png\"},\"/pa/units/land/bot_nanoswarm/bot_nanoswarm.json\":{\"name\":\"Locusts\",\"desc\":\"Nanobot Swarm - Extremely Fast. Cheap. Close range. Devastating damage. Hover. Attacks land and sea targets.\",\"cost\":500,\"maxHealth\":160,\"moveSpeed\":30,\"damage\":20,\"fireRate\":10,\"dps\":200,\"max_range\":30,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_nanoswarm\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_nanoswarm.png\"},\"/pa/units/land/bot_nanoswarm/bot_nanoswarm.json.player\":{\"name\":\"Locusts\",\"desc\":\"Nanobot Swarm - Extremely Fast. Cheap. Close range. Devastating damage. Hover. Attacks land and sea targets.\",\"cost\":500,\"maxHealth\":160,\"moveSpeed\":30,\"damage\":20,\"fireRate\":10,\"dps\":200,\"max_range\":30,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_nanoswarm\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_nanoswarm.png\"},\"/pa/units/land/bot_nanoswarm/bot_nanoswarm.json.ai\":{\"name\":\"Locusts\",\"desc\":\"Nanobot Swarm - Extremely Fast. Cheap. Close range. Devastating damage. Hover. Attacks land and sea targets.\",\"cost\":500,\"maxHealth\":160,\"moveSpeed\":30,\"damage\":20,\"fireRate\":10,\"dps\":200,\"max_range\":30,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_nanoswarm\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_nanoswarm.png\"},\"/pa/units/land/bot_support_commander/bot_support_commander.json\":{\"name\":\"Colonel\",\"desc\":\"Proxy Commander -- Builds advanced structures. Durable. High damage. Attacks everything but orbital.\",\"cost\":7000,\"maxHealth\":8000,\"moveSpeed\":12,\"damage\":200,\"fireRate\":2,\"dps\":400,\"max_range\":100,\"build_arm\":{\"metal\":80,\"energy\":2500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_support_commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_support_commander.png\"},\"/pa/units/land/bot_support_commander/bot_support_commander.json.player\":{\"name\":\"Colonel\",\"desc\":\"Proxy Commander -- Builds advanced structures. Durable. High damage. Attacks everything but orbital.\",\"cost\":7000,\"maxHealth\":8000,\"moveSpeed\":12,\"damage\":200,\"fireRate\":2,\"dps\":400,\"max_range\":100,\"build_arm\":{\"metal\":80,\"energy\":2500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_support_commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_support_commander.png\"},\"/pa/units/land/bot_support_commander/bot_support_commander.json.ai\":{\"name\":\"Colonel\",\"desc\":\"Proxy Commander -- Builds advanced structures. Durable. High damage. Attacks everything but orbital.\",\"cost\":7000,\"maxHealth\":8000,\"moveSpeed\":12,\"damage\":200,\"fireRate\":2,\"dps\":400,\"max_range\":100,\"build_arm\":{\"metal\":80,\"energy\":2500},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"bot_support_commander\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_support_commander.png\"},\"/pa/units/land/bot_tesla/bot_tesla.json\":{\"name\":\"Spark\",\"desc\":\"Tesla Bot - Very high damage over a short range area. Uses energy. Attacks land targets.\",\"cost\":105,\"maxHealth\":130,\"moveSpeed\":14,\"damage\":160,\"fireRate\":0.5,\"dps\":80,\"max_range\":67.5,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":400,\"ammo_demand\":200,\"ammo_per_shot\":400},\"sicon\":\"bot_tesla\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_tesla.png\"},\"/pa/units/land/bot_tesla/bot_tesla.json.player\":{\"name\":\"Spark\",\"desc\":\"Tesla Bot - Very high damage over a short range area. Uses energy. Attacks land targets.\",\"cost\":105,\"maxHealth\":130,\"moveSpeed\":14,\"damage\":160,\"fireRate\":0.5,\"dps\":80,\"max_range\":67.5,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":400,\"ammo_demand\":200,\"ammo_per_shot\":400},\"sicon\":\"bot_tesla\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_tesla.png\"},\"/pa/units/land/bot_tesla/bot_tesla.json.ai\":{\"name\":\"Spark\",\"desc\":\"Tesla Bot - Very high damage over a short range area. Uses energy. Attacks land targets.\",\"cost\":105,\"maxHealth\":130,\"moveSpeed\":14,\"damage\":160,\"fireRate\":0.5,\"dps\":80,\"max_range\":67.5,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"energy\",\"ammo_capacity\":400,\"ammo_demand\":200,\"ammo_per_shot\":400},\"sicon\":\"bot_tesla\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_bot_tesla.png\"},\"/pa/units/land/tank_flak/tank_flak.json\":{\"name\":\"Storm\",\"desc\":\"Flak Tank - Damage over a very wide area. Only attacks air targets.\",\"cost\":750,\"maxHealth\":400,\"moveSpeed\":10,\"damage\":15,\"fireRate\":1,\"dps\":60,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_flak\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_flak.png\"},\"/pa/units/land/tank_flak/tank_flak.json.player\":{\"name\":\"Storm\",\"desc\":\"Flak Tank - Damage over a very wide area. Only attacks air targets.\",\"cost\":750,\"maxHealth\":400,\"moveSpeed\":10,\"damage\":15,\"fireRate\":1,\"dps\":60,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_flak\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_flak.png\"},\"/pa/units/land/tank_flak/tank_flak.json.ai\":{\"name\":\"Storm\",\"desc\":\"Flak Tank - Damage over a very wide area. Only attacks air targets.\",\"cost\":750,\"maxHealth\":400,\"moveSpeed\":10,\"damage\":15,\"fireRate\":1,\"dps\":60,\"max_range\":100,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_flak\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_flak.png\"},\"/pa/units/land/tank_hover/tank_hover.json\":{\"name\":\"Drifter\",\"desc\":\"Hover Tank - Fast. Can cross water and lava. Attacks land and sea targets.\",\"cost\":225,\"maxHealth\":250,\"moveSpeed\":14,\"damage\":125,\"fireRate\":0.4000000059604645,\"dps\":50,\"max_range\":110,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_hover\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_hover.png\"},\"/pa/units/land/tank_hover/tank_hover.json.player\":{\"name\":\"Drifter\",\"desc\":\"Hover Tank - Fast. Can cross water and lava. Attacks land and sea targets.\",\"cost\":225,\"maxHealth\":250,\"moveSpeed\":14,\"damage\":125,\"fireRate\":0.4000000059604645,\"dps\":50,\"max_range\":110,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_hover\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_hover.png\"},\"/pa/units/land/tank_hover/tank_hover.json.ai\":{\"name\":\"Drifter\",\"desc\":\"Hover Tank - Fast. Can cross water and lava. Attacks land and sea targets.\",\"cost\":225,\"maxHealth\":250,\"moveSpeed\":14,\"damage\":125,\"fireRate\":0.4000000059604645,\"dps\":50,\"max_range\":110,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_hover\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_hover.png\"},\"/pa/units/land/tank_nuke/tank_nuke.json\":{\"name\":\"Manhattan\",\"desc\":\"Mobile Nuke - Detonates a nuke on death. Slow. Extremely durable. Self-destruct attack.\",\"cost\":8000,\"maxHealth\":15000,\"moveSpeed\":10,\"damage\":10,\"fireRate\":0.5,\"dps\":5,\"max_range\":40,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_nuke\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_nuke.png\"},\"/pa/units/land/tank_nuke/tank_nuke.json.player\":{\"name\":\"Manhattan\",\"desc\":\"Mobile Nuke - Detonates a nuke on death. Slow. Extremely durable. Self-destruct attack.\",\"cost\":8000,\"maxHealth\":15000,\"moveSpeed\":10,\"damage\":10,\"fireRate\":0.5,\"dps\":5,\"max_range\":40,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_nuke\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_nuke.png\"},\"/pa/units/land/tank_nuke/tank_nuke.json.ai\":{\"name\":\"Manhattan\",\"desc\":\"Mobile Nuke - Detonates a nuke on death. Slow. Extremely durable. Self-destruct attack.\",\"cost\":8000,\"maxHealth\":15000,\"moveSpeed\":10,\"damage\":10,\"fireRate\":0.5,\"dps\":5,\"max_range\":40,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"tank_nuke\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_nuke.png\"},\"/pa/units/land/radar_jammer/radar_jammer.json\":{\"name\":\"Radar Jamming Station\",\"desc\":\"Radar Jammer - Hides allied units from enemy radar in a radius around itself. Consumes power.\",\"cost\":2000,\"maxHealth\":5000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":2000},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_jammer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_jammer.png\"},\"/pa/units/land/radar_jammer/radar_jammer.json.player\":{\"name\":\"Radar Jamming Station\",\"desc\":\"Radar Jammer - Hides allied units from enemy radar in a radius around itself. Consumes power.\",\"cost\":2000,\"maxHealth\":5000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":2000},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_jammer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_jammer.png\"},\"/pa/units/land/radar_jammer/radar_jammer.json.ai\":{\"name\":\"Radar Jamming Station\",\"desc\":\"Radar Jammer - Hides allied units from enemy radar in a radius around itself. Consumes power.\",\"cost\":2000,\"maxHealth\":5000,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":2000},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"radar_jammer\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_radar_jammer.png\"},\"/pa/units/land/titan_structure/titan_structure.json\":{\"name\":\"Ragnarok\",\"desc\":\"Doomsday Titan - Destroys the planet it's built on once finished.\",\"cost\":60000,\"maxHealth\":15000,\"damage\":0,\"fireRate\":1,\"dps\":0,\"max_range\":0,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_structure\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_structure.png\"},\"/pa/units/land/titan_structure/titan_structure.json.player\":{\"name\":\"Ragnarok\",\"desc\":\"Doomsday Titan - Destroys the planet it's built on once finished.\",\"cost\":60000,\"maxHealth\":15000,\"damage\":0,\"fireRate\":1,\"dps\":0,\"max_range\":0,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_structure\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_structure.png\"},\"/pa/units/land/titan_structure/titan_structure.json.ai\":{\"name\":\"Ragnarok\",\"desc\":\"Doomsday Titan - Destroys the planet it's built on once finished.\",\"cost\":60000,\"maxHealth\":15000,\"damage\":0,\"fireRate\":1,\"dps\":0,\"max_range\":0,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_structure\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_structure.png\"},\"/pa/units/land/titan_vehicle/titan_vehicle.json\":{\"name\":\"Ares\",\"desc\":\"Rolling Fortress - Near invincible. Long range. Heavy damage. Hover. Attacks land and sea targets.\",\"cost\":30000,\"maxHealth\":50000,\"moveSpeed\":10,\"damage\":800,\"fireRate\":0.30000001192092896,\"dps\":960.0000610351562,\"max_range\":400,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_vehicle.png\"},\"/pa/units/land/titan_vehicle/titan_vehicle.json.player\":{\"name\":\"Ares\",\"desc\":\"Rolling Fortress - Near invincible. Long range. Heavy damage. Hover. Attacks land and sea targets.\",\"cost\":30000,\"maxHealth\":50000,\"moveSpeed\":10,\"damage\":800,\"fireRate\":0.30000001192092896,\"dps\":960.0000610351562,\"max_range\":400,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_vehicle.png\"},\"/pa/units/land/titan_vehicle/titan_vehicle.json.ai\":{\"name\":\"Ares\",\"desc\":\"Rolling Fortress - Near invincible. Long range. Heavy damage. Hover. Attacks land and sea targets.\",\"cost\":30000,\"maxHealth\":50000,\"moveSpeed\":10,\"damage\":800,\"fireRate\":0.30000001192092896,\"dps\":960.0000610351562,\"max_range\":400,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_vehicle\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_vehicle.png\"},\"/pa/units/orbital/orbital_carrier/orbital_carrier.json\":{\"name\":\"Exodus\",\"desc\":\"Orbital Carrier - Can load up to 12 units.\",\"cost\":2000,\"maxHealth\":800,\"moveSpeed\":25,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_carrier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_carrier.png\"},\"/pa/units/orbital/orbital_carrier/orbital_carrier.json.player\":{\"name\":\"Exodus\",\"desc\":\"Orbital Carrier - Can load up to 12 units.\",\"cost\":2000,\"maxHealth\":800,\"moveSpeed\":25,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_carrier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_carrier.png\"},\"/pa/units/orbital/orbital_carrier/orbital_carrier.json.ai\":{\"name\":\"Exodus\",\"desc\":\"Orbital Carrier - Can load up to 12 units.\",\"cost\":2000,\"maxHealth\":800,\"moveSpeed\":25,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"orbital_carrier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_orbital_carrier.png\"},\"/pa/units/orbital/titan_orbital/titan_orbital.json\":{\"name\":\"Helios\",\"desc\":\"Invasion Titan - Can link with a teleporter to send units directly to planet surface. Attacks everything.\",\"cost\":30000,\"maxHealth\":13000,\"moveSpeed\":25,\"damage\":55,\"fireRate\":1.5,\"dps\":82.5,\"max_range\":140,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"energy\":1000,\"mental\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_orbital\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_orbital.png\"},\"/pa/units/orbital/titan_orbital/titan_orbital.json.player\":{\"name\":\"Helios\",\"desc\":\"Invasion Titan - Can link with a teleporter to send units directly to planet surface. Attacks everything.\",\"cost\":30000,\"maxHealth\":13000,\"moveSpeed\":25,\"damage\":55,\"fireRate\":1.5,\"dps\":82.5,\"max_range\":140,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"energy\":1000,\"mental\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_orbital\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_orbital.png\"},\"/pa/units/orbital/titan_orbital/titan_orbital.json.ai\":{\"name\":\"Helios\",\"desc\":\"Invasion Titan - Can link with a teleporter to send units directly to planet surface. Attacks everything.\",\"cost\":30000,\"maxHealth\":13000,\"moveSpeed\":25,\"damage\":55,\"fireRate\":1.5,\"dps\":82.5,\"max_range\":140,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"energy\":1000,\"mental\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"titan_orbital\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_titan_orbital.png\"},\"/pa/units/sea/drone_carrier/carrier/carrier.json\":{\"name\":\"Typhoon\",\"desc\":\"Drone Carrier - Builds and launches missile drones at enemies. Attacks land, air and sea targets.\",\"cost\":5200,\"maxHealth\":5000,\"moveSpeed\":11,\"damage\":0,\"fireRate\":2,\"dps\":0,\"max_range\":250,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"metal\",\"ammo_capacity\":300,\"ammo_demand\":30,\"ammo_per_shot\":30},\"sicon\":\"carrier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_carrier.png\"},\"/pa/units/sea/drone_carrier/carrier/carrier.json.player\":{\"name\":\"Typhoon\",\"desc\":\"Drone Carrier - Builds and launches missile drones at enemies. Attacks land, air and sea targets.\",\"cost\":5200,\"maxHealth\":5000,\"moveSpeed\":11,\"damage\":0,\"fireRate\":2,\"dps\":0,\"max_range\":250,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"metal\",\"ammo_capacity\":300,\"ammo_demand\":30,\"ammo_per_shot\":30},\"sicon\":\"carrier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_carrier.png\"},\"/pa/units/sea/drone_carrier/carrier/carrier.json.ai\":{\"name\":\"Typhoon\",\"desc\":\"Drone Carrier - Builds and launches missile drones at enemies. Attacks land, air and sea targets.\",\"cost\":5200,\"maxHealth\":5000,\"moveSpeed\":11,\"damage\":0,\"fireRate\":2,\"dps\":0,\"max_range\":250,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"metal\",\"ammo_capacity\":300,\"ammo_demand\":30,\"ammo_per_shot\":30},\"sicon\":\"carrier\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_carrier.png\"},\"/pa/units/sea/fabrication_barge/fabrication_barge.json\":{\"name\":\"Barnacle\",\"desc\":\"Support Barge - Repairs damaged ships and auto reclaims wreckage. Builds and detects mines. Cannot help build units. Water hover.\",\"cost\":550,\"maxHealth\":500,\"moveSpeed\":14,\"max_range\":65,\"build_arm\":{\"metal\":45,\"energy\":400},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_barge\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_barge.png\"},\"/pa/units/sea/fabrication_barge/fabrication_barge.json.player\":{\"name\":\"Barnacle\",\"desc\":\"Support Barge - Repairs damaged ships and auto reclaims wreckage. Builds and detects mines. Cannot help build units. Water hover.\",\"cost\":550,\"maxHealth\":500,\"moveSpeed\":14,\"max_range\":65,\"build_arm\":{\"metal\":45,\"energy\":400},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_barge\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_barge.png\"},\"/pa/units/sea/fabrication_barge/fabrication_barge.json.ai\":{\"name\":\"Barnacle\",\"desc\":\"Support Barge - Repairs damaged ships and auto reclaims wreckage. Builds and detects mines. Cannot help build units. Water hover.\",\"cost\":550,\"maxHealth\":500,\"moveSpeed\":14,\"max_range\":65,\"build_arm\":{\"metal\":45,\"energy\":400},\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":null,\"sicon\":\"fabrication_barge\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_fabrication_barge.png\"},\"/pa/units/land/tank_anti_nuke/tank_anti_nuke.json\":{\"name\":\"Ward\",\"desc\":\"Mobile Anti-Nuke - Launches a single anti-nuclear missile.\",\"cost\":8000,\"maxHealth\":3000,\"moveSpeed\":10,\"damage\":1,\"fireRate\":1.5,\"dps\":1.5,\"max_range\":300,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"metal\",\"ammo_capacity\":7500,\"ammo_demand\":75,\"ammo_per_shot\":7500},\"sicon\":\"tank_anti_nuke\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_anti_nuke.png\"},\"/pa/units/land/tank_anti_nuke/tank_anti_nuke.json.player\":{\"name\":\"Ward\",\"desc\":\"Mobile Anti-Nuke - Launches a single anti-nuclear missile.\",\"cost\":8000,\"maxHealth\":3000,\"moveSpeed\":10,\"damage\":1,\"fireRate\":1.5,\"dps\":1.5,\"max_range\":300,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"metal\",\"ammo_capacity\":7500,\"ammo_demand\":75,\"ammo_per_shot\":7500},\"sicon\":\"tank_anti_nuke\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_anti_nuke.png\"},\"/pa/units/land/tank_anti_nuke/tank_anti_nuke.json.ai\":{\"name\":\"Ward\",\"desc\":\"Mobile Anti-Nuke - Launches a single anti-nuclear missile.\",\"cost\":8000,\"maxHealth\":3000,\"moveSpeed\":10,\"damage\":1,\"fireRate\":1.5,\"dps\":1.5,\"max_range\":300,\"production\":{\"metal\":0,\"energy\":0},\"consumption\":{\"metal\":0,\"energy\":0},\"storage\":{\"metal\":0,\"energy\":0},\"energy_weapon\":{\"ammo_source\":\"metal\",\"ammo_capacity\":7500,\"ammo_demand\":75,\"ammo_per_shot\":7500},\"sicon\":\"tank_anti_nuke\",\"siconUrl\":\"coui://ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tank_anti_nuke.png\"}}" },
	sendUnitData: function () {
		if (self.itemDetails) {
			const unitJs = ko.toJS(self.itemDetails),
				unitJson = JSON.stringify(unitJs);

			_.forEach(self.unitDataSubscribers, function (oldVersion, panelName) {
				if (oldVersion !== unitJson) {
					api.Panel.message(panelName, "augmented_unit_data", unitJs);
					self.unitDataSubscribers[panelName] = unitJson;
				}
			});
		}
	},
	subscribeToUnitData: function (panelName) {
		self.unitDataSubscribers[panelName] = true;
		self.sendUnitData();
	},
	playerInfoSubscribers: { build_hover:"{\"armyId\":15773,\"playerData\":{\"colors\":[\"rgb(32,178,170)\",\"rgb(70,70,70)\"],\"primary_color\":[[32,178,170],[70,70,70]],\"names\":[\"EmpressChrysalis\",\"Tank\"],\"ids\":[15773,15775],\"commanders\":[[\"/pa/units/commanders/raptor_unicorn/raptor_unicorn.json\"],[\"/pa/units/commanders/imperial_invictus/imperial_invictus.json\"]],\"army_index\":0}}", unit_alert:"{\"armyId\":15773,\"playerData\":{\"colors\":[\"rgb(32,178,170)\",\"rgb(70,70,70)\"],\"primary_color\":[[32,178,170],[70,70,70]],\"names\":[\"EmpressChrysalis\",\"Tank\"],\"ids\":[15773,15775],\"commanders\":[[\"/pa/units/commanders/raptor_unicorn/raptor_unicorn.json\"],[\"/pa/units/commanders/imperial_invictus/imperial_invictus.json\"]],\"army_index\":0}}" },
	sendPlayerInfo: function () {
		const playerDataJs = ko.toJS({
				armyId: self.armyId(),
				playerData: self.playerData(),
			}),
			playerDataJson = JSON.stringify(playerDataJs);

		_.forEach(self.playerInfoSubscribers, function (oldVersion, panelName) {
			if (oldVersion !== playerDataJson) {
				api.Panel.message(panelName, "player_info.update", playerDataJs);
				self.playerInfoSubscribers[panelName] = playerDataJson;
			}
		});
	},
	ammoBuildHover: {},
	reconnectToGameInfo: undefined,
	updateReconnectToGameInfoTimestamp: function () {
		const reconnectToGameInfo = self.reconnectToGameInfo();
		if (!reconnectToGameInfo) {
			return;
		}
		reconnectToGameInfo.timestamp = Date.now();
		self.reconnectToGameInfo.valueHasMutated();
		setTimeout(self.updateReconnectToGameInfoTimestamp, 60 * 1000);
	},
	resetLobbyInfo: function () {
		api.Panel.message("uberbar", "lobby_info", undefined);
	},
	resetGameInfo: function () {
		self.reconnectToGameInfo(undefined);
		self.resetLobbyInfo();
	},
	togglePOV: function (forcePrimary) {
		let focusedHolodeck = api.Holodeck.focused;

		if (forcePrimary && focusedHolodeck != self.holodeck) {
			self.holodeck.focus();
			focusedHolodeck = self.holodeck;
		}

		if (focusedHolodeck.cameraMode() != "pov") {
			// POV camera needs something to track

			if (focusedHolodeck.cameraTrackedUnit() == -1 && !self.hasSelection()) {
				if (self.playerWasAlwaysSpectating()) {
					api.select.armyCommanders(-1);
				} else api.select.commander();
			}
		}
		_.defer(function () {
			api.camera.toggleMode("pov");
		});
	},
	togglePrimaryPOV: function () {
		self.togglePOV(true);
	},
	crossRefUnitSpecs: function (units) {
		for (const id in units) {
			const unit = units[id];
			unit.id = id;
			if (unit.build) {
				for (let b = 0; b < unit.build.length; ++b) {
					let ref = units[unit.build[b]];
					if (!ref) {
						ref = { id: unit.build[b] };
						units[ref.id] = ref;
					}
					unit.build[b] = ref;
				}
			}

			const projectile_specs = unit.projectile_specs;

			if (projectile_specs) {
				for (let p = 0; p < projectile_specs.length; ++p) {
					unit.projectiles[p] = projectile_specs[p];
				}
			}
		}
	},
	playerCommanderIds: { 0:[15871], 1:[] },
	planetComMessage: "",
	checkPlayerPlanet: function () {
		let armyId;
		if (self.isSpectator()) {
			for (var i = 0; i < self.players().length; i++) {
				if (self.playerCommanderIds[i] == undefined) {self.playerCommanderIds[i] = []}
				primaryColor = self.players()[i].color;
				commanders = self.players()[i].commanders;
				armyId = i;
				self.sendPlayerComData(armyId, primaryColor, commanders);
			}
		} else {
			for (var i = 0; i < self.players().length; i++) {
				if (self.playerCommanderIds[i] == undefined) {self.playerCommanderIds[i] = []}
				primaryColor = self.players()[i].color;
				commanders = self.players()[i].commanders;
				armyId = i;
				if (self.players()[i].stateToPlayer !== "hostile") {
					self.sendPlayerComData(armyId, primaryColor, commanders);
				}
			}
		}


		_.delay(function () { api.Panel.message("planets", "playerCommander", self.planetComMessage); self.planetComMessage = []}, 500);
		_.delay(self.checkPlayerPlanet, 1000);
	},
	sendPlayerComData: function (armyId, armyColor, commanders) {
		self.playerCommanderIds[armyId] = [];
		const planets = self.planetListState().planets;
		for (let i = 0; i < planets.length; i++) {
			api.getWorldView(0).getArmyUnits(armyId, i).then(function (result) {
				_.map(commanders, function (commander) {
					if (result[commander] !== undefined) {
						self.playerCommanderIds[armyId] = _.uniq(self.playerCommanderIds[armyId].concat(result[commander]));
					}
				});
			});
		}
		_.delay(self.finishSendingComData, 200, armyId, armyColor);
	},
	finishSendingComData: function (armyId, armyColor) {
		api.getWorldView(0).getUnitState(self.playerCommanderIds[armyId]).then(function (result) {
			const message = [];
			_.forEach(result, function (unitState) {
				message.push({
					planet: unitState.planet,
					color: armyColor,
				});
			});
			self.planetComMessage = self.planetComMessage.concat(message);
		});
	},
	createCustomSpecialWeaponAlert: function (type, planet) {
		if (type == "smashPlanet") {
			if (!model.squelchNotifications()) {
				model.doCustomAlert({
					name: "Thrust control established",
					special_weapon: true,
					thrust: true,
					index: planet.index,
					name: planet.name,
				})
				.then(function () {
					model.celestialControlModel.smashPlanet(planet.index);
				});
			}
		}
		if (type == "stopPlanet") {
			if (!model.squelchNotifications()) {
				model.doCustomAlert({
					name: "Cancel Move",
					special_weapon: true,
					thrust: true,
					moving: true,
					index: planet.index,
					name: planet.name,
				})
				.then(function () {
					model.celestialControlModel.cancelMove(planet.index);
				});
			}
		}
		if (type == "fireWeapon") {
			if (!model.squelchNotifications()) {
				model.doCustomAlert({
					name: "Weapon control established",
					special_weapon: true,
					lazer: true,
					index: planet.index,
					name: planet.name,
				})
				.then(function () {
					model.celestialControlModel.firePlanetWeapon(planet.index);
				}); // you may fire when ready
			}
		}
		if (type == "stopWeapon") {
			if (!model.squelchNotifications()) {
				model.doCustomAlert({
					name: "Cancel Fire",
					special_weapon: true,
					firing:true,
					lazer: true,
					index: planet.index,
					name: planet.name,
				})
				.then(function () {
					model.celestialControlModel.cancelFire(planet.index);
				});
			}
		}
	},
	showBrowser: undefined,
	browserHome: undefined,
	browserTitle: undefined,
	openBrowser: function () {},
	closeBrowser: function () {},
	navBrowserHome: function () {},
	setBrowserHtml: function (html) { },
	player_color_index: undefined,
	serverSandboxState: undefined,
	screenHeight: function () {
		return window.screen.availHeight;
	},
	currentFocusPlanetId: function () {
		return api.camera.getFocus(api.Holodeck.focused.id).planetId();
	},
	toggle_pan_camera: function () {
		if (model.mode() === "camera") {
			model.stop_pan_camera();
		} else {
			model.start_pan_camera();
		}
	},
	start_pan_camera: function () {
		if (model.mode() != "camera") {
			panPreviousMode = model.mode();
			model.mode("camera");
		}
		panHolodeck = api.Holodeck.focused;
		panHolodeck.beginControlCamera();
	},
	stop_pan_camera: function () {
		if (panHolodeck) {
			panHolodeck.endControlCamera();
			panHolodeck = null;
		}
		if (model.mode() === "camera") {
			model.mode(panPreviousMode);
		}
	},
	hold_to_pan_camera: function (downEvent) {
		model.start_pan_camera();
		input.capture(panHolodeck.div, function (event) {
			const release = ((event.type === "keyup") && (event.keyCode === downEvent.keyCode));
			const escKey = ((event.type === "keydown") && (event.keyCode === keyboard.esc));
			if (release || escKey) {
				input.release();

				// mousetrap waits for a keyup event before sending the NEXT keydown event.
				if (release) resendEvent(event);

				model.stop_pan_camera();
			}
		});
	},
	look_at_north_pole: function () {
		lookAt({ x:0.001, y:0.001, z:500 });
	},
	look_at_south_pole: function () {
		lookAt({ x:0.001, y:0.001, z:-500 });
	},
	look_at_equator_0: function () {
		lookAt({ x:0.001, y:-500, z:0.001 });
	},
	look_at_equator_90: function () {
		lookAt({ x:500, y:0.001, z:0.001 });
	},
	look_at_equator_180: function () {
		lookAt({ x:0.001, y:500, z:0.001 });
	},
	look_at_equator_270: function () {
		lookAt({ x:-500, y:0.001, z:0.001 });
	},
	focus_planet_1: function () {api.camera.focusPlanet(0)},
	focus_planet_2: function () {api.camera.focusPlanet(1)},
	focus_planet_3: function () {api.camera.focusPlanet(2)},
	focus_planet_4: function () {api.camera.focusPlanet(3)},
	focus_planet_5: function () {api.camera.focusPlanet(4)},
	focus_planet_6: function () {api.camera.focusPlanet(5)},
	focus_planet_7: function () {api.camera.focusPlanet(6)},
	focus_planet_8: function () {api.camera.focusPlanet(7)},
	focus_planet_9: function () {api.camera.focusPlanet(8)},
	focus_planet_10: function () {api.camera.focusPlanet(9)},
	focus_planet_11: function () {api.camera.focusPlanet(10)},
	focus_planet_12: function () {api.camera.focusPlanet(11)},
	focus_planet_13: function () {api.camera.focusPlanet(12)},
	focus_planet_14: function () {api.camera.focusPlanet(13)},
	focus_planet_15: function () {api.camera.focusPlanet(14)},
	focus_planet_16: function () {api.camera.focusPlanet(15)},
	vision_all_players: function () { model.visionSelectAll() },
	vision_player_1: function (event) { model.visionSelect(0, event) },
	vision_player_2: function (event) { model.visionSelect(1, event) },
	vision_player_3: function (event) { model.visionSelect(2, event) },
	vision_player_4: function (event) { model.visionSelect(3, event) },
	vision_player_5: function (event) { model.visionSelect(4, event) },
	vision_player_6: function (event) { model.visionSelect(5, event) },
	vision_player_7: function (event) { model.visionSelect(6, event) },
	vision_player_8: function (event) { model.visionSelect(7, event) },
	vision_player_9: function (event) { model.visionSelect(8, event) },
	vision_player_10: function (event) { model.visionSelect(9, event) },
	vision_previous_player: function (event) {
		const current = _.indexOf(model.playerVisionFlags(), 1);
		if (current == -1) {
			model.visionSelect(0, event);
			return;
		}

		model.visionSelect((current + model.playerVisionFlags().length - 1) % model.playerVisionFlags().length, event);
	},
	vision_next_player: function (event) {
		const current = _.indexOf(model.playerVisionFlags(), 1);
		if (current == -1) {
			model.visionSelect(0, event);
			return;
		}

		model.visionSelect((current + 1) % model.playerVisionFlags().length, event);
	},
	select_all_bots_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_all_tanks_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_all_orbital_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_all_combat_orbital_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_all_orbital_factories_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_all_advanced_factories_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_all_fighters_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_all_air_transports_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_all_scouts_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_all_radar_on_screen: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	select_matching_on_screen_then_planet: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	only_one_in_selection: function (event, desc) {
		if (_.isUndefined(desc)) desc = unique;
		dt_lastEvent = event;
		const now = new Date().getTime();
		const isDouble = (desc === dt_firstDesc) && (now < dt_doubleTime);
		dt_reset(desc, now);
		if (isDouble) return double(event, desc);
		else return single(event, desc);
	},
	halve_selection: function () {
		if (!model.selection()) return;
		const units = _.flatten(_.toArray(model.selection().spec_ids).map(function (units) {
			const n = Math.ceil(units.length / 2);
			return _.sample(units, n);
		}));
		engine.call("select.byIds", units);
	},
	only_construction_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Construction", null, false);
	},
	remove_construction_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Construction", null, true);
	},
	only_bots_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Bot", null, false);
	},
	remove_bots_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Bot", null, true);
	},
	only_tanks_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Tank", null, false);
	},
	remove_tanks_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Tank", null, true);
	},
	only_heavies_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Heavy", null, false);
	},
	remove_heavies_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Heavy", null, true);
	},
	only_land_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Land", null, false);
	},
	remove_land_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Land", null, true);
	},
	only_air_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Air", null, false);
	},
	remove_air_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Air", null, true);
	},
	only_fighters_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Fighter", null, false);
	},
	remove_fighters_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Fighter", null, true);
	},
	only_transports_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Transport", null, false);
	},
	remove_transports_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Transport", null, true);
	},
	only_scouts_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Scout", null, false);
	},
	remove_scouts_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Scout", null, true);
	},
	only_naval_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Naval", null, false);
	},
	remove_naval_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Naval", null, true);
	},
	only_orbital_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Orbital", null, false);
	},
	remove_orbital_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Orbital", null, true);
	},
	only_advanced_in_selection: function () {
		api.select.fromSelectionWithTypeFilter("Advanced", null, false);
	},
	remove_advanced_from_selection: function () {
		api.select.fromSelectionWithTypeFilter("Advanced", null, true);
	},
	end_fab_mode: function () {
		self.mode("default");
		api.arch.endFabMode();
		self.currentBuildStructureId("");
	},
	open_option_menu: function () {
		if (!model.menuIsOpen()) {
			model.toggleMenu();
		}
	},
	close_option_menu: function () {
		if (self.menuIsOpen()) self.toggleMenu();
	},
	toggle_option_menu: function () {
		if (self.saving()) return;

		self.menuIsOpen(!self.menuIsOpen());

		if (self.menuIsOpen()) engine.call("push_mouse_constraint_flag", false);
		else engine.call("pop_mouse_constraint_flag");
	},
	clear_build_sequence: function () {
		self.activeBuildGroup(null);
		self.activeBuildGroupLocked(false);
		self.activatedBuildId("");
		remove_keybinds("build");
		api.panels.build_bar.message("clear_build_sequence");
	},
	cancel_selection: function () {
		api.select.empty();
		model.selection(null);
	},
	close_chronocam: function () { model.showTimeControls(false) },
	end_command_mode: function () {
		self.cmdIndex(-1);
		self.mode("default");
		api.arch.endFabMode();
		self.currentBuildStructureId("");
		api.arch.endAreaCommandMode();
		engine.call("set_command_mode", "");
	},
	navigate_back_no_menu: function () {
		if (model.mode() === "fab") model.endFabMode();
		else if (model.chatSelected()) {
			model.chatSelected(false);
		} else if (model.mode() === "default") {
			if (model.hasSelection()) {
				if (model.activeBuildGroup()) model.clearBuildSequence();
				else {
					api.select.empty();
					model.selection(null);
				}
			} else if (model.showTimeControls()) {
				model.showTimeControls(false);
			}
		} else if (model.mode().startsWith("command_")) model.endCommandMode();
		else model.mode("default");
	},
	copiedSelection: "",
	copySelection: function () {
		model.copiedSelection = model.selection().spec_ids;
		copiedTypes = {};
		api.Panel.message(api.panels.sandbox.id, "copySelection", model.copiedSelection);
	},
	pasteArmyId: undefined,
	spawnExact: function (army, spec, planet, location, orientation) {
		const createJson = {

			army: model.players()[army].id,
			what: spec,
			planet: planet,
			location: location,
			orientation: orientation,
		};
		model.send_message("create_unit", createJson);
	},
	pasteArray: function (unitObject, army, planet, location, raw) {
		const objectKeys = _.keys(unitObject);
		const planetObject = model.planetListState().planets[planet];
		const planetRadius = planetObject.radius;
		const planetBiome = planetObject.biome;

		_.map(objectKeys, function (spec) {
			const unitTypes = getTypes(spec);
			let spawnOffset = 0;
			if (_.contains(unitTypes, "UNITTYPE_Air") && _.contains(unitTypes, "UNITTYPE_Mobile")) {spawnOffset = 50}
			if (_.contains(unitTypes, "UNITTYPE_Orbital") && !_.contains(unitTypes, "UNITTYPE_Land")) {spawnOffset = 400}
			if (planetBiome == "gas") {spawnOffset = 0}
			const offsetMultiplier = 1 + (spawnOffset / planetRadius);
			const spawnLocation = (raw && raw.ok == true && spawnOffset < 400) ? raw.pos : location;
			const newLocation = [spawnLocation[0] * offsetMultiplier, spawnLocation[1] * offsetMultiplier, spawnLocation[2] * offsetMultiplier];
			for (let n = 0; n < unitObject[spec].length; n++) {
				model.spawnExact(army, spec, planet, newLocation, [0, 0, 0]);
			}
		});
	},
	pasteSelection: function () {
		if (typeof model.sandbox !== "function" || !model.sandbox()) return;
		if (model.scenarioModel !== undefined) return;
		if (model.pasteArmyId() == -1) return;
		if (_.keys(model.copiedSelection).length < 1) return;

		// document mousemove can be stale if another panel captured the mouse
		let cx = cursor_x, cy = cursor_y;
		if (typeof api !== "undefined" && api.input && api.input.mouse) {
			const mx = (typeof api.input.mouse.x === "function") ? api.input.mouse.x() : api.input.mouse.x;
			const my = (typeof api.input.mouse.y === "function") ? api.input.mouse.y() : api.input.mouse.y;
			if (typeof mx === "number" && typeof my === "number" && mx >= 0 && my >= 0) { cx = mx; cy = my }
		}
		if (cx < 0 || cy < 0) return;
		if (!model.holodeck || !model.holodeck.raycastTerrain) return;

		model.holodeck.raycastTerrain(cx, cy).then(function (loc3D) {
			if (!loc3D || !loc3D.pos) return;
			// prefer planet from the raycast hit; fall back to camera focus
			let planet = (typeof loc3D.planet === "number") ? loc3D.planet : null;
			if (planet === null && api && api.camera && typeof api.camera.getFocus === "function") {
				const focus = api.camera.getFocus(model.holodeck.id);
				if (focus && typeof focus.planet === "function") planet = focus.planet();
			}
			if (planet === null || planet < 0) return;
			engine.call("worldview.fixupBuildLocations", 0, "/pa/units/land/assault_bot/assault_bot.json", 0, JSON.stringify([loc3D])).then(function (raw) {
				raw = JSON.parse(raw);
				model.pasteArray(model.copiedSelection, model.pasteArmyId(), planet, loc3D.pos, raw[0]);
			});
		});
	},
	toggleSandboxMenu: function () {
		api.Panel.message(api.panels.sandbox.id, "toggleMenu", true);
	},
	copy_factory_orders: function () {
	},
	test_move: function () {
		const selection = model.selection();
		if (!selection) return;
		const units = _.flatten(_.toArray(selection.spec_ids));
		return api.getWorldView(0).sendOrder({
			units: units,
			command: "move",
			location: {
				planet: model.currentFocusPlanetId(),
				pos: [1, 2, 3],
			},
		});
	},
	cycle_radars: function () {
		radarType = (radarType + 1) % 2;
		const planet_id = model.currentFocusPlanetId();
		if (radarType) {
			mySelect.unitsOnPlanet(planet_id, ["Recon", "Structure"]); // ARKYD, Advanced Radar Satellite
			mySelect.unitsOnPlanet(planet_id, ["NukeDefense", "Structure"], null, "add"); // Anti-nuke
			mySelect.unitsOnPlanet(planet_id, ["Defense", "Naval", "Structure"], ["Land"], "add"); // Torpedo Launchers
		} else {
			mySelect.unitsOnPlanet(planet_id, ["Recon"], ["Structure"]); // Radars
			mySelect.unitsOnPlanet(planet_id, ["Amphibious", "Heavy"], ["Structure"], "add"); // Manhattan
			mySelect.unitsOnPlanet(planet_id, ["Radar", "RadarJammer"], ["Structure"], "add"); // Nyx
			mySelect.unitsOnPlanet(planet_id, ["Radar", "Naval"], ["Structure"], "add"); // Stingray
		}
	},
	select_all_fabbers: function () {
		const zoomLevel = api.camera.getFocus(api.Holodeck.focused.id).zoomLevel();
		if (zoomLevel !== "orbital" && zoomLevel !== "celestial") {
			mySelect.unitsOnPlanet(model.currentFocusPlanetId(), "Fabber", "Orbital");
		} else {
			mySelect.unitsOnPlanet(model.currentFocusPlanetId(), ["Fabber", "Orbital"]);
		}
	},
	select_all_idle_fabbers: function () {
		const zoomLevel = api.camera.getFocus(api.Holodeck.focused.id).zoomLevel();
		if (zoomLevel !== "orbital" && zoomLevel !== "celestial") {
			mySelect.idleFabbers(model.currentFocusPlanetId(), null, "Orbital");
		} else {
			mySelect.idleFabbers(model.currentFocusPlanetId(), "Orbital");
		}
	},
	select_all_scouts: function () {
		mySelect.unitsOnPlanet(model.currentFocusPlanetId(), "Scout");
	},
	select_all_idle_scouts: function () {
		const worldView = api.getWorldView(0);
		return worldView.getArmyUnits(model.armyIndex(), model.currentFocusPlanetId()).then(function (armyUnits) {
			let scoutIds = [];
			const keys = Object.keys(armyUnits);
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				const unitSpec = model.unitSpecs[key];
				if (unitSpec.types.contains("UNITTYPE_Scout")) {
					scoutIds.push(armyUnits[key]);
				}
			}
			scoutIds = _.flatten(scoutIds);
			return worldView.getUnitState(scoutIds).then(function (scouts) {
				const idle_scouts = [];
				console.log(scouts.length, scoutIds.length);
				for (let i = 0; i < scouts.length; i++) {
					if (!scouts[i].orders) {
						idle_scouts.push(scoutIds[i]);
					}
				}
				mySelect.unitsById(idle_scouts);
				return idle_scouts;
			});
		});
	},
	select_all_repair: function () {
		const planet_id = model.currentFocusPlanetId();
		mySelect.unitsOnPlanet(planet_id, ["CannonBuildable", "Construction"], ["Fabber"]);
		mySelect.unitsOnPlanet(planet_id, ["Air", "MissileDefense"], null, "add");
	},
	select_closest_unit: function () { [native_code] },
	select_2_closest_units: function () { [native_code] },
	select_3_closest_units: function () { [native_code] },
	select_4_closest_units: function () { [native_code] },
	select_closest_structure: function () { [native_code] },
	select_2_closest_structures: function () { [native_code] },
	select_3_closest_structures: function () { [native_code] },
	select_4_closest_structures: function () { [native_code] },
	select_closest_fabber: function () { [native_code] },
	select_2_closest_fabbers: function () { [native_code] },
	select_3_closest_fabbers: function () { [native_code] },
	select_4_closest_fabbers: function () { [native_code] },
	select_closest_idle_fabber: function () { [native_code] },
	select_2_closest_idle_fabbers: function () { [native_code] },
	select_3_closest_idle_fabbers: function () { [native_code] },
	select_4_closest_idle_fabbers: function () { [native_code] },
	select_closest_unit_in_selection: function () {
		const selection = model.selection();
		if (!selection) return;
		const camPos = api.camera.getFocus(api.Holodeck.focused.id).location();
		// var camPosN = normalizeVector(camPos.x, camPos.y, camPos.z); // normalize because the camera constantly shift between surface position and normalized position
		const units = _.flatten(_.toArray(selection.spec_ids));
		return api.getWorldView(0).getUnitState(units).then(function (unitStates) {
			unitStates.forEach(function (unitState, i) {
				unitState.id = units[i];
				const unitPos = unitState.pos;
				// var unitPosN = normalizeVector(unitPos[0], unitPos[1], unitPos[2]);
				// unitState.distanceToCamera = distance3d(camPosN, unitPosN);
				unitState.distanceToCamera = distance3d(camPos, unitPos);
			});
			unitStates.sortValuesSimple(function (unitState) { return unitState.distanceToCamera });
			mySelect.unitsById(unitStates.map(function (unitState) { return unitState.id }).slice(0, 1));
			return unitStates;
		});
	},
	only_artillery_in_selection: function () { return mySelect.unitsfromSelection("Artillery") },
	remove_artillery_from_selection: function () { return mySelect.unitsfromSelection("Artillery", null, "remove") },
	only_anti_air_in_selection: function () { return mySelect.unitsfromSelection("AirDefense") },
	remove_anti_air_in_selection: function () { return mySelect.unitsfromSelection("AirDefense", null, "remove") },
	only_repair_in_selection: function () {
		mySelect.captureGroup(0);
		mySelect.recallGroupWithTypeFilter(0, ["CannonBuildable", "Construction"], ["Fabber"]);
		mySelect.recallGroupWithTypeFilter(0, ["Air", "MissileDefense"], null, "add");
		mySelect.forgetGroup(0);
	},
	remove_repair_from_selection: function () {
		mySelect.unitsfromSelection(["CannonBuildable", "Construction"], null, "remove");
		mySelect.unitsfromSelection(["Air", "MissileDefense"], null, "remove");
	},
	send_message: function (message, payload, respond) {
		const m = {};
		if (!_.isUndefined(payload)) m.payload = payload;

		m.message_type = message;
		if (respond) {
			m.response_key = ++response_key;
			responses[m.response_key] = respond;
		}

		engine.call("conn_send_message", JSON.stringify(m));
	},
	disconnect: function () {
		ko.observable().extend({ session: "current_system_tutorial" })(null);
		engine.call("reset_game_state");
	},
	exit: function () {
		engine.call("exit");
	},
	unitSpecs: "[object Object]",
	pasteUnits: function (n) {
		if (!model.cheatAllowCreateUnit()) return;
		if (n < 1) return;
		if (!selectedUnit() || selectedUnit() == "") return;
		if (armyIndex() == -1) return;

		const drop = {
			army: model.players()[armyIndex()].id,
			what: selectedUnit(),
		};

		mouse.raycast().then(function (center) {
			// console.log(result, )
			if (!center.pos) return;
			pasteUnits3D(n, drop, center);
		}, function () {console.log("paste raycast fail")});
	},
	pasteUnits3D: function (n, config, center) {
		if (!model.cheatAllowCreateUnit()) return;
		if (n < 1) return;
		if (!config.what || config.what == "") return;

		inFormation(mouse.hdeck.view, center, n, config.what)
		.then(function (locations) {
			bulk_paste.pasteUnitLocations(locations, config.army);
		}, function () {console.log("past inFormation fail")});
	},
	bulkPasteCount: undefined,
	bulkPaste: function () {
		model.pasteUnits(model.bulkPasteCount());
		showPreview(false);
	},
	bulkPastePreviewToggle: function () {
		showPreview(!showPreview());
	},
	bulkPastNextFormation: function () {
		bcu.nextFormation();
		showPreview(true);
	},
};

var str = "const model = {\n"
Object.keys(model).forEach(function (key) {
	var value = model[key]
	var valueStr = value.toString()
	if (valueStr === "[object Object]") {
		try {
			valueStr = JSON.stringify(value)
		} catch (e) {
			valueStr = '"[object Object]"'
		}
	} else if (valueStr === "function () { [native code] }") {
		valueStr = 'function () { [native_code] }'
	} else if (!valueStr) {
		valueStr = '""'
	}
	str += key + ": " + valueStr + ",\n"
})
str += "}"
api.file.saveDialog("test.txt",str)
