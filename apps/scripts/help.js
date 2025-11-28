document.addEventListener("keydown", function(event) {
  // Verifica se a tecla pressionada é "h" (minúscula)
  if (event.key.toLowerCase() === "h") {
    parent.postMessage("abrir manual.html", "*");
  }
});