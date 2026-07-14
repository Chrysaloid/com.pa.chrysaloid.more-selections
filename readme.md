## General info
Based on [**Select Extension**](https://github.com/D1rtySanchez/com.pa.d1rtysanchez.select-extension) by **D1rtySanchez**.

Adds many useful selection keybinds especially selection of N closest units of various types as well as keybinds to copy factory queues between factories.

Below I listed keybinds and explained keybind functions that needed explanation.

"All" selections refer to the currently focused planet.

Some selections (like "Select all fabbers") for some reason don't work after you load a save and only start working when you give some orders to the units. PA's API is at fault here.

## Installation
Unpack zip into `%localappdata%\Uber Entertainment\Planetary Annihilation\client_mods\`. `modinfo.json` should have path `%localappdata%\Uber Entertainment\Planetary Annihilation\client_mods\com.pa.chrysaloid.select-extension\modinfo.json`. When PA's forum will be fixed I'll post it there.

## Factory managment
- **Copy factory queue** - Copies queue of the selected factories. Does not use system clipboard - the queues are saved in mod memory and backed up on disk using localStorage. Each factory type is copied separately. If multiple factories of the same type are selected, queue of the first factory that was selected will be copied.
- **Paste factory queue strict**  - Paste copied queue. Factory types are matched strictly so i.e. Bot Factory queue will not be pasted to Advanced Bot Factory.
- **Paste factory queue unified** - Paste copied queue. Factory types are matched loosely  so i.e. Bot Factory queue will be pasted to Advanced Bot Factory and vice versa. Unit Cannon will accept Bot and Vehicle queues. The queues of similar factories are sorted by time of copying (newest first) so whatever similar factory you have copies last it will be pasted.
- **Print saved factory queue to chat** - The output might be VERY long so be advised.
- **Print selected factory queue to chat** - Print queue of the first selected factory. Note: the unit currently being built is added to the number of queued units in the UI but but the print reflects the real queue. (default keybind: ctrl+f8)
- **Print selected factory queue with spec ids to chat** - Same as above but instead of converting `spec_id` fields to friendly names print them raw* (almost raw: the ubiquitous `"/pa/units/"` is removed from the front of the `spec_id` to make the print more concise). This is mostly for debug purposes, but I left it for the curious ones. (default keybind: ctrl+f9)

Hold `SHIFT` to not replace existing queue and instead add the copied queue to the existing one. To clear queue for a factory type, simply copy a factory that has no queue. If you have copied an empty queue (or not copied one at all) and if you paste the queue it will just clear the current queue (like executing STOP order but without canceling current build).

## Locate units
- **Ping last known enemy commanders' positions**

## Micro managing Astraeuses and Pelicans
The "area load" order is not enough for me as it loads everything in the radius and I wanted to only load powerful units. That's why I created this function. As keybinds don't allow for parameters the pickup unit priority order has to be hardcoded into the keybind. In the future I might add more keybinds in this group.

- **All empty [Astraeuses](https://palobby.com/units/unit/orbital_lander?version=titans) load [Colonels](https://palobby.com/units/unit/bot_support_commander?version=titans) then [Vanguards](https://palobby.com/units/unit/tank_heavy_armor?version=titans) then [Infernos](https://palobby.com/units/unit/tank_armor?version=titans)**
- **All empty [Pelicans](https://palobby.com/units/unit/transport?version=titans) load [Colonels](https://palobby.com/units/unit/bot_support_commander?version=titans) then [Vanguards](https://palobby.com/units/unit/tank_heavy_armor?version=titans) then [Infernos](https://palobby.com/units/unit/tank_armor?version=titans)**
- **All empty [Astraeuses](https://palobby.com/units/unit/orbital_lander?version=titans) load [Infernos](https://palobby.com/units/unit/tank_armor?version=titans) then stitches then [Drifters](https://palobby.com/units/unit/tank_hover?version=titans)**

## Miscellaneous selections
- **Cycle radars** - Cycle between mobile ([ARKYD](https://palobby.com/units/unit/radar_satellite?version=titans), [Advanced Radar Satellite](https://palobby.com/units/unit/radar_satellite_adv?version=titans), [Manhattan](https://palobby.com/units/unit/tank_nuke?version=titans), [Nyx](https://palobby.com/units/unit/tank_jammer?version=titans), [Stingray](https://palobby.com/units/unit/missile_ship?version=titans)) and structure ([Radar](https://palobby.com/units/unit/radar?version=titans), [Advanced Radar](https://palobby.com/units/unit/radar_adv?version=titans), [Anti-Nuke Launcher](https://palobby.com/units/unit/anti_nuke_launcher?version=titans), [Torpedo Launcher](https://palobby.com/units/unit/torpedo_launcher?version=titans), [Advanced Torpedo Launcher](https://palobby.com/units/unit/torpedo_launcher_adv?version=titans)) radars. This is supposed to quickly reveal effective radar range. Unfortunately you cannot select mobile and structure radars at the same time so a cycle keybind is needed.
- **Select all fabbers** - If camera is near the planet select non-orbital fabbers else select orbital fabbers.
- **Select all idle fabbers** - Idle means not performing any orders. The built-in command for this only selected idle fabbers on the screen. This selects all idle fabbers on the planet.
- **Select all scouts** - [Skitter](https://palobby.com/units/unit/land_scout?version=titans), [Firefly](https://palobby.com/units/unit/air_scout?version=titans)
- **Select all idle scouts**
- **Select all land and air repair** - [Stitch](https://palobby.com/units/unit/fabrication_bot_combat?version=titans), [Mend](https://palobby.com/units/unit/fabrication_bot_combat_adv?version=titans), [Angel](https://palobby.com/units/unit/support_platform?version=titans)

## Edit selection
- **Select closest unit in selection**
- **Only artillery in selection** - [Ares](https://palobby.com/units/unit/titan_vehicle?version=titans), [Gil-E](https://palobby.com/units/unit/bot_sniper?version=titans), [Grenadier](https://palobby.com/units/unit/bot_grenadier?version=titans), [Leviathan](https://palobby.com/units/unit/battleship?version=titans), [Sheller](https://palobby.com/units/unit/tank_heavy_mortar?version=titans) if units are selected | [Holkins](https://palobby.com/units/unit/artillery_long?version=titans), [Lob](https://palobby.com/units/unit/artillery_unit_launcher?version=titans), [Pelter](https://palobby.com/units/unit/artillery_short?version=titans), [Unit Cannon](https://palobby.com/units/unit/unit_cannon?version=titans) if structures are selected
- **Remove artillery from selection**
- **Only anti air in selection** - [Narwhal](https://palobby.com/units/unit/frigate?version=titans), [Spinner](https://palobby.com/units/unit/aa_missile_vehicle?version=titans), [Stinger](https://palobby.com/units/unit/bot_aa?version=titans), [Stingray](https://palobby.com/units/unit/missile_ship?version=titans), [Storm](https://palobby.com/units/unit/tank_flak?version=titans) if units are selected | [Flak Cannon](https://palobby.com/units/unit/air_defense_adv?version=titans), [Galata Turret](https://palobby.com/units/unit/air_defense?version=titans) if structures are selected
- **Remove anti air from selection**
- **Only land and air repair in selection**
- **Remove land and air repair from selection**

## Closest selection
- **Select 1-15 closest idle fabbers**
- **Select 1-15 closest fabbers**
- **Select 1-15 closest factories**
- **Select 1-15 closest combat units**

## License
Feel free to copy any of this for your own mods, just put credit when appropriate.

## Credits
- **D1rtySanchez** for creating the base mod that I learned from.
