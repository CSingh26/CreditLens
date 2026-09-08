"""Conservative tracked-file credential patterns; prints paths, never secret values."""
from pathlib import Path
import re
import subprocess
import sys

PATTERNS = [
    re.compile(r'AKIA[0-9A-Z]{16}'),
    re.compile(r'gh[pousr]_[A-Za-z0-9]{30,}'),
    re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    re.compile(r'sk-proj-[A-Za-z0-9_-]{30,}'),
]


def suspect_files(paths):
    findings = []
    for path in paths:
        try:
            content = Path(path).read_text()
        except (UnicodeError, OSError):
            continue
        if any(pattern.search(content) for pattern in PATTERNS):
            findings.append(str(path))
    return findings


if __name__ == '__main__':
    paths = subprocess.check_output(['git', 'ls-files', '-z']).decode().split('\0')
    paths = [path for path in paths if path]
    findings = suspect_files(paths)
    print(f'Scanned {len(paths)} tracked files; {len(findings)} credential-pattern findings.')
    for path in findings:
        print(path)
    sys.exit(bool(findings))
