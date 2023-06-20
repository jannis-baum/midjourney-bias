#!/usr/bin/env python3

import argparse
import re
import os

import cv2
import numpy as np
import requests

from utils import normalize
from utils import split_images

def download_img(url: str) -> np.ndarray:
    data = requests.get(url, stream=True)
    img = np.asarray(bytearray(data.raw.read()), np.uint8)
    return cv2.imdecode(img, cv2.IMREAD_COLOR)

def prompt_from_url(url: str) -> list[str]:
    return [normalize(word) for word in url.split('/')[-1].split('_')[1:-1]]

if __name__ == '__main__':
    parser = argparse.ArgumentParser('Split Midjourney grid into 4 images')
    parser.add_argument('image_url', help='Discord image URL')
    parser.add_argument('--out', '-o', help='Output directory')
    args = parser.parse_args()

    out = args.out if args.out else 'out'
    prompt = '_'.join(prompt_from_url(args.image_url))
    out = os.path.join(out, prompt)
    os.makedirs(out, exist_ok=True)

    prev_i = max((
        int(re.sub(r'^(\d+)\.png$', r'\1', file))
        for file in os.listdir(out) + ['0.png']
        if re.match(r'^(\d+)\.png', file)
    )) + 1

    img = download_img(args.image_url)
    for i, split in enumerate(split_images(img)):
        path = os.path.join(out, f'{i + prev_i}.png')
        cv2.imwrite(path, split)
