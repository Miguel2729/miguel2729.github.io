window.addEventListener('message', (e) => {
  const input = e.data.trim();
  if (typeof input !== 'string') return;

  const [cmd, ...args] = input.split(/\s+/);

  switch (cmd) {
    case 'newdir':
      FileSystem.criarPasta(args[0]);
      con.log(`Pasta "${args[0]}" criada`);
      break;

    case 'del':
      if (FileSystem.estrutura[currentDir][args[0]]) {
        delete FileSystem.estrutura[currentDir][args[0]];
        con.log(`"${args[0]}" removido`);
      } else {
        con.log(`"${args[0]}" não encontrado`);
      }
      break;

    case 'print':
      con.log(args.join(' '));
      break;

    case 'write': {
      const nome = args[0];
      const conteudo = args.slice(1).join(' ');
      FileSystem.criarArquivo(nome, conteudo);
      break;
    }

    case 'lf':
      const lista = Object.keys(FileSystem.estrutura[currentDir]);
      con.log('Conteúdo de', currentDir, ':', lista.length ? lista : '(vazio)');
      break;

    case 'dir':
      const destino = args[0];
      if (destino === '..') {
        if (currentDir !== root) {
          currentDir = currentDir.substring(0, currentDir.lastIndexOf('/')) || root;
        }
      } else if (FileSystem.estrutura[currentDir][destino]) {
        currentDir += (currentDir === '/' ? '' : '/') + destino;
        if (!FileSystem.estrutura[currentDir]) {
          FileSystem.estrutura[currentDir] = {};
        }
      } else {
        con.log(`Diretório "${destino}" não existe`);
      }
      con.log(`Diretório atual: ${currentDir}`);
      break;

    case 'view':
      const arquivo = FileSystem.estrutura[currentDir][args[0]];
      if (arquivo && arquivo.bin) {
        con.log(arquivo.bin);
      } else {
        con.log(`Arquivo "${args[0]}" não encontrado ou vazio`);
      }
      break;

    default:
      con.log(`Comando não reconhecido: "${cmd}"`);
  }
});