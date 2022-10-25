import { registerSettings } from './settings.js';
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

// Add any additional hooks if necessary
