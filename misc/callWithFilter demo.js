function getOptionFromSelectMode(select_mode) {
    switch (select_mode) {
        case undefined:
        default: return Mousetrap.isShiftDown() ? "add" : "default";
        case "d"      :
        case "default": return "default";
        case "a"      :
        case "add"    : return "add";
        case "r"      :
        case "remove" : return "remove";
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
    /* ... */
    unitsOnScreen: function (planet_id, acceptance_filter, rejection_filter, select_mode) {
        return callWithFilter("select.unitsOnScreenWithTypeFilter", planet_id, acceptance_filter || "Mobile", rejection_filter, select_mode);
    },
    unitsOnPlanet: function (planet_id, acceptance_filter, rejection_filter, select_mode) {
        return callWithFilter("select.unitsOnPlanetWithTypeFilter", planet_id, acceptance_filter || "Mobile", rejection_filter, select_mode);
    },
    /* ... */
};
/* ... */
mySelect.unitsOnPlanet(model.currentFocusPlanetId(), ["Fabber", "Air"]);
mySelect.unitsOnPlanet(model.currentFocusPlanetId(), ["Fabber", "Bot"], null, "add");
