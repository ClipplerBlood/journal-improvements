import { getHiddenButtons } from '../settings.js';

/* globals JournalTextPageSheet JournalTextTinyMCESheet MarkdownJournalPageSheet JournalEntryPage*/
export class ImprovedJournalSheet extends JournalSheet {
  static get defaultOptions() {
    const classes = ['sheet', 'journal-sheet', 'journal-entry', 'journal-improvements'];
    if (game.modules.get('pf2e-dorako-ui')?.active) classes.push('ij-dorako-fix');

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classes,
      template: 'modules/journal-improvements/templates/journal-sheet.html',
      submitOnClose: game.settings.get('journal-improvements', 'autosave'),
    });
  }

  static get textPageTemplate() {
    return 'modules/journal-improvements/templates/journal-sheet-text-page.html';
  }

  get _isDefaultEdit() {
    return !game.settings.get('journal-improvements', 'integratedEditor');
  }

  get jiEngine() {
    return game.settings.get('journal-improvements', 'editorEngine') ?? 'tinymce';
  }

  get jiAutosave() {
    return game.settings.get('journal-improvements', 'autosave');
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

      /* <- Begin custom code */
      let view, edit;
      const isText = data.data.type === 'text';
      edit = pageNode.querySelector(':scope > .edit-container');

      // If is text page, render the editor in this sheet
      if (isText) {
        data.editable = edit != null;
        data.engine = this.jiEngine;
        // data.enrichedPageContent = await TextEditor.enrichHTML(data.data?.text?.content, { async: true });
        view = await renderTemplate('modules/journal-improvements/templates/journal-sheet-text-page.html', data);
        view = $(view); // to Jquery
        pageNode.replaceChildren(...view.get());
        sheet._activateCoreListeners(view.parent());
        // sheet.activateListeners(view);

        // If the page is editable, activate the editors
        if (data.editable) {
          const editorContent = view.find('.editor-content[data-edit]');
          editorContent.each((i, div) => this._activateEditor(div));
          if (this.jiAutosave) editorContent.on('focusout', this.submit({ preventRender: true }));
        }

        // Build the toc
        sheet.toc = JournalEntryPage.implementation.buildTOC(view.find('.editor-content').get());

        // If is markdown, add custom dropping of links and autosave
        if (data.engine === 'markdown') {
          sheet._onDropContentLink = (eventData) => this._markdownEditor_onDropContentLink(eventData, view);
          if (this.jiAutosave)
            view
              .find('textarea.markdown-editor')
              .on('focusout', (event) => this._saveMarkdownFromEditor($(event.currentTarget).parent(), true));
        }
      }

      // Otherwise, default behavior
      else {
        view = await sheet._renderInner(data);
        pageNode.replaceChildren(...view.get());
        if (edit) pageNode.appendChild(edit);
        sheet._activateCoreListeners(view.parent());
        sheet.activateListeners(view);
      }
      /* -> End custom code */

      await this._renderHeadings(pageNode, sheet.toc);
      for (const cls of sheet.constructor._getInheritanceChain()) {
        Hooks.callAll(`render${cls.name}`, sheet, view, data);
      }
    }
    this._observeHeadings();
  }

  /**
   * Retrieve the sheet instance for rendering this page inline.
   * Custom code to handle Markdown conversion easily, by instancing the page sheet as a MarkdownJournalPageSheet
   * @param {string} pageId  The ID of the page.
   * @returns {JournalPageSheet}
   */
  getPageSheet(pageId) {
    const page = this.object.pages.get(pageId);
    if (this._isDefaultEdit || page.type !== 'text') return super.getPageSheet(pageId);

    const privateSheets = this['#sheets'] ?? {};
    switch (this.jiEngine) {
      case 'prosemirror':
        return (privateSheets[pageId] ??= new JournalTextPageSheet(page, { editable: false }));
      case 'tinymce':
        return (privateSheets[pageId] ??= new JournalTextTinyMCESheet(page, { editable: false }));
      case 'markdown':
        return (privateSheets[pageId] ??= new MarkdownJournalPageSheet(page, { editable: false }));
    }
  }

  /**
   * Turn to a specific page.
   * @param {string} pageId    The ID of the page to turn to.
   * @param {string} [anchor]  Optionally an anchor slug to focus within that page.
   */
  goToPage(pageId, anchor) {
    if (this._isDefaultEdit) return super.goToPage(pageId, anchor);

    if (this.mode === this.constructor.VIEW_MODES.SINGLE) {
      const currentPageId = this._pages[this.pageIndex]?._id;
      if (currentPageId !== pageId) return this.render(true, { pageId, anchor });
    }
    const page = this.element[0].querySelector(`.journal-entry-page[data-page-id="${pageId}"]`);
    if (anchor) {
      // <- CUSTOM CODE START
      const element = this.element[0].querySelector(`.journal-entry-content [data-anchor="${anchor}"]`);
      // -> CUSTOM CODE END
      if (element) {
        element.scrollIntoView();
        return;
      }
    }
    page?.scrollIntoView();
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
    const nameInput = $(`<input type="text" value="${pageName}">`);
    const that = this;
    nameInput.on('change', async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const newPageName = $(this).val();
      await that.document.updateEmbeddedDocuments('JournalEntryPage', [{ _id: pageId, name: newPageName }], {
        render: false,
      });

      // Change the first level TOC for the page
      that.element.find(`nav.pages-list [data-page-id="${pageId}"] .page-title`)?.text(newPageName);
    });
    headerH1.replaceWith(nameInput);

    // If markdown, toggle between the markdown and the enriched content view, saving the markdown
    if (this.jiEngine === 'markdown') {
      const enrichedContent = articlePage.find('.enriched-content');
      const markdownEditorContent = articlePage.find('.markdown-editor-content');

      // If the md editor is currently displayed, then we can update the data and trigger a render
      if (markdownEditorContent.is(':visible')) {
        this._saveMarkdownFromEditor(markdownEditorContent);
      }

      // Otherwise display the editor and hide the enriched (+ set the height)
      else {
        enrichedContent.hide();
        markdownEditorContent.show();
        this.autosetEditorHeight();
      }
    }
  }

  /**
   * Saves the markdown to the page, converting it to html and triggering a rendering
   * @param markDownEditor
   * @param preventPostUpdateRender
   * @private
   */
  _saveMarkdownFromEditor(markDownEditor, preventPostUpdateRender = false) {
    const mdTextarea = markDownEditor.find('textarea.markdown-editor');
    if (!mdTextarea) throw 'Markdown editor not found';
    const k = mdTextarea.attr('name');
    const md = mdTextarea.val();
    // eslint-disable-next-line no-undef
    const html = JournalTextPageSheet._converter.makeHtml(md);
    const split = k.split('.');
    const pageId = split[1];

    this.document
      .updateEmbeddedDocuments('JournalEntryPage', [{ _id: pageId, 'text.markdown': md, 'text.content': html }], {
        render: false,
      })
      .then(() => {
        if (!preventPostUpdateRender) this.render();
      });
  }

  /**
   * Activate an editor instance present within the form
   * Custom code starts at symbol <-
   * @param {HTMLElement} div  The element which contains the editor
   * @protected
   */
  _activateEditor(div) {
    // Get the editor content div
    const name = div.dataset.edit;
    const engine = div.dataset.engine || 'tinymce';
    const collaborate = div.dataset.collaborate === 'true';
    const button = div.previousElementSibling;
    const hasButton = button && button.classList.contains('editor-edit');
    const wrap = div.parentElement.parentElement;
    const wc = div.closest('.window-content');

    // Determine the preferred editor height
    const heights = [wrap.offsetHeight, wc ? wc.offsetHeight : null];
    if (div.offsetHeight > 0) heights.push(div.offsetHeight);
    const height = Math.min(...heights.filter((h) => Number.isFinite(h)));

    // Get initial content
    const options = {
      target: div,
      fieldName: name,
      save_onsavecallback: () => this.saveEditor(name),
      height,
      engine,
      collaborate,
    };

    if (engine === 'prosemirror') options.plugins = this._configureProseMirrorPlugins(name, { remove: hasButton });

    /**
     * Handle legacy data references.
     * @deprecated since v10
     */
    const isDocument = this.object instanceof foundry.abstract.Document;
    const data = name?.startsWith('data.') && isDocument ? this.object.data : this.object;

    // Define the editor configuration
    const editor = (this.editors[name] = {
      options,
      target: name,
      button: button,
      hasButton: hasButton,
      mce: null,
      instance: null,
      active: !hasButton,
      changed: false,
      initial: foundry.utils.getProperty(data, name),
    });

    // Activate the editor immediately, or upon button click
    const activate = async () => {
      // <- Custom code, everything above is untouched
      if (name.startsWith('pages.')) {
        const split = name.split('.');
        const pageId = split[1];
        const prop = split.slice(2).join('.');
        editor.initial = foundry.utils.getProperty(data.pages.get(pageId), prop);
      } else {
        editor.initial = foundry.utils.getProperty(data, name);
      }
      // -> End custom code
      await this.activateEditor(name, {}, editor.initial);
      this.autosetEditorHeight();
    };
    if (hasButton) button.onclick = activate;
    else activate();
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
    for (const k of Object.keys(formData)) {
      if (!k.startsWith('pages.')) continue;
      const split = k.split('.');
      const pageId = split[1];
      const prop = split.slice(2).join('.');

      pagesUpdateData.push({
        _id: pageId,
        [prop]: formData[k],
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

  /**
   * Handles the dropping of content links in integrated markdown editors
   * @param eventData
   * @param pageView
   * @return {Promise<void>}
   * @private
   */
  async _markdownEditor_onDropContentLink(eventData, pageView) {
    const link = await TextEditor.getContentLink(eventData, { relativeTo: this.object });
    if (!link) return;
    const editor = pageView.find('textarea.markdown-editor').get(0);
    const content = editor.value;
    editor.value = content.substring(0, editor.selectionStart) + link + content.substring(editor.selectionStart);
  }

  /**
   * Automatically sets the editor height to properly fit the application
   * Currently works only on single view mode
   */
  autosetEditorHeight() {
    const article = this.element.find('article');
    const scrollable = this.element.find('.journal-entry-content .scrollable');
    if (this.mode === this.constructor.VIEW_MODES.SINGLE) {
      const editor = article.find('.editor, textarea.markdown-editor');
      if (!editor?.length) return;
      const scrollableBRect = scrollable.get(0).getBoundingClientRect();
      const editorBRect = editor.get(0).getBoundingClientRect();

      let h = scrollableBRect.height - (editorBRect.top - scrollableBRect.top);
      if (editor.hasClass('markdown-editor')) h -= 8;
      editor.css('min-height', h + 'px');
    }
  }

  setPosition({ left, top, width, height, scale } = {}) {
    super.setPosition({ left, top, width, height, scale });
    this.autosetEditorHeight();
  }
}
