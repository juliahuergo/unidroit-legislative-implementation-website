"""
Download csv to pandas DataFrames.
Clean the Dfs and make them into the correct columns to be automated.
"""

import pandas as pd  # type: ignore[reportMissingModuleSource]

SHEET_ID = "1xbav3keP8A6UWtpj9vCshVaVPzP_DoE3_qWZaX3yZfA"

def sheet_url(sheet_name):
    return f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={sheet_name}"

def main():
    

    #Load
    df_texts = pd.read_csv(sheet_url("legislative_texts"), sep=',')
    df_merged = pd.read_csv(sheet_url("merged"), sep=',')
    df_principles = pd.read_csv(sheet_url("unidroit_principles"), sep=',')

    #Merge (one row per text-principle connection)
    result = (
        df_merged
        .merge(
            df_texts.rename(columns={'id': 'text_id', 'title': 'text_title'}),
            on='text_id'
        )
        .merge(
            df_principles.rename(columns={'id': 'principle_id', 'title': 'principle_title'}),
            on='principle_id'
        )
    )
    
    #Converting DataFrame to JSON
    result.to_json('unidroit/public/result.json', orient="records", indent=2, force_ascii=False)



if __name__ == "__main__":
    main()


