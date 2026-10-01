"""Regression tests for static Markdown parsing; these do not test Nemp runtime."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('check_docs', ROOT / 'scripts/check_docs.py')
DOCS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DOCS)


class ParserTests(unittest.TestCase):
    def test_shorter_fence_does_not_close(self):
        text = 'before\n````text\n```\n[example](not-a-file)\n````\nafter'
        self.assertEqual(DOCS.prose(text), 'before\nafter')

    def test_info_string_does_not_close(self):
        text = 'before\n```text\n```python\n[example](not-a-file)\n```\nafter'
        self.assertEqual(DOCS.prose(text), 'before\nafter')

    def test_wrong_marker_does_not_close(self):
        text = 'before\n~~~text\n```\n[example](not-a-file)\n~~~~\nafter'
        self.assertEqual(DOCS.prose(text), 'before\nafter')

    def test_longer_fence_with_whitespace_closes(self):
        self.assertEqual(DOCS.prose('```\nexample\n````  \nafter'), 'after')

    def test_frontmatter_keeps_inline_dashes(self):
        text = '---\ndescription: "left --- right"\n---\nbody'
        self.assertEqual(DOCS.frontmatter(text), 'description: "left --- right"')

    def test_frontmatter_requires_standalone_close(self):
        for text in ['---\ndescription: value', '---\ndescription: value\n--- body']:
            self.assertEqual(DOCS.frontmatter(text), '')

    def test_body_description_cannot_replace_frontmatter(self):
        text = 'body\n---\ndescription: value\n---\n'
        self.assertEqual(DOCS.frontmatter(text), '')

    def test_repository_reads_are_explicit_utf8(self):
        original = Path.read_text
        encodings = []

        def checked_read(path, *args, **kwargs):
            encodings.append(kwargs.get('encoding'))
            return original(path, *args, **kwargs)

        with patch.object(Path, 'read_text', checked_read):
            errors, _ = DOCS.check(ROOT)
        self.assertEqual(errors, [])
        self.assertTrue(encodings)
        self.assertTrue(all(value == 'utf-8' for value in encodings))


if __name__ == '__main__':
    unittest.main()
