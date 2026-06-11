"""
Download csv to pandas DataFrames.
Clean the Dfs and make them into the correct columns to be automated.
"""

import pandas as pd  # type: ignore[reportMissingModuleSource]

def main():
    #Load
    df_texts = pd.read_csv('data/legislative_texts.csv', sep=',')
    df_merged = pd.read_csv('data/merged.csv', sep=',')
    df_principles = pd.read_csv('data/unidroit_principles.csv', sep=',')

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


