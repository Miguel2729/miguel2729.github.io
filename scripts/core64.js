(function () {
  'use strict';

  // Sistema de arquivos virtual
  const VirtualFS = {
    estrutura: {
      '/': {} // root directory
    },
    currentDir: '/',

    criarArquivo(nome, binario) {
      if (!nome || typeof nome !== 'string') {
        console.error('Nome de arquivo inválido');
        return false;
      }
      
      this.estrutura[this.currentDir][nome] = { 
        bin: binario,
        type: 'file',
        createdAt: new Date().toISOString()
      };
      console.log(`Arquivo "${nome}" criado em ${this.currentDir}`);
      return true;
    },

    renomearArquivo(antigo, novo) {
      if (!this.estrutura[this.currentDir][antigo]) {
        console.error(`Arquivo "${antigo}" não encontrado`);
        return false;
      }
      
      this.estrutura[this.currentDir][novo] = this.estrutura[this.currentDir][antigo];
      delete this.estrutura[this.currentDir][antigo];
      return true;
    },

    moverArquivo(nome, destino) {
      if (!this.estrutura[this.currentDir][nome] || !this.estrutura[destino]) {
        console.error('Origem ou destino inválido');
        return false;
      }
      
      this.estrutura[destino][nome] = this.estrutura[this.currentDir][nome];
      delete this.estrutura[this.currentDir][nome];
      return true;
    },

    criarPasta(nome) {
      if (!nome || typeof nome !== 'string') {
        console.error('Nome de pasta inválido');
        return false;
      }
      
      this.estrutura[this.currentDir][nome] = {
        type: 'directory',
        createdAt: new Date().toISOString()
      };
      return true;
    },

    mudarDiretorio(caminho) {
      if (this.estrutura[caminho]) {
        this.currentDir = caminho;
        return true;
      }
      console.error(`Diretório "${caminho}" não encontrado`);
      return false;
    }
  };

  // Sistema de notificações melhorado
  const Notificacao = {
    mostrar(titulo, corpo, tipo = 'info') {
      const tipos = {
        info: '#0078d7',
        error: '#e81123',
        warning: '#ffb900',
        success: '#107c10'
      };
      
      const div = document.createElement('div');
      div.className = 'core64-notification';
      div.innerHTML = `
        <strong>${titulo}</strong>
        <p>${corpo}</p>
      `;
      
      div.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${tipos[tipo] || tipos.info};
        color: white;
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
      `;
      
      document.body.appendChild(div);
      
      setTimeout(() => {
        div.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => div.remove(), 300);
      }, 5000);
    }
  };

  // Interface de console segura
  const ConsoleSeguro = {
    log(...args) {
      console.log('[CORE64]', ...args);
    },
    error(...args) {
      console.error('[CORE64]', ...args);
    },
    warn(...args) {
      console.warn('[CORE64]', ...args);
    }
  };

  // Gerenciador de mensagens
  window.addEventListener('message', function(e) {
    try {
      if (typeof e.data !== 'string') return;

      const command = e.data.trim();
      
      // Comando download
      if (command.startsWith('download ')) {
        const parts = command.split('"');
        if (parts.length >= 3) {
          const nome = parts[1];
          const bin = parts[3];
          VirtualFS.criarArquivo(nome, bin);
        }
      } 
      // Comando notificação
      else if (command.startsWith('notf ')) {
        const parts = command.split('"');
        if (parts.length >= 3) {
          const titulo = parts[1];
          const corpo = parts[3];
          Notificacao.mostrar(titulo, corpo);
        }
      }
    } catch (error) {
      ConsoleSeguro.error('Erro ao processar mensagem:', error);
    }
  });

  // Expõe apenas o necessário para o escopo global
  window.Core64 = {
    fs: VirtualFS,
    notf: Notificacao.mostrar,
    con: ConsoleSeguro
  };

  ConsoleSeguro.log('Core64 inicializado com sucesso');
})();