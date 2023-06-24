import os
import re

# assume prompt is filename of csv
def prompt_from(path: str) -> str:
    return re.sub(r'\.csv$', '', os.path.basename(path))
