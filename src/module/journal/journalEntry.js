/* globals JournalEntryPage */

import { i18n } from '../utils.js';

export class ImprovedJournalEntry extends JournalEntry {
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

    if (game.settings.get('journal-improvements', 'createDefaultPage')) {
      const options = { renderSheet: false };
      const newPage = this.createQuickPage({ name: this.name, options });
      // Refresh apps after creating the page
      newPage.then(() => Object.values(this.apps).forEach((app) => app.render()));
    }
  }

  /**
   * Creates a page in the journal
   * @param name page name
   * @param type page type
   * @param data other object creation data
   * @param options creation options
   * @private
   */
  createQuickPage({ name = undefined, type = 'text', data = {}, options = {} }) {
    if (name == null) name = name ?? i18n(`journalImprovements.defaultPageNames.${type}`);
    options = mergeObject(options, { parent: this });
    options.renderSheet = options.renderSheet ?? !game.settings.get('journal-improvements', 'createSilent');
    data = mergeObject(data, { name, type });
    return JournalEntryPage.create(data, options);
  }
}
