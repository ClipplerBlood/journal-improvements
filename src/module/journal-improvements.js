import { getNoteIcon, registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';
import { ImprovedJournalSheet } from './journal/journalSheet.js';
import { ImprovedJournalEntry } from './journal/journalEntry.js';
import { i18n } from './utils.js';
import { _onPaste } from './pasting.js';

// Initialize module
Hooks.once('init', async () => {
  console.log('journal-improvements | Initializing journal-improvements');

  CONFIG.JournalEntry.documentClass = ImprovedJournalEntry;
  Journal.registerSheet('journal-improvements', ImprovedJournalSheet, {
    makeDefault: true,
    label: i18n('journalImprovements.sheetName'),
  });

  game.keybindings.register('journal-improvements', 'paste', {
    name: 'journalImprovements.keybindings.paste',
    restricted: true,
    uneditable: [{ key: 'KeyV', modifiers: [KeyboardManager.MODIFIER_KEYS.CONTROL] }],
    onDown: () => _onPaste(false),
    precedence: CONST.KEYBINDING_PRECEDENCE.DEFERRED,
  });

  game.keybindings.register('journal-improvements', 'pastePlain', {
    name: 'journalImprovements.keybindings.pastePlain',
    restricted: true,
    uneditable: [
      { key: 'KeyV', modifiers: [KeyboardManager.MODIFIER_KEYS.CONTROL, KeyboardManager.MODIFIER_KEYS.SHIFT] },
    ],
    onDown: () => _onPaste(true),
    precedence: CONST.KEYBINDING_PRECEDENCE.DEFERRED,
  });

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();
});

Hooks.once('setup', async () => {});

Hooks.once('ready', async () => {});

Hooks.on('renderNoteConfig', async (app, element, data) => {
  // TODO: fix commented lines
  // if (app.document.getFlag('journal-improvements', 'configured')) return;
  renderNoteConfig(app, element, data);
  // app.document.setFlag('journal-improvements', 'configured', true);
});

function renderNoteConfig(app, element, _data) {
  if (!game.settings.get('journal-improvements', 'pinIcons')) return;
  const fd = new FormDataExtended(app.form);

  const iconSelected = fd.object['icon.selected'];
  const isDefaultIcon = iconSelected == null || iconSelected === 'icons/svg/book.svg';
  if (!isDefaultIcon) return;

  const entryId = fd.object.entryId;
  const pageId = fd.object.pageId;
  if (!entryId || !pageId) return;

  const page = game.journal.get(entryId)?.pages?.get(pageId);
  if (!page) return;

  const improvedIcon = getNoteIcon(page.type);
  if (!improvedIcon) return;

  const imgSelector = element.find('select[name="icon.selected"]');
  const customImgInput = element.find('input[name="icon.custom"]');
  imgSelector.val('');
  customImgInput.val(improvedIcon);
  customImgInput.prop('disabled', false);
}
