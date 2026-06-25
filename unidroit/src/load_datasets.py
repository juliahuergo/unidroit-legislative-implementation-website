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

address = 'https://docs.google.com/spreadsheets/d/1xbav3keP8A6UWtpj9vCshVaVPzP_DoE3_qWZaX3yZfA/export?format=csv&gid='
GID_TEXTS = '1250231207'
GID_PRINCIPLES = '1194899847'
GID_MERGED = '1278693588'

def strip_strings(df):
    """Trim leading/trailing whitespace from every text column, so a stray
    space typed in the spreadsheet doesn't split values that should be equal
    (e.g. group a principle title or break a filter option)."""
    str_cols = df.select_dtypes(include='object').columns
    df[str_cols] = df[str_cols].apply(lambda col: col.str.strip())
    return df

def main():
    df_texts = strip_strings(pd.read_csv(address+GID_TEXTS))
    df_unidroit = strip_strings(pd.read_csv(address+GID_PRINCIPLES))
    df_merged = strip_strings(pd.read_csv(address+GID_MERGED))

    result = df_merged.merge(df_texts, on='text_id').merge(df_unidroit, on='principle_id')

    json_path = Path(__file__).resolve().parent.parent/"public"/"result.json"
    result.to_json(json_path, orient='records', indent=2, force_ascii=False)

if __name__ == "__main__":
    main()