import { getHiddenButtons } from '../settings.js';

export class ImprovedJournalSheet extends JournalSheet {
  static get defaultOptions() {
    const classes = ['sheet', 'journal-sheet', 'journal-entry', 'journal-improvements'];
    if (game.modules.get('pf2e-dorako-ui')?.active) classes.push('ij-dorako-fix');

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classes,
      template: 'modules/journal-improvements/templates/journal-sheet.html',
    });
  }

  static get textPageTemplate() {
    return 'modules/journal-improvements/templates/journal-sheet-text-page.html';
  }

  get _isDefaultEdit() {
    return !game.settings.get('journal-improvements', 'integratedEditor');
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
    // Make pages start from 1 instead of 0 (if pages start from 0)
    if (_pageData[0]?.number === 0) _pageData.forEach((p) => p.number++);
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
    await this.renderLastPage();
  }

  renderLastPage() {
    const lastPageIndex = this._pages.length - 1;
    return this.render(false, { pageIndex: lastPageIndex });
  }

  /**
   * Update child views inside the main sheet.
   * @returns {Promise<void>}
   * @protected
   */
  async _renderPageViews() {
    if (this._isDefaultEdit) return super._renderPageViews();

    for (const pageNode of this.element[0].querySelectorAll('.journal-entry-page')) {
      const id = pageNode.dataset.pageId;
      if (!id) continue;
      const sheet = this.getPageSheet(id);
      const data = await sheet.getData();

      /* Begin custom code */
      let view, edit;
      const isText = data.data.type === 'text';
      edit = pageNode.querySelector(':scope > .edit-container');

      // If is text page, render the editor in this sheet
      if (isText) {
        data.editable = edit != null;
        data.enrichedPageContent = await TextEditor.enrichHTML(data.data?.text?.content, { async: true });
        view = await renderTemplate('modules/journal-improvements/templates/journal-sheet-text-page.html', data);
        view = $(view); // to Jquery

        pageNode.replaceChildren(...view.get());
        sheet._activateCoreListeners(view.parent());
        // sheet.activateListeners(view);
        view.find('.editor-content[data-edit]').each((i, div) => this._activateEditor(div));
      }

      // Otherwise, default behavior
      else {
        view = await sheet._renderInner(data);
        pageNode.replaceChildren(...view.get());
        if (edit) pageNode.appendChild(edit);
        sheet._activateCoreListeners(view.parent());
        sheet.activateListeners(view);
      }
      /* End custom code */

      await this._renderHeadings(pageNode, sheet.toc);
      for (const cls of sheet.constructor._getInheritanceChain()) {
        Hooks.callAll(`render${cls.name}`, sheet, view, data);
      }
    }
    this._observeHeadings();
  }

  /**
   * Handles the event when a page edit button is clicked
   * @param event
   * @return {*}
   * @private
   */
  _onEditPage(event) {
    if (this._isDefaultEdit) return super._onEditPage(event);

    // Do the default editpage behavior only if the page is not text
    const ct = $(event.currentTarget);
    const articlePage = ct.closest('article');
    const isText = articlePage.hasClass('text');
    if (!isText) return super._onEditPage(event);

    // Replace the h1 with an input
    const headerH1 = articlePage.find('header h1');
    const pageId = articlePage.data('pageId');
    const pageName = headerH1.text();
    const nameInput = $(`<input type='text' value="${pageName}">`);
    const that = this;
    nameInput.on('change', async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const newPageName = $(this).val();
      await that.document.updateEmbeddedDocuments('JournalEntryPage', [{ _id: pageId, name: newPageName }], {
        render: false,
      });
      // TODO: Update TOC manually, since we don't render the sheet after update
    });
    headerH1.replaceWith(nameInput);
  }

  /**
   * Handles the form update
   * @param event
   * @param formData
   * @return {Promise<undefined|*>}
   * @private
   */
  async _updateObject(event, formData) {
    if (this._isDefaultEdit) return super._updateObject(event, formData);

    // Check for formData with name equals to page ids, collecting the contents for updating
    const pagesUpdateData = [];
    const pageIds = this._pages.map((p) => p._id);
    for (const k of Object.keys(formData)) {
      if (!pageIds.includes(k)) continue;
      pagesUpdateData.push({
        _id: k,
        'text.content': formData[k],
      });
      delete formData[k];
    }

    // Update the pages
    if (pagesUpdateData.length > 0) {
      await this.document.updateEmbeddedDocuments('JournalEntryPage', pagesUpdateData);
    }

    // const pageIds = this.pages;
    return super._updateObject(event, formData);
  }
}
