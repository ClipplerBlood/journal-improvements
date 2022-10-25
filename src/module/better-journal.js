import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';
import { BetterJournalSheet } from './journal/journalSheet.js';
import { BetterJournalEntry } from './journal/journalEntry.js';

// Initialize module
Hooks.once('init', async () => {
  console.log('better-journal | Initializing better-journal');

  CONFIG.JournalEntry.documentClass = BetterJournalEntry;
  Journal.registerSheet('better-journal', BetterJournalSheet, { makeDefault: true });

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
