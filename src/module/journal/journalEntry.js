/* globals JournalEntryPage */

import { i18n } from '../utils.js';

export class BetterJournalEntry extends JournalEntry {
  /**
   * @override
   * @param data
   * @param options
   * @param userId
   * @private
   */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);

    // After creating, add a text page with the same name
    // TODO: check if we need to handle packs and folders. See JournalEntryPage.implementation.createDialog

    if (game.settings.get('better-journal', 'createDefaultPage')) {
      const newPage = this._createQuickPage({ name: this.name });
      newPage.then(() => Object.values(this.apps).forEach((app) => app.render())); // Refresh apps
    }
  }

  /**
   * Creates a page in the journal
   * @param name
   * @param type
   * @param options
   * @private
   */
  createQuickPage({ name = undefined, type = 'text', options = {} }) {
    if (name == null) name = name ?? i18n(`betterJournal.defaultPageNames.${type}`);
    options = mergeObject(options, { parent: this });
    return JournalEntryPage.create({ name, type }, options);
  }
}
