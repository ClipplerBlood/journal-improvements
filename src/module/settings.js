// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export function registerSettings() {
  game.settings.register('better-journal', 'createDefaultPage', {
    name: 'betterJournal.settings.createDefaultPageName',
    hint: 'betterJournal.settings.createDefaultPageHint',
    scope: 'client',
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false,
  });

  game.settings.register('better-journal', 'createSilent', {
    name: 'betterJournal.settings.createSilentPageName',
    hint: 'betterJournal.settings.createSilentPageHint',
    scope: 'client',
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false,
  });
}
