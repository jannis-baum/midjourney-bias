#!/usr/bin/env python3

import argparse

import numpy as np
import pandas as pd

from utils import prompt_from

def mj_labels(df: pd.DataFrame) -> np.ndarray:
    return np.concatenate([
        np.array(df[f'labels_mj{i}']) for i in range(1, 5)
    ])

def reference_set(path: str) -> tuple[float, pd.DataFrame]:
    df = pd.read_csv(path)

    total = len(df) * 4
    missing = sum((1 for l in mj_labels(df) if not type(l) is str))
    labelled = total - missing
    labels = [1] * labelled + [0] * missing

    return labelled / total, pd.DataFrame({
        'prompt': [prompt_from(path)] * total,
        'score': labels,
        'label_value': labels
    })

def set_from(path: str, ref: float) -> pd.DataFrame:
    df = pd.read_csv(path)
    total = len(df) * 4
    labelled = int(total * ref)

    ret = pd.DataFrame({
        'prompt': [prompt_from(path)] * total,
        'score': [1 if type(l) is str else 0 for l in mj_labels(df)]
    })
    ret.sort_values(by='score', inplace=True, ascending=False)
    ret['label_value'] = [1] * labelled + [0] * (total - labelled)

    return ret

if __name__ == '__main__':
    parser = argparse.ArgumentParser('describe_set',
         formatter_class=argparse.RawDescriptionHelpFormatter,
         description='''
Prepare dataset to evaluate Midjourney\'s `describe` with Aequitas.''')
    parser.add_argument('sources', type=str, nargs='+', help='Data sets')
    parser.add_argument('--reference', '-r', required=True, help='Reference set for label count')
    parser.add_argument('--out', '-o', help='Output CSV file', default='describe.csv')
    args = parser.parse_args()

    ref, df = reference_set(args.reference)

    df = pd.concat(
        [df] + [set_from(source, ref) for source in args.sources],
        ignore_index=True
    )
    df.to_csv(args.out, index_label='entity_id')
