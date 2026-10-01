#!/usr/bin/env python3
"""Static Nemp documentation checks. Does not execute host-agent workflows."""
from __future__ import annotations

import argparse
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


class References(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if key in {'href', 'src'} and value:
                self.urls.append(value)


def prose(text: str) -> str:
    """Remove fenced examples so example-only paths aren't treated as repo links."""
    lines = []
    fence = None
    for line in text.splitlines():
        match = re.match(r'^\s*(`{3,}|~{3,})', line)
        if match:
            marker = match.group(1)[0]
            if fence is None:
                fence = marker
            elif marker == fence:
                fence = None
            continue
        if fence is None:
            lines.append(line)
    return '\n'.join(lines)


def heading_ids(text: str) -> set[str]:
    counts: Counter[str] = Counter()
    ids = set()
    for heading in re.findall(r'^#{1,6}\s+(.+?)\s*#*$', prose(text), re.M):
        slug = re.sub(r'[^\w\- ]', '', heading.lower(), flags=re.UNICODE).replace(' ', '-')
        number = counts[slug]
        counts[slug] += 1
        ids.add(slug if number == 0 else f'{slug}-{number}')
    ids.update(re.findall(r'\bid=["\']([^"\']+)', text))
    return ids


def check(root: Path) -> tuple[list[str], dict[str, int]]:
    errors: list[str] = []
    counts = {'markdown_files': 0, 'relative_links': 0, 'json_files': 0, 'command_files': 0, 'svg_files': 0}
    ignored = {'.git', '.docs-preview', '__pycache__', '.nemp', '.nemp-pro'}
    files = [p for p in root.rglob('*') if p.is_file() and not any(part in ignored for part in p.relative_to(root).parts)]
    for path in files:
        rel = path.relative_to(root)
        if path.suffix == '.json':
            counts['json_files'] += 1
            try:
                json.loads(path.read_text())
            except (ValueError, UnicodeDecodeError) as exc:
                errors.append(f'{rel}: invalid JSON: {exc}')
        if path.suffix == '.svg':
            counts['svg_files'] += 1
            try:
                tree = ET.parse(path)
                if not tree.getroot().tag.endswith('svg'):
                    errors.append(f'{rel}: SVG root missing')
            except ET.ParseError as exc:
                errors.append(f'{rel}: invalid SVG: {exc}')
        if path.suffix != '.md':
            continue
        counts['markdown_files'] += 1
        text = path.read_text()
        body = prose(text)
        html = References()
        html.feed(body)
        refs = re.findall(r'\]\(([^)]+)\)', body) + html.urls
        for ref in refs:
            ref = ref.strip().split(' "', 1)[0].strip('<>')
            url = urlsplit(ref)
            if url.scheme or url.netloc:
                continue
            target = path.parent / unquote(url.path) if url.path else path
            counts['relative_links'] += 1
            if not target.exists():
                errors.append(f'{rel}: missing relative target: {ref}')
            elif url.fragment and target.suffix == '.md':
                if unquote(url.fragment) not in heading_ids(target.read_text()):
                    errors.append(f'{rel}: missing heading anchor: {ref}')
        if path.parent == root / 'commands':
            counts['command_files'] += 1
            front = text.split('---', 2)[1] if text.startswith('---\n') and text.count('---') >= 2 else ''
            if not re.search(r'^description:\s*\S', front, re.M):
                errors.append(f'{rel}: missing command description frontmatter')
            for name in re.findall(r'/nemp:([a-z][a-z-]*)', text):
                if not (root / 'commands' / f'{name}.md').exists():
                    errors.append(f'{rel}: unknown command reference /nemp:{name}')
            if '/nemp-pro:' in text:
                errors.append(f'{rel}: obsolete plugin namespace')
    try:
        plugin = json.loads((root / '.claude-plugin/plugin.json').read_text())
        market = json.loads((root / '.claude-plugin/marketplace.json').read_text())
        entry = next(p for p in market['plugins'] if p['name'] == plugin['name'])
        if plugin['version'] != '0.3.0' or entry['version'] != '0.3.0':
            errors.append('Plugin and marketplace package versions must remain 0.3.0')
        if plugin['description'] != entry['description']:
            errors.append('Plugin and marketplace descriptions differ')
        for field in ('commands', 'skills'):
            if not (root / plugin[field]).is_dir():
                errors.append(f'Plugin {field} directory missing')
    except (OSError, ValueError, KeyError, StopIteration) as exc:
        errors.append(f'Manifest check failed: {exc}')
    readme = (root / 'README.md').read_text()
    if 'Agentic memory that evolves with your work' not in readme:
        errors.append('README tagline missing')
    if 'version-0.3.0-' not in readme:
        errors.append('README package version badge missing')
    if 'Nemp banner' in readme or '100%25-Local' in readme:
        errors.append('README references retired hero or unqualified locality badge')
    for path in (root / 'SKILL.md', root / 'skills/nemp-memory/SKILL.md'):
        text = path.read_text()
        if not text.startswith('---\n') or '\\#' in text or '\\*' in text:
            errors.append(f'{path.relative_to(root)}: malformed skill Markdown/frontmatter')
    activation = (root / 'commands/activate.md').read_text()
    if 'Nemp Pro activated!' in activation or 'All Pro features are now unlocked' in activation:
        errors.append('Activation command falsely claims a working Pro unlock')
    for asset in ['assets/logo/Nemp Logo.png', 'assets/brand/memory-lifecycle.svg']:
        if not (root / asset).is_file():
            errors.append(f'Required brand asset missing: {asset}')
    return errors, counts


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    errors, counts = check(args.root.resolve())
    for error in errors:
        print(f'ERROR: {error}', file=sys.stderr)
    print('Static checks: ' + ', '.join(f'{key}={value}' for key, value in counts.items()))
    print('FAIL' if errors else 'PASS — static repository consistency only; host/runtime tests are separate')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
