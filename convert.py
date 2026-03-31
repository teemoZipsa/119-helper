import re

html_file = r"c:\Users\arasoftGJ_01\119-helper\stitch_template.html"
with open(html_file, "r", encoding="utf-8") as f:
    html = f.read()

# find body tag
body_match = re.search(r'<body(.*?)>(.*)</body>', html, re.DOTALL | re.IGNORECASE)
if not body_match:
    print("Body not found")
    exit(1)

body_attrs = body_match.group(1)
inner_html = body_match.group(2)

# Extract class
class_match = re.search(r'class="([^"]+)"', body_attrs)
body_class_str = class_match.group(1) if class_match else ""

# Convert class to className
inner_html = inner_html.replace('class="', 'className="')

# Adjust common React JSX style issues
inner_html = re.sub(r'style="([^"]+)"', r'style={{\1}}', inner_html)

# Fix specific style objects manually
inner_html = inner_html.replace('style={{font-variation-settings: \'FILL\' 1;}}', "style={{fontVariationSettings: \"'FILL' 1\"}}")
inner_html = inner_html.replace('style={{width: 88%}}', 'style={{width: "88%"}}')
inner_html = inner_html.replace('style={{width: 12%}}', 'style={{width: "12%"}}')
inner_html = inner_html.replace('style={{width: 72%}}', 'style={{width: "72%"}}')
inner_html = inner_html.replace('style={{width: 100%}}', 'style={{width: "100%"}}')
inner_html = inner_html.replace('style={{width: 34%}}', 'style={{width: "34%"}}')

# self close tags
def self_close(m):
    return m.group(0)[:-1] + " />"

inner_html = re.sub(r'<(img|input|hr|br|path)[^>]*?(?<!/)>', self_close, inner_html)
inner_html = inner_html.replace('viewbox="', 'viewBox="')
inner_html = inner_html.replace('stroke-width="', 'strokeWidth="')

# Create React component
app_tsx = f"""import React from 'react';

export default function App() {{
  return (
    <div className="{body_class_str}">
      {{/* Extracted from Stitch */}}
      {inner_html}
    </div>
  );
}}
"""

with open(r"c:\Users\arasoftGJ_01\119-helper\src\App.tsx", "w", encoding="utf-8") as f:
    f.write(app_tsx)

print("Conversion complete.")
