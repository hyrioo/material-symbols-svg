export interface MetaOptions {
    strict?: boolean;
}
export interface ToolingLogger {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error?: (msg: string) => never | void;
}
export declare function fetchVersions(logger: ToolingLogger, versionsFile: string, iconTypesFile: string, options: MetaOptions): Promise<void>;
