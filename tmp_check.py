from pathlib import Path
text = Path('src/i18n/translations.ts').read_text(encoding='utf-8')
start = text.index('\'loading.pdf.viewer\'', 2000)
print(text[start-100:start+400].encode('unicode_escape').decode())
