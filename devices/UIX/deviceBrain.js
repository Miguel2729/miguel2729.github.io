// "Driver" do dispositivo virtual UIX
const VirtualDeviceUIX = (function () {
  const listeners = {};

  // Envia uma mensagem para a interface (pode ser exibido, logado, etc.)
  function send(message) {
    const event = new CustomEvent("UIX_OUT", { detail: message });
    window.dispatchEvent(event);
  }

  // Escuta mensagens vindas da interface
  function onReceive(callback) {
    window.addEventListener("UIX_IN", (event) => {
      callback(event.detail);
    });
  }

  return {
    send,
    onReceive
  };
})();

// Exemplo de uso na página:
VirtualDeviceUIX.onReceive((msg) => {
  console.log("Sistema recebeu da interface:", msg);
  if (msg === "ping") {
    VirtualDeviceUIX.send("pong");
  }
});

// Simulando uma mensagem da interface para o sistema:
setTimeout(() => {
  const msg = new CustomEvent("UIX_IN", { detail: "ping" });
  window.dispatchEvent(msg);
}, 1000);

// Escutando respostas do sistema:
window.addEventListener("UIX_OUT", (event) => {
  console.log("Interface recebeu do sistema:", event.detail);
});