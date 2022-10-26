import { ImprovedJournalSheet } from './journal/journalSheet.js';
import { i18n, jiUploadImageBlob } from './utils.js';

export async function _onPaste(plain) {
  console.log(`journal-improvements | _onPaste called with plain = ${plain}`);

  // Check if we are pasting in the journal
  const activeApp = ui.activeWindow;
  if (!(activeApp instanceof ImprovedJournalSheet) || !activeApp.rendered) return;
  const journal = activeApp.document;
  console.log('journal-improvements | pasting in journal');

  // Try to get the clipboard contents
  const clipboardItems = await _getClipboardItems();
  if (!clipboardItems) return;

  // Definitions
  const type = plain ? 'text/plain' : 'text/html';
  const getImgType = (ci) => ci.types.find((t) => t.includes('image'));
  const pasteToPageImage = game.settings.get('journal-improvements', 'pasteToPageImage');
  const parser = new DOMParser();

  for (const ci of clipboardItems) {
    // If the item is not an image, create a journal page with the text or html data
    const imgType = getImgType(ci);
    if (!imgType) {
      const text = await (await ci.getType(type)).text();
      if (!text) continue;
      await journal.createQuickPage({ type: 'text', data: { 'text.content': text } });
      continue;
    }

    // Otherwise, two behaviors, depending on if the image has html or not and if the setting is enabled
    let htmlText;
    if (ci.types.includes('text/html')) htmlText = await (await ci.getType('text/html'))?.text();

    // If no html, image should be uploaded, setting the html text for further processing
    if (!htmlText) {
      const imgBlob = await ci.getType(imgType);
      const src = await jiUploadImageBlob(imgBlob);
      if (!src) throw 'Image Upload failed';
      htmlText = `<img src="${src}">`;
    }

    // If the setting is on, create a new image page with the image's src, otherwise paste the image html in a text page
    if (pasteToPageImage) {
      const parsed = parser.parseFromString(htmlText, 'text/html');
      const imgElement = parsed.querySelector('img');
      const src = imgElement?.src;
      await journal.createQuickPage({ type: 'image', data: { src: src } });
    } else {
      await journal.createQuickPage({ type: 'text', data: { 'text.content': htmlText } });
    }
  }

  await activeApp.renderLastPage();
}

/**
 * Parse the clipboard
 * @return {Promise<ClipboardItem[]>}
 * @private
 */
async function _getClipboardItems() {
  let clipboard;
  try {
    clipboard = await navigator.clipboard.read();
  } catch (error) {
    if (!error) {
      console.warn(i18n('journalImprovements.notifications.warnPastePermission'));
    } else if (error instanceof DOMException) {
      console.log('journal-improvements: Clipboard is empty');
    } else throw error;
  }
  return clipboard;
}
