const audioExtensions = new Set(['aac', 'aif', 'aiff', 'flac', 'm4a', 'mp3', 'ogg', 'wav', 'webm']);
const videoExtensions = new Set(['m4v', 'mov', 'mp4', 'mpeg', 'mpg', 'ogv', 'webm']);

function getFileExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? '';
}

export function validateArtistMediaUpload(file: File) {
  const extension = getFileExtension(file.name || '');

  if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
    return 'Only audio and video files can be uploaded.';
  }

  if (file.type.startsWith('audio/') && extension && !audioExtensions.has(extension)) {
    return 'The file extension does not match a supported audio upload type.';
  }

  if (file.type.startsWith('video/') && extension && !videoExtensions.has(extension)) {
    return 'The file extension does not match a supported video upload type.';
  }

  if (/[<>:"\\|?*\u0000-\u001f]/.test(file.name)) {
    return 'Rename this file before uploading. File names cannot contain unsafe characters.';
  }

  return null;
}
