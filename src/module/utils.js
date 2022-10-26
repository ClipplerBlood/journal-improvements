export function i18n(x) {
  return game.i18n.localize(x);
}

// Thanks to https://github.com/saif-ellafi/foundryvtt-clipboard-image/blob/main/clipboard-image.js#L13
/* globals ForgeVTT */
function getSource() {
  let source = 'data';
  if (typeof ForgeVTT != 'undefined' && ForgeVTT.usingTheForge) {
    source = 'forgevtt';
  }
  return source;
}

async function createFolder(source, folderPath) {
  const progressivePaths = [];
  const split = folderPath.split('/'); // TODO: check if other OS use backslash
  split.forEach((subPath) => {
    const p = (progressivePaths.at(-1) ?? '') + '/' + subPath;
    progressivePaths.push(p);
  });

  for (const path of progressivePaths) {
    try {
      await FilePicker.browse(source, path);
      return;
    } catch (error) {
      await FilePicker.createDirectory(source, path);
    }
  }
}

/**
 * Uploads a blob (image) to local storage
 * @param {Blob} blob
 * @returns {string} the path to the image
 */
export async function jiUploadImageBlob(blob) {
  // Determine extension
  const mime = blob.type;
  const extension = mime.replace('image/', '');

  // Name
  const name = new Date().toISOString().slice(0, 19).replace(/:/g, '');
  const filename = `${name}.${extension}`;

  // Source and folder
  const source = getSource();
  const folderPath = game.settings.get('journal-improvements', 'uploadFolder');
  await createFolder(source, folderPath);

  // Create file
  const file = new File([blob], filename, { type: blob.type });

  // Upload and manage response
  const createResponse = await FilePicker.upload(source, folderPath, file);
  if (createResponse.status !== 'success') return; // TODO: better error
  return createResponse.path;
}
