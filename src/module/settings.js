// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export function registerSettings() {
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
