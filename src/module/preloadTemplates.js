// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "modules/journal-improvements/templates"
    'modules/journal-improvements/templates/journal-sheet.html',
  ];

  return loadTemplates(templatePaths);
}
