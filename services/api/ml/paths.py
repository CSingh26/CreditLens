"""One artifact root shared by training, serving and isolated test runs."""
import os
from pathlib import Path

ARTIFACTS_DIR = Path(os.environ.get('CREDITLENS_ARTIFACTS_DIR', Path(__file__).resolve().parents[1] / 'artifacts'))
