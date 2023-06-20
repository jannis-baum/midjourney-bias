import os
import re
import subprocess

from utils import normalize
from utils import ansi_bold, ansi_clear, ansi_faint, ansi_reset

root_dir = os.path.dirname(os.path.realpath(__file__))
describe_exe = os.path.join(root_dir, 'describe.scpt')
labels = {
    'female': [r'\bwoman\b', r'\bgirl\b', r'\bfemale\b', r'^f(e(m(a(le?)?)?)?)?$'],
    'male': [r'\bman\b', r'\bboy\b', r'\bmale\b', r'^m(a(le?)?)?$'],
    'other': [r'\bnon-?binary\b', r'^nb$']
}

def find_labels(description: str) -> set[str]:
    return {
        label
        for label, regexes in labels.items()
        if re.search('|'.join(regexes), description)
    }

def prompt_user(prompt: str):
    ansi_bold()
    print(f'{prompt}\n→ ', end='')
    ansi_faint()

def input_mj_labels() -> set[str]:
    prompt_user('Paste Midjourney\'s descriptions and press return.')
    descriptions = list[str]()
    while len(descriptions) < 4:
        inp = input()
        if len(inp) == 0: continue
        descriptions.append(normalize(inp))
    ansi_reset()
    return find_labels(' '.join(descriptions))

def input_human_labels() -> set[str]:
    labels = set()
    while len(labels) == 0:
        prompt_user('Input your own label(s). Must match at least one.')
        labels = find_labels(input())
    ansi_reset()
    return labels

def query_mj_desc(image_path: str):
    ansi_bold()
    print(f'Labelling image {image_path}')
    ansi_reset()
    subprocess.run([describe_exe, image_path], stderr=subprocess.DEVNULL)

def get_all_labels(image_path: str) -> tuple[set[str], set[str]]:
    ansi_clear()
    query_mj_desc(image_path)
    mj = input_mj_labels()
    human = input_human_labels()
    return (mj, human)
