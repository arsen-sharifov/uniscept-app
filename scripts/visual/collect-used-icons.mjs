import { existsSync, globSync, readFileSync, writeFileSync } from 'node:fs';

const SOURCE_PATTERN = 'src/**/*.{ts,tsx}';
const LUCIDE_IMPORT_PATTERN = /import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"];?/gs;
const BLOCK_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
const ICON_MANIFEST_PATH = './.storybook/stories/Icons/product-icon-names.generated.ts';

const collectUsedIcons = async () => {
  const lucideExports = await import('lucide-react');
  const iconNameByComponent = new Map(Object.entries(lucideExports.icons).map(([name, icon]) => [icon, name]));
  const iconImports = globSync(SOURCE_PATTERN).flatMap((sourcePath) => {
    const source = readFileSync(sourcePath, 'utf8');

    return [...source.matchAll(LUCIDE_IMPORT_PATTERN)]
      .flatMap(([, imports]) => imports.split(','))
      .map((entry) => entry.replace(BLOCK_COMMENT_PATTERN, '').trim())
      .filter((entry) => entry && !entry.startsWith('type '))
      .map((entry) => entry.split(/\s+as\s+/)[0].trim());
  });
  const resolvedImports = [...new Set(iconImports)].map((importName) => ({
    importName,
    iconName: iconNameByComponent.get(lucideExports[importName]),
  }));
  const unresolvedImports = resolvedImports.filter(({ iconName }) => !iconName).map(({ importName }) => importName);

  if (unresolvedImports.length > 0) {
    throw new Error(`Could not resolve Lucide icon imports: ${unresolvedImports.join(', ')}.`);
  }

  const iconNames = [...new Set(resolvedImports.map(({ iconName }) => iconName))].sort();
  const generatedSource = `export const PRODUCT_ICON_NAMES = [
${iconNames.map((name) => `  '${name}',`).join('\n')}
] as const;\n`;
  const currentSource = existsSync(ICON_MANIFEST_PATH) ? readFileSync(ICON_MANIFEST_PATH, 'utf8') : '';

  if (currentSource === generatedSource) {
    return;
  }

  if (process.env.CI) {
    throw new Error('The product icon manifest is stale. Run pnpm icons:collect and commit the result.');
  }

  writeFileSync(ICON_MANIFEST_PATH, generatedSource);
};

try {
  await collectUsedIcons();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
