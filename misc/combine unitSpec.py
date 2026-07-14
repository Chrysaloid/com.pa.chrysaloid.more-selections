import json
from pathlib import Path

from myLibs.jsonUtils import JSON

ROOT_PATHS = [
	r"G:/Steam Poboczny/steamapps/common/Planetary Annihilation Titans/media/pa/units",
	r"G:/Steam Poboczny/steamapps/common/Planetary Annihilation Titans/media/pa_ex1/units",
]

OUTPUT_FILE = Path(__file__).parent / "combined_unitSpecs.json"

def to_key(root: Path, file: Path) -> str:
	rel = file.relative_to(root).as_posix()
	return "/" + rel

combined = {}

for root_str in ROOT_PATHS:
	root = Path(root_str)
	if not root.is_dir():
		print(f"Skipping missing root: {root}")
		continue

	for file in root.rglob("*.json"):
		if file.stem != file.parent.stem: continue

		key = to_key(root, file).replace("pa_ex1", "pa")

		try:
			spec = JSON.read(file)
		except json.JSONDecodeError as e:
			print(f"Skipping invalid JSON: {file} ({e})")
			continue

		if key in combined:
			print(f"Duplicate key overwritten: {key} (from {file})")

		combined[key] = spec

JSON.write(combined, OUTPUT_FILE, pretty=True, sort_keys=True)

print(f"Combined {len(combined)} unit specs into {OUTPUT_FILE}")
