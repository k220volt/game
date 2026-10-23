from pathlib import Path
from fontTools import subset

text = ''.join(Path(p).read_text(encoding='utf-8-sig') for p in ['index.html', 'src/main.ts'])
text += ''.join(chr(i) for i in range(32, 127))
options = subset.Options()
options.flavor = 'woff'
font = subset.load_font('art-source/Jua-Regular.ttf', options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
subset.save_font(font, 'public/fonts/Jua-Regular.woff', options)
