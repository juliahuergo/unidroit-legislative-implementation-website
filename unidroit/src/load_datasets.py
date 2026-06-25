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
import json
import time
from urllib import parse, request

address = 'https://docs.google.com/spreadsheets/d/1xbav3keP8A6UWtpj9vCshVaVPzP_DoE3_qWZaX3yZfA/export?format=csv&gid='
GID_TEXTS = '1250231207'
GID_PRINCIPLES = '1194899847'
GID_MERGED = '1278693588'
CACHE_PATH = Path(__file__).resolve().parent / "geocode_cache.json"
NOMATIM_URL = 'https://nominatim.openstreetmap.org/search'
USER_AGENT = 'https://github.com/juliahuergo/unidroit-legislative-implementation-website.git'

def geocode(name):
    """For a given jurisdiction, returns [lat, lon]."""

    url = f"{NOMATIM_URL}?{parse.urlencode({"q": name, "format": "json", "limit": 1})}"
    req = request.Request(url, headers={"User-Agent": USER_AGENT}) 
    
    with request.urlopen(req, timeout=30) as resp:
        r = json.load(resp)

    if len(r) == 0:
        return None
    return [float(r[0]["lat"]), float(r[0]["lon"])]

def geocode_jurisdictions(names):
    """Given a list of jurisdictions, adds the [lat, lon] for those not present in geocode_cache.json.
    Returns a dict with all the jurisdiction:[lat, lon] pairs."""

    if CACHE_PATH.exists():
        coords = json.loads(CACHE_PATH.read_text(encoding='utf-8'))
    else:
        coords = {}

    changed = False
    for name in sorted({n for n in names if isinstance(n, str) and n}) :
        if name in coords:
            continue
        c = geocode(name)
        if c is None:
            continue
        coords[name] = c
        changed = True
        time.sleep(1) 
    
    if changed:
        CACHE_PATH.write_text(json.dumps(coords, indent=2, ensure_ascii=False))

    return coords

def strip_strings(df):
    str_cols = df.select_dtypes(include='object').columns
    df[str_cols] = df[str_cols].apply(lambda col: col.str.strip())
    return df

def main():
    df_texts = strip_strings(pd.read_csv(address+GID_TEXTS))
    df_unidroit = strip_strings(pd.read_csv(address+GID_PRINCIPLES))
    df_merged = strip_strings(pd.read_csv(address+GID_MERGED))

    result = df_merged.merge(df_texts, on='text_id').merge(df_unidroit, on='principle_id')

    coords = geocode_jurisdictions(result['jurisdiction'])
    result['lat'] = result['jurisdiction'].map(lambda j: (coords.get(j) or [None, None])[0])
    result['lon'] = result['jurisdiction'].map(lambda j: (coords.get(j) or [None, None])[1])

    json_path = Path(__file__).resolve().parent.parent/"public"/"result.json"
    result.to_json(json_path, orient='records', indent=2, force_ascii=False)

if __name__ == "__main__":
    main()