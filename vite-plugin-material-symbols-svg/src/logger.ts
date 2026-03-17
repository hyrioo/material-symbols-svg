const ANSI_RESET = '\x1b[0m';
const ANSI_CYAN = '\x1b[36m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_RED = '\x1b[31m';
const ANSI_GREEN = '\x1b[32m';

function supportsAnsiColor(): boolean {
  return typeof process !== 'undefined' && Boolean(process.stdout?.isTTY);
}

function colorizePrefix(msg: string, color: string): string {
  return msg.replace(/^\[([^\]]+)\]/, `${color}[$1]${ANSI_RESET}`);
}

function colorizeProgress(msg: string): string {
  return msg.replace(/(\d+\/\d+)/, `${ANSI_GREEN}$1${ANSI_RESET}`);
}

export function styleInfo(msg: string): string {
  if (!supportsAnsiColor()) return msg;
  return colorizeProgress(colorizePrefix(msg, ANSI_CYAN));
}

export function styleWarn(msg: string): string {
  if (!supportsAnsiColor()) return msg;
  return colorizePrefix(msg, ANSI_YELLOW);
}

export function styleError(msg: string): string {
  if (!supportsAnsiColor()) return msg;
  return colorizePrefix(msg, ANSI_RED);
}
