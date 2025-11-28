// appstore.js
let allApps = [];
let currentCategory = 'all';
let searchTerm = '';

document.addEventListener('DOMContentLoaded', () => {
  // Carrega os apps
  fetch("apps.json")
    .then(response => response.json())
    .then(apps => {
      allApps = apps;
      renderApps(filterApps(allApps, currentCategory, searchTerm));
    });

  // Configura os filtros de categoria
  const filters = document.querySelectorAll('.category-filter');
  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      currentCategory = filter.dataset.category;
      renderApps(filterApps(allApps, currentCategory, searchTerm));
    });
  });

  // Configura a barra de pesquisa
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    renderApps(filterApps(allApps, currentCategory, searchTerm));
  });
});

function filterAppsByCategory(apps, category) {
  if (category === 'all') return apps;
  return apps.filter(app => app.category === category);
}

function filterAppsBySearch(apps, term) {
  if (!term) return apps;
  
  return apps.filter(app => {
    const rawName = app.name;
    const displayName = rawName
      .replace(/_/g, " ")
      .replace(/\/index\.html$/, "")
      .replace(/\.html$/, "");
    
    return displayName.toLowerCase().includes(term);
  });
}

function filterApps(apps, category, term) {
  let filteredApps = filterAppsByCategory(apps, category);
  filteredApps = filterAppsBySearch(filteredApps, term);
  return filteredApps;
}

function renderApps(apps) {
  const container = document.getElementById("app-list");
  container.innerHTML = '';

  // Mensagem se não houver resultados
  if (apps.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>Nenhum aplicativo encontrado.</p>
        <p>Tente ajustar os filtros ou a pesquisa.</p>
      </div>
    `;
    return;
  }

  apps.forEach(app => {
    const rawName = app.name;
    let displayName = rawName
      .replace(/_/g, " ")
      .replace(/\/index\.html$/, "")
      .replace(/\.html$/, "");

    // Determina o nome do arquivo de ícone
    let iconName = rawName
      .replace(/\/index\.html$/, "")
      .replace(/\.html$/, "")
      .replace(/\//g, "_") + ".png";

    const card = document.createElement("div");
    card.className = "app-card";
    card.dataset.category = app.category || 'outros';

    // Adiciona ícone
    const icon = document.createElement("img");
    icon.className = "app-icon";
    icon.src = `icons/${iconName}`;
    icon.alt = displayName;
    icon.onerror = () => {
      // Ícone padrão se não existir
      icon.src = 'icons/default.png';
    };

    const title = document.createElement("div");
    title.className = "app-title";
    title.textContent = displayName;

    const actions = document.createElement("div");
    actions.className = "app-actions";

    const button = document.createElement("button");

    // Verifica se está instalado no início
    let isInstalled = localStorage.getItem(rawName) === "true";
    updateButtonUI(button, isInstalled);

    button.addEventListener("click", () => {
      const action = isInstalled ? "delapp" : "install";

      // Envia comando para a janela pai
      parent.postMessage(`${action} ${rawName}`, "*");

      // Atualiza estado e aparência
      isInstalled = !isInstalled;
      localStorage.setItem(rawName, isInstalled.toString());
      updateButtonUI(button, isInstalled);
    });

    actions.appendChild(button);
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(actions);
    container.appendChild(card);
  });
}

// Atualiza texto e cor do botão
function updateButtonUI(button, installed) {
  button.textContent = installed ? "Desinstalar" : "Instalar";
  button.className = installed ? "uninstall" : "";
}