export const createDOMFromHTML = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstChild;
}