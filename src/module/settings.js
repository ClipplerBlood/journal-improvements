// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export function registerSettings() {
  game.settings.register('journal-improvements', 'integratedEditor', {
    name: 'journalImprovements.settings.integratedEditorName',
    hint: 'journalImprovements.settings.integratedEditorHint',
    scope: 'client',
    config: true,
    requiresReload: false,
    type: Boolean,
    default: 'true',
  });

  game.settings.register('journal-improvements', 'createDefaultPage', {
    name: 'journalImprovements.settings.createDefaultPageName',
    hint: 'journalImprovements.settings.createDefaultPageHint',
    scope: 'client',
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false,
  });

  game.settings.register('journal-improvements', 'createSilent', {
    name: 'journalImprovements.settings.createSilentPageName',
    hint: 'journalImprovements.settings.createSilentPageHint',
    scope: 'client',
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false,
  });

  game.settings.register('journal-improvements', 'pinIcons', {
    name: 'journalImprovements.settings.pinIconsName',
    hint: 'journalImprovements.settings.pinIconsHint',
    scope: 'client',
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false,
  });

  game.settings.register('journal-improvements', 'pasteToPageImage', {
    name: 'journalImprovements.settings.pasteToPageImageName',
    hint: 'journalImprovements.settings.pasteToPageImageHint',
    scope: 'client',
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false,
  });

  game.settings.register('journal-improvements', 'uploadFolder', {
    name: 'journalImprovements.settings.uploadFolderName',
    hint: 'journalImprovements.settings.uploadFolderHint',
    scope: 'client',
    config: true,
    requiresReload: false,
    type: String,
    default: 'uploads/journal',
  });

  for (const t of ['Text', 'Image', 'Pdf', 'Video']) {
    game.settings.register('journal-improvements', `hideButton${t}`, {
      name: `journalImprovements.settings.hideButtons.${t}`,
      hint: `journalImprovements.settings.hideButtons.${t}Hint`,
      scope: 'client',
      config: true,
      requiresReload: false,
      type: Boolean,
      default: false,
    });
  }
}

export function getHiddenButtons() {
  const g = (t) => game.settings.get('journal-improvements', `hideButton${t}`);
  return {
    text: g('Text'),
    image: g('Image'),
    pdf: g('Pdf'),
    video: g('Video'),
  };
}

const noteIcons = {
  text: 'modules/journal-improvements/assets/file.svg',
  image: 'modules/journal-improvements/assets/file-image.svg',
  pdf: 'modules/journal-improvements/assets/file-pdf.svg',
  video: 'modules/journal-improvements/assets/file-video.svg',
};

export function getNoteIcon(type) {
  return noteIcons[type];
}
