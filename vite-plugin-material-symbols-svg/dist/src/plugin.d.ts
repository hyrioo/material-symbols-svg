import type { Plugin } from 'vite';
import { type DiagnosticsMode } from '@hyrioo/vue-material-symbol/tooling';
export interface MaterialSymbolsPluginOptions {
    iconsFile: string;
    concurrency?: number;
    strict?: boolean;
    enabled?: boolean;
    diagnostics?: DiagnosticsMode;
}
export declare function materialSymbolsSvg(opts: MaterialSymbolsPluginOptions): Plugin;
