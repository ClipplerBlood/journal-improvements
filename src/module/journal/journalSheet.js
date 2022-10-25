import { getHiddenButtons } from '../settings.js';

export class ImprovedJournalSheet extends JournalSheet {
  static get defaultOptions() {
    const classes = ['sheet', 'journal-sheet', 'journal-entry', 'journal-improvements'];
    if (game.modules.get('pf2e-dorako-ui').active) classes.push('ij-dorako-fix');

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classes,
      template: 'modules/journal-improvements/templates/journal-sheet.html',
    });
  }

  getData(options) {
    const data = super.getData(options);
    data.hiddenButtons = getHiddenButtons();
    return data;
  }

  /**
   * Prepare pages for display.
   * @returns {JournalEntryPage[]}  The sorted list of pages.
   * @protected
   * @override
   */
  _getPageData() {
    const _pageData = super._getPageData();
    // Make pages start from 1 instead of 0
    _pageData.forEach((p) => p.number++);
    return _pageData;
  }

  /**
   * Handle clicking the previous and next page buttons.
   * @param {JQuery.TriggeredEvent} event  The button click event.
   * @protected
   */
  _onAction(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    switch (action) {
      case 'quickCreate':
        return this.quickCreatePage(button.dataset.type);
      default:
        return super._onAction(event);
    }
  }

  /**
   * @param {string} type  The type of page to create
   */
  async quickCreatePage(type) {
    await this.document.createQuickPage({ type: type });
    const lastPageIndex = this._pages.length - 1;
    this.render(false, { pageIndex: lastPageIndex });
  }
}
