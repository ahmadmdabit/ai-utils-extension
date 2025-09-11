// These functions are designed to be injected into a webpage,
// so they must be self-contained.

export function getHeadings() {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
  return headings
    .map((h) => (h as HTMLElement).innerText.trim())
    .filter(Boolean);
}

export function getLinks() {
  const links = Array.from(document.querySelectorAll('a[href]'));
  return links
    .map((a) => ({
      text: (a as HTMLElement).innerText.trim(),
      href: (a as HTMLAnchorElement).href,
    }))
    .filter(
      (item) => item.text && item.href && !item.href.startsWith('javascript:'),
    );
}

export function getTables() {
  const tables = Array.from(document.querySelectorAll('table'));
  return tables.map((table) => {
    const rows = Array.from(table.querySelectorAll('tr'));
    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      return cells.map((cell) => (cell as HTMLElement).innerText.trim());
    });
  });
}
