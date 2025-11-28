document.addEventListener("keydown", function(event) {
  // Verifica se a tecla pressionada é "x" (minúscula)
  if (event.key.toLowerCase() === "x") {
    parent.postMessage("abrir painel_do_desenvolvedor.html", "*");
  }
});