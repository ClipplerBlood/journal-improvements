import { ImprovedJournalSheet } from './journal/journalSheet.js';
import { i18n } from './utils.js';

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

  // Parse the text/html
  const textItems = [];
  const type = plain ? 'text/plain' : 'text/html';
  for (const ci of clipboardItems) {
    if (!ci.types.includes(type)) continue;
    let t = await ci.getType(type);
    t = await t.text();
    if (!t) continue;
    textItems.push(t);
  }

  // For each pasted text entry, create a new page in the journal
  for (const ti of textItems) {
    await journal.createQuickPage({ data: { type: 'text', 'text.content': ti } });
  }
  await journal.renderLastPage();

  console.log(clipboardItems, textItems);
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
