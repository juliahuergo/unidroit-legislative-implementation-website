"""
This script reads directly from the Google Spreadsheet where the data is written in
(accessible to 'anyone with the link'), converts to dataframes and merges into one.

Three tables are read: 
- legislative_texts : contains one row per text created/implemented in a foreign jurisdiction
- unidroit_instruments : contains one row per principle/article created by Unidroit
- merged : acts as the connection between the other two tables: has one row per instrument-text connection

After reading the three into Pandas Dataframes, they are merged into the 'result' Dataframe using 
text_id (PK in legislative_texts) and principle_id (PK in unidroit_instruments) as foreign keys
to join by.

This resulting Dataframe is finally converted into a JSON file stored in the folder 'public' to be then used 
by the Javascript, HTML and CSS files.
"""


import pandas as pd
from pathlib import Path

address = 'https://docs.google.com/spreadsheets/d/1xbav3keP8A6UWtpj9vCshVaVPzP_DoE3_qWZaX3yZfA/gviz/tq?tqx=out:csv&sheet='

def main():
    df_texts = pd.read_csv(address+'legislative_texts')
    df_unidroit = pd.read_csv(address+'unidroit_principles')
    df_merged = pd.read_csv(address+'merged')

    result = df_merged.merge(df_texts, on='text_id').merge(df_unidroit, on='principle_id')

    json_path = Path(__file__).resolve().parent.parent/"public"/"result.json"
    result.to_json(json_path, orient='records', indent=2, force_ascii=False)

if __name__ == "__main__":
    main()