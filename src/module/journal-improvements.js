import { getNoteIcon, registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';
import { ImprovedJournalSheet } from './journal/journalSheet.js';
import { ImprovedJournalEntry } from './journal/journalEntry.js';
import { i18n } from './utils.js';

// Initialize module
Hooks.once('init', async () => {
  console.log('journal-improvements | Initializing journal-improvements');

  CONFIG.JournalEntry.documentClass = ImprovedJournalEntry;
  Journal.registerSheet('journal-improvements', ImprovedJournalSheet, {
    makeDefault: true,
    label: i18n('journalImprovements.sheetName'),
  });

  // CONFIG.Note.documentClass = ImprovedNote;

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
});

// Setup module
Hooks.once('setup', async () => {
  // Do anything after initialization but before
  // ready
});

// When ready
Hooks.once('ready', async () => {
  // Do anything once the module is ready
});

Hooks.on('renderNoteConfig', async (app, element, data) => {
  // TODO: fix commented lines
  // if (app.document.getFlag('journal-improvements', 'configured')) return;
  renderNoteConfig(app, element, data);
  // app.document.setFlag('journal-improvements', 'configured', true);
});

function renderNoteConfig(app, element, _data) {
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
