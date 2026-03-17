import type { DefinedIcons } from '@hyrioo/vue-material-symbol/tooling';
export declare function loadIconsDefinition(root: string, iconsFile: string): Promise<{
    abs: string;
    iconsDef: DefinedIcons;
    watchedFiles: Set<string>;
}>;
