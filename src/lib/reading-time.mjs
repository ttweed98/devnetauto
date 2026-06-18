// Minimal remark plugin: counts words in each post and exposes them
// on frontmatter as `words`, so the layout can show a read-time estimate.
// No external dependencies.

function collectText(node, acc) {
  if (!node) return acc;
  if (typeof node.value === 'string') acc.push(node.value);
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectText(child, acc);
  }
  return acc;
}

export function remarkReadingTime() {
  return function (tree, file) {
    const text = collectText(tree, []).join(' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    file.data.astro.frontmatter.words = words;
  };
}
