// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "modules/better-journal/templates"
    'modules/better-journal/templates/journal-sheet.html',
  ];

  return loadTemplates(templatePaths);
}
