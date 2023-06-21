import numpy as np

def split_images(img: np.ndarray) -> list[np.ndarray]:
    return [
        cell
        for row in np.array_split(img, 2, axis=0)
        for cell in np.array_split(row, 2, axis=1)
    ]

def normalize(doc: str) -> str:
    return ''.join([
        char.lower() for char in doc if char.isalnum() or char.isspace()
    ])

def ansi(code: str): print(f'\x1b[{code}', end='')
def ansi_bold(): ansi('0;1m')
def ansi_faint(): ansi('0;2;3m')
def ansi_reset(): ansi('0m')
def ansi_clear(): ansi('2J'); ansi('H')
