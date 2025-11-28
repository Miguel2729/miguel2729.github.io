class CON {
  static terminal = null;

  static init() {
    this.terminal = document.querySelector("#terminal");
    if (!this.terminal) {
      console.warn("[CON] Terminal DOM não encontrado.");
    }
  }

  static print(text) {
    if (!this.terminal) this.init();
    if (this.terminal) {
      this.terminal.innerHTML += `${text}<br>`;
      this.terminal.scrollTop = this.terminal.scrollHeight;
    }
  }

  static runCommand(cmd) {
    try {
      this.print(`> ${cmd}`);
      const result = eval(cmd);
      this.print(result !== undefined ? result : "(sem retorno)");
    } catch (error) {
      this.print(`[ERRO] ${error.message}`);
    }
  }

  static clear() {
    if (!this.terminal) this.init();
    if (this.terminal) this.terminal.innerHTML = "";
  }
}

// Inicializa após DOM pronto
window.addEventListener("DOMContentLoaded", () => CON.init());