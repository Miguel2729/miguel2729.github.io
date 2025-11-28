(function () {
  const fs = {}; // estrutura de arquivos virtual
  const root = '/';
  let currentDir = root;

  // Objetos reservados
  const con = {
    log: (...args) => console.log('[CONSOLE]', ...args)
  };
  const bro = {
    abrir: url => window.open(url, '_blank')
  };

  // Sistema de arquivos com binário
  const FileSystem = {
    estrutura: {
      [root]: {}
    },

    criarArquivo(nome, binario) {
      this.estrutura[currentDir][nome] = { bin: binario };
      con.log(`Arquivo "${nome}" criado`);
    },

    renomearArquivo(antigo, novo) {
      const arquivo = this.estrutura[currentDir][antigo];
      if (!arquivo) return false;
      this.estrutura[currentDir][novo] = arquivo;
      delete this.estrutura[currentDir][antigo];
      return true;
    },

    moverArquivo(nome, destino) {
      const arquivo = this.estrutura[currentDir][nome];
      if (!arquivo || !this.estrutura[destino]) return false;
      this.estrutura[destino][nome] = arquivo;
      delete this.estrutura[currentDir][nome];
      return true;
    },

    criarPasta(nome) {
      this.estrutura[currentDir][nome] = {};
    }
  };

  // Sistema de notificações
  const Notificacao = {
    mostrar(titulo, corpo) {
      const div = document.createElement('div');
      div.textContent = `${titulo}: ${corpo}`;
      div.style = `
        position:fixed; bottom:10px; right:10px;
        background:#222; color:#fff;
        padding:20px 25px; border-radius:5px;
        font-family:sans-serif; box-shadow:0 0 10px rgba(0,0,0,0.5);
        z-index:9999999999999999999;
        width: 400px;
      `;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 5000);
    }
  };

  // Interpretador de comandos especiais
  window.addEventListener('message', (e) => {
    const input = e.data;

    if (typeof input !== 'string') return;

    const downloadMatch = input.match(/^download\s+"([^"]+)"\s+"([^"]+)"$/);
    const notfMatch = input.match(/^notf\s+"([^"]+)"\s+"([^"]+)"$/);

    if (downloadMatch) {
      const [, nome, bin] = downloadMatch;
      FileSystem.criarArquivo(nome, bin);
    } else if (notfMatch) {
      const [, titulo, corpo] = notfMatch;
      Notificacao.mostrar(titulo, corpo);
    }
  });

  // Expondo con e bro como palavras reservadas globais
  window.con = con;
  window.bro = bro;
})();