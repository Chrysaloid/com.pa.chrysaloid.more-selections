# General info
Based on Select Extension by D1rtySanchez.

Adds many useful selection keybinds especially selection of N closest units of various types as well as keybinds to copy factory queues between factories.

Below I listed keybinds and explained keybind functions that need explanation.

"All" selections refer to the currently focused planet.

Some selections (like "Select all fabbers") for some reason don't work after you load a save and only start working when you give some orgers to the units. PA's API is at fault here

# Installation
Unpack zip into `%localappdata%\Uber Entertainment\Planetary Annihilation\client_mods\`. `modinfo.json` should have path `%localappdata%\Uber Entertainment\Planetary Annihilation\client_mods\com.pa.chrysaloid.select-extension\modinfo.json`

# Factory managment
- Copy factory queue - Copies queue of the selected factories. Does not use system clipboard - the queues are saved in mod memory and backed up on disk using localStorage. Each factory type is copied separately. If multiple factories of the same type are selected, queue of the first factory that was selected will be copied.
- Paste factory queue strict  - Paste copied queue. Factory types are matched strictly so i.e. Bot Factory queue will not be pasted to Advanced Bot Factory.
- Paste factory queue unified - Paste copied queue. Factory types are matched loosely  so i.e. Bot Factory queue will be pasted to Advanced Bot Factory and vice versa. Unit Cannon will accept Bot and Vehicle queues. The queues of similar factories are sorted by time of copying (newest first) so whatever similar factory you have copies last it will be pasted.
- Print saved factory queue to chat - The output might be VERY long so be advised.

Hold SHIFT to not replace existing queue and instead add the copied queue to the existing one. To clear queue for a factory type, simply copy a factory that has no queue. If you have copied an empty queue (or not copied one at all) and if you paste the queue it will just clear the current queue (like executing STOP order but without canceling current build).

# Locate units
- Ping last known enemy commanders positions

# Miscellaneous selections
- Cycle radars - Cycle between mobile (`ARKYD`, `Advanced Radar Satellite`, `Manhattan`, `Nyx`, `Stingray`) and structure (`Radar`, `Advanced Radar`, `Anti-Nuke Launcher`, `Torpedo Launcher`, `Advanced Torpedo Launcher`) radars. This is supposed to quickly reveal effective radar range. Unfortunately you cannot select mobile and structure radars at the same time so a cycle keybind is needed
- Select all fabbers - If camera is near the planet select non-orbital fabbers else select orbital fabbers
- Select all idle fabbers - Idle means not performing any orders
- Select all scouts - `Skitter`, `Firefly`
- Select all idle scouts
- Select all repair - `Stitch`, `Mend`, `Angel`

# Edit selection
- Select closest unit in selection
- Only artillery in selection - `Ares`, `Gil-E`, `Grenadier`, `Leviathan`, `Sheller` if units are selected | `Holkins`, `Lob`, `Pelter`, `Unit Cannon` if structures are selected
- Remove artillery from selection
- Only anti air in selection - `Narwhal`, `Spinner`, `Stinger`, `Stingray`, `Storm` if units are selected | `Flak Cannon`, `Galata Turret` if structures are selected
- Remove anti air from selection
- Only repair in selection
- Remove repair from selection

# Closest selection
- Select 1-15 closest idle fabbers
- Select 1-15 closest fabbers
- Select 1-15 closest factories
- Select 1-15 closest combat units

# License
Feel free to copy any of this for your own mods, just put credit when appropriate

# Credits
- **D1rtySanchez** for creating the base mod
