const ALLOWED_ORIGINS = ["https://seudominio.com"];
const SCRIPT_PATH = "/scripts/";
const SCRIPT_REGEX = /^[\w\-]+\.js$/;

window.addEventListener("message", async (event) => {
  if (!ALLOWED_ORIGINS.includes(event.origin)) return;

  const data = event.data;
  if (typeof data !== "string" || !data.startsWith("exe ")) return;

  const scriptName = data.slice(4).trim();
  if (!SCRIPT_REGEX.test(scriptName)) {
    console.warn("Nome de script inválido:", scriptName);
    return;
  }

  try {
    const response = await fetch(SCRIPT_PATH + scriptName);
    if (!response.ok) throw new Error("Erro ao carregar script");

    const code = await response.text();

    const blob = new Blob([`
      self.onmessage = () => {
        try {
          const resultado = new Function('"use strict";' + ${JSON.stringify(code)})();
          self.postMessage(resultado);
        } catch (err) {
          self.postMessage("Erro: " + err.message);
        }
      };
    `], { type: "application/javascript" });

    const worker = new Worker(URL.createObjectURL(blob));
    worker.onmessage = (e) => console.log("Resultado:", e.data);
    worker.onerror = (e) => console.error("Erro no worker:", e.message);
    worker.postMessage(null);

  } catch (err) {
    console.error("Falha ao executar script:", err);
  }
});