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
