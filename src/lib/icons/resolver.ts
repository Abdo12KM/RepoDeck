import iconManifest from "../../../public/icons/material-icon-theme/manifest.json";

interface ThemeOverrides {
  fileExtensions?: Record<string, string>;
  fileNames?: Record<string, string>;
  folderNames?: Record<string, string>;
  folderNamesExpanded?: Record<string, string>;
}

interface IconManifest {
  file: string;
  folder: string;
  folderExpanded: string;
  fileExtensions: Record<string, string>;
  fileNames: Record<string, string>;
  folderNames: Record<string, string>;
  folderNamesExpanded: Record<string, string>;
  languageIds: Record<string, string>;
  light?: ThemeOverrides;
}

const manifest = iconManifest as unknown as IconManifest;
const BASE_PATH = "/icons/material-icon-theme/icons";

// Fallback for common extensions that might not be in the manifest's fileExtensions
// but are available through languageIds
const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
};

export function getFileIconPath(
  filename: string,
  theme: "light" | "dark" = "dark",
): string {
  const name = filename.toLowerCase();
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  // 1. Check Light Mode Overrides First
  if (theme === "light" && manifest.light) {
    if (manifest.light.fileNames?.[name])
      return `${BASE_PATH}/${manifest.light.fileNames[name]}.svg`;
    if (manifest.light.fileExtensions?.[ext])
      return `${BASE_PATH}/${manifest.light.fileExtensions[ext]}.svg`;
  }

  // 2. Exact match (e.g., .eslintrc, package.json)
  if (manifest.fileNames[name]) {
    return `${BASE_PATH}/${manifest.fileNames[name]}.svg`;
  }

  // 3. Extension match (e.g., ts, js, md)
  const iconFromExt = manifest.fileExtensions[ext];
  if (iconFromExt) {
    return `${BASE_PATH}/${iconFromExt}.svg`;
  }

  // 4. Language ID fallback (for cases like .ts and .js missing from fileExtensions)
  const langId = EXTENSION_LANGUAGE_MAP[ext];
  if (langId && manifest.languageIds[langId]) {
    return `${BASE_PATH}/${manifest.languageIds[langId]}.svg`;
  }

  // 5. Default file icon
  return `${BASE_PATH}/${manifest.file}.svg`;
}

export function getFolderIconPath(
  foldername: string,
  isOpen: boolean,
  theme: "light" | "dark" = "dark",
): string {
  const name = foldername.toLowerCase();

  // 1. Check Light Mode Overrides
  if (theme === "light" && manifest.light) {
    const lightFolderSet = isOpen
      ? manifest.light.folderNamesExpanded
      : manifest.light.folderNames;
    if (lightFolderSet?.[name])
      return `${BASE_PATH}/${lightFolderSet[name]}.svg`;
  }

  // 2. Standard Logic
  const folderSet = isOpen
    ? manifest.folderNamesExpanded
    : manifest.folderNames;
  const defaultIcon = isOpen ? manifest.folderExpanded : manifest.folder;

  if (folderSet[name]) {
    return `${BASE_PATH}/${folderSet[name]}.svg`;
  }

  return `${BASE_PATH}/${defaultIcon}.svg`;
}
