#!/usr/bin/env python3

import argparse
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
        'label_value': labels,
        'gender': df['labels_human']
    })

# argparse type
def datasource(arg: str) -> tuple[str, str, float]:
    try:
        splits = arg.split(':')
        source, protected_label = map(str, splits[:2])
        expected_proportion = float(splits[2])
        assert 0 <= expected_proportion <= 1
        return source, protected_label, expected_proportion
    except:
        raise argparse.ArgumentTypeError('Data source must be `souce_file:protected_label:expected_proportion`')

if __name__ == '__main__':
    parser = argparse.ArgumentParser('imagine_set',
         formatter_class=argparse.RawDescriptionHelpFormatter,
         description='''
Prepare dataset to evaluate Midjourney\'s `imagine` with Aequitas.

Creates a CSV file with rows sorted so that protected individuals appear first
for each prompt and columns as follows.

- id: integer for individual 0 to n,
- score: 1 if generated individual is in protected group, 0 if not
- label_value: 1 for first `expected_proportion`% of rows for each prompt, then equal to score
- gender: human-labelled gender''')
    parser.add_argument('sources', type=datasource, nargs='+',
        help='Data source in the form of `souce_file:protected_label:expected_proportion`'
    )
    parser.add_argument('--out', '-o', help='Output CSV file', default='imagine.csv')
    args = parser.parse_args()

    df = pd.concat(
        [set_from(*source) for source in args.sources],
        ignore_index=True
    )
    df.to_csv(args.out, index_label='entity_id')
