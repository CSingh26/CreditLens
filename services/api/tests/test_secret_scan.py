from pathlib import Path
from runpy import run_path


def test_secret_scan_reports_path_without_exposing_matched_value(tmp_path):
    scanner = run_path(str(Path(__file__).resolve().parents[3] / 'scripts/check_secrets.py'))
    safe = tmp_path / 'safe.txt'
    suspect = tmp_path / 'suspect.txt'
    safe.write_text('API_KEY=replace-me')
    suspect.write_text('ghp_' + 'A' * 40)
    assert scanner['suspect_files']([safe, suspect]) == [str(suspect)]
