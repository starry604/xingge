// Vinext exits immediately after closing the prerender HTTP server. Windows
// needs time to drain the native close callbacks. Failure codes are preserved.
const originalExit = process.exit.bind(process);
process.exit = (code = 0) => {
  if (Number(code) !== 0) originalExit(code);
  else setTimeout(() => originalExit(code), 1000);
};
