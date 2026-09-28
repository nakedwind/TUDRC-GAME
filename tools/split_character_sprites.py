from pathlib import Path
from shutil import copy2
import sys

from PIL import Image, ImageChops


CHARACTER_ROOT = Path(__file__).resolve().parents[1] / "images" / "character"
FRAME_SIZE = 64
SHEET_SIZE = (320, 192)

SHEETS = {
    "amber_A": "character_amber_A.png",
    "amber_B": "character_amber_B.png",
    "chris_A": "character_ChrisA.png",
    "chris_B": "character_ChrisB.png",
    "claire_A": "character_ClaireA.png",
    "luther_A": "character_Luther_A.png",
    "luther_B": "character_Luther_B.png",
    "muomn_A": "character_MuomnA.psd",
    "noah_A": "character_noahA.png",
    "noah_B": "character_noah_B.png",
    "theonie_A": "character_Theonie_A.png",
    "theonie_B": "character_Theonie_B.png",
}

FRAME_NAMES = (
    "0000_Front",
    "0001_Front-Walking01",
    "0002_Front-Walking02",
    "0003_Leftside",
    "0004_Leftside-walking01",
    "0005_Leftside-walking02",
    "0006_right-side",
    "0007_right-side-walking01",
    "0008_right-side-walking02",
    "0009_back",
    "0010_back-walking01",
    "0011_back-walking02",
    "0012_closeeyes03",
    "0013_closeeyes02",
    "0014_closeeyes01",
)

FRAME_POSITIONS = (
    (0, 0), (0, 1), (0, 2),
    (1, 0), (1, 1), (1, 2),
    (2, 0), (2, 1), (2, 2),
    (3, 0), (3, 1), (3, 2),
    (4, 2), (4, 1), (4, 0),
)


def split_sheet(folder_name: str, source_name: str) -> None:
    source_path = CHARACTER_ROOT / source_name
    target_dir = CHARACTER_ROOT / folder_name
    target_dir.mkdir(exist_ok=True)

    with Image.open(source_path) as sheet:
        if sheet.size != SHEET_SIZE:
            raise ValueError(
                f"{source_name}: expected {SHEET_SIZE}, got {sheet.size}"
            )

        character, outfit = folder_name.rsplit("_", 1)
        prefix = f"{character}{outfit}_"

        for frame_name, (column, row) in zip(FRAME_NAMES, FRAME_POSITIONS):
            left = column * FRAME_SIZE
            top = row * FRAME_SIZE
            frame = sheet.crop(
                (left, top, left + FRAME_SIZE, top + FRAME_SIZE)
            )
            frame.save(target_dir / f"{prefix}{frame_name}.png")

    # Keep the top-level source as a backup and place a copy with its frames.
    copy2(source_path, target_dir / source_name)

    with Image.open(source_path) as sheet:
        for frame_name, (column, row) in zip(FRAME_NAMES, FRAME_POSITIONS):
            left = column * FRAME_SIZE
            top = row * FRAME_SIZE
            expected = sheet.crop(
                (left, top, left + FRAME_SIZE, top + FRAME_SIZE)
            )
            output_path = target_dir / f"{prefix}{frame_name}.png"
            with Image.open(output_path) as output:
                if output.size != (FRAME_SIZE, FRAME_SIZE):
                    raise ValueError(f"{output_path.name}: incorrect frame size")
                if ImageChops.difference(expected, output).getbbox() is not None:
                    raise ValueError(f"{output_path.name}: pixels do not match source")

    print(f"{folder_name}: created and verified 15 frames")


def main() -> None:
    selected = sys.argv[1:] or list(SHEETS)
    unknown = [folder_name for folder_name in selected if folder_name not in SHEETS]
    if unknown:
        raise ValueError(f"Unknown character folders: {', '.join(unknown)}")
    for folder_name in selected:
        source_name = SHEETS[folder_name]
        split_sheet(folder_name, source_name)


if __name__ == "__main__":
    main()
