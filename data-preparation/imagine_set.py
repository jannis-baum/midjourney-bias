import os
import re
import pandas as pd

def set_from(path: str, protected_label: str, expected_proportion: float) -> pd.DataFrame:
    df = pd.read_csv(path)
    # sort so that all entries with protected label are first
    df.sort_values(by='labels_human', inplace=True, key=lambda ls: ls != protected_label)

    expected_protected = int(len(df) * expected_proportion)

    # 1 if Midjourney created the protected group
    scores = [int(i == protected_label) for i in df['labels_human']]
    # expected_protected number of protected individuals, the rest as generated
    labels = [1] * expected_protected + scores[expected_protected:]
    return pd.DataFrame({
        # assume prompt is filename of csv
        'prompt': [re.sub(r'\.csv$', '', os.path.basename(path))] * len(df),
        'score': scores,
        'label': labels
    })
