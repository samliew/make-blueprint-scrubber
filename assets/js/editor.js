// Helper functions
// An array of short month names from Jan-Dec, in current locale
const monthsOfYear = [...Array(12)].map((_, i) => {
  const date = new Date(2000, i, 1);
  return date.toLocaleString(undefined, { month: 'short' });
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const toSlug = str => str?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');


// Main
(async () => {

  // If this script is loaded with ".html" extension, redirect to "/"
  if (location.pathname.endsWith('.html')) {
    const url = location.pathname.replace(/[^/]+\.html$/, '');
    history.replaceState(null, null, url + location.search + location.hash);
  }

  const output = document.querySelector('#json-output');

  // EVENT: INPUT - JSON output was changed
  output.addEventListener('input', evt => {
    const json = output.value.trim();
    try {
      let data = JSON.parse(json);
      document.querySelector('#json-output').classList.remove('error');

      // Iterate through data object and remove certain property keys
      const removeKeys = ['restore', 'expect', 'interface', 'parameters', 'zone'];
      const removeProperties = obj => {
        if (obj && typeof obj === 'object') {
          for (const key in obj) {
            if (removeKeys.includes(key)) {
              delete obj[key];
            }
            else {
              removeProperties(obj[key]);
            }
          }
        }
      }
      removeProperties(data);

      document.querySelector('#json-output').value = JSON.stringify(data, null, 0);
    }
    catch (err) {
      document.querySelector('#json-output').classList.add('error');
    }
  });

  /**
   * @summary Copy text to clipboard
   * @param {string | HTMLElement} content text or element to copy
   * @returns {boolean} success
   */
  const copyToClipboard = async content => {
    let success = false;

    // If content is an element, get its value or innerText
    if (content instanceof HTMLElement) {
      content = content.value || content.innerText;
    }

    // Save current focus
    const previousFocusElement = document.activeElement;

    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    Object.assign(textArea.style, {
      position: 'fixed',
      zIndex: -1,
      opacity: 0,
      pointerEvents: 'none'
    });
    textArea.value = content;
    document.body.appendChild(textArea);
    window.focus();
    textArea.focus();
    textArea.select();

    // Method 1
    try {
      if (typeof navigator.clipboard?.writeText === 'function') {
        success = await navigator.clipboard.writeText(content || textArea.value);
      }
    }
    catch (err) { } // ignore errors

    // Method 2
    try {
      if (!success) document.execCommand('copy');
      success = true;
    }
    catch (err) { } // ignore errors

    // Remove temporary textarea and restore previous focus
    document.body.removeChild(textArea);
    previousFocusElement.focus();

    return success;
  };

  // EVENT: CLICK - Copy JSON button
  document.querySelector('#copy-json').addEventListener('click', evt => {
    copyToClipboard(output);
  });

})();