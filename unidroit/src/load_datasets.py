"""Regenerate public/result.json from the project's Google Sheet.

Reads the three source tabs (legislative texts, the text-principle bridge, and
UNIDROIT principles), joins them into one row per text-principle connection, and
writes the result as JSON for the frontend to fetch. Run it directly; the output
path is resolved relative to this file, so the working directory does not matter.
"""

from pathlib import Path

import pandas as pd  # type: ignore[reportMissingModuleSource]

SHEET_ID = "1xbav3keP8A6UWtpj9vCshVaVPzP_DoE3_qWZaX3yZfA"
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "public" / "result.json"


def sheet_url(sheet_name: str) -> str:
    """URL that exports one tab of the Google Sheet as CSV."""
    return f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={sheet_name}"


def main() -> None:
    texts = pd.read_csv(sheet_url("legislative_texts"))
    bridge = pd.read_csv(sheet_url("merged"))
    principles = pd.read_csv(sheet_url("unidroit_principles"))

    # The bridge carries the foreign keys; the other tables supply the
    # human-readable columns. Renaming "id"/"title" keeps both joins unambiguous.
    result = (
        bridge
        .merge(texts.rename(columns={"id": "text_id", "title": "text_title"}), on="text_id")
        .merge(principles.rename(columns={"id": "principle_id", "title": "principle_title"}), on="principle_id")
    )

    result.to_json(OUTPUT_PATH, orient="records", indent=2, force_ascii=False)


if __name__ == "__main__":
    main()
