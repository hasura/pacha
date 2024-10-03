from enum import Enum
from typing import Optional


ENDC = '\033[0m'


class Colors(Enum):
    MAGENTA = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def output(text: str, color: Colors, end = '\n'):
    print(f"{color.value}{text}{ENDC}{end}")


def multi_line_input(prompt: str, color: Colors) -> str:
    print(f"{color.value}{prompt}:{ENDC} ", end='')
    lines = []
    while True:
        try:
            line = input()
            if line:
                lines.append(line)
            else:
                break
        except EOFError:
            break
    return '\n'.join(lines)


def single_line_input(prompt: str, color: Colors) -> str:
    print(f"{color.value}{prompt}:{ENDC} ", end='')
    return input()
