#!/usr/bin/env python3
"""Validate kit.json or synchronize its embedded copy in style-kit.html. No dependencies."""
import argparse
import json
import re
from pathlib import Path


def validate(kit):
    problems = []
    if kit.get('schemaVersion') != 1:
        problems.append('Unsupported schemaVersion')
    for ratio, expected in [('9:16', [1080, 1920]), ('16:9', [1920, 1080])]:
        fmt = kit.get('formats', {}).get(ratio, {})
        if fmt.get('canvas') != expected:
            problems.append(f'{ratio}: expected canvas {expected}')
            continue
        width, height = expected
        for name, zone in fmt.get('safeZones', {}).items():
            if min(zone['x'], zone['y'], zone['width'], zone['height']) < 0 or zone['x'] + zone['width'] > width or zone['y'] + zone['height'] > height:
                problems.append(f'{ratio}: safe zone {name} is outside the canvas')
        for element in ['titles', 'captions']:
            spec = fmt.get(element, {})
            if not spec or spec.get('fontSize', 0) <= 0 or spec.get('maxLines', 0) < 1:
                problems.append(f'{ratio}: invalid {element} type settings')
                continue
            if spec.get('anchor') != 'top':
                problems.append(f'{ratio}: {element} must use a top anchor')
            for key in ['placement', 'alternative']:
                if key not in spec:
                    continue
                box = spec[key]
                if box['x'] < 0 or box['y'] < 0 or box['width'] <= 0 or box['x'] + box['width'] > width:
                    problems.append(f'{ratio}: {element}.{key} is outside the canvas')
                bottom = box['y'] + spec['fontSize'] * spec['lineHeight'] * spec['maxLines'] + 2 * spec.get('padding', spec.get('outlineWidth', 0))
                if bottom > height:
                    problems.append(f'{ratio}: {element}.{key} exceeds canvas height')
                if bottom > fmt['safeZones']['bottom']['y']:
                    problems.append(f'{ratio}: {element}.{key} reaches the bottom safe zone')
    return problems


def embed(folder, kit):
    page = folder / 'style-kit.html'
    html = page.read_text()
    pattern = r'(<script type="application/json" id="kit">).*?(</script>)'
    blob = json.dumps(kit, ensure_ascii=False, indent=2).replace('</', '<\\/')
    html, count = re.subn(pattern, lambda m: m[1] + '\n' + blob + '\n' + m[2], html, count=1, flags=re.S)
    if count != 1:
        raise ValueError('Missing embedded kit JSON')
    page.write_text(html)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['validate', 'embed'])
    parser.add_argument('folder', nargs='?', default='.')
    args = parser.parse_args()
    folder = Path(args.folder)
    kit = json.loads((folder / 'kit.json').read_text())
    problems = validate(kit)
    if problems:
        raise SystemExit('\n'.join(problems))
    if args.command == 'embed':
        embed(folder, kit)
    print('Kit JSON validated' + (' and HTML synchronized' if args.command == 'embed' else ''))


if __name__ == '__main__':
    main()
