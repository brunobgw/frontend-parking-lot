(function () {
  function mostrarAlerta(mensagem, tipo) {
    const container = document.getElementById("alerta-container");
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.role = "alert";
    alerta.innerHTML =
      mensagem + '<button type="button" class="btn-close" data-fechar-alerta></button>';
    alerta.querySelector("[data-fechar-alerta]").addEventListener("click", () => alerta.remove());
    container.prepend(alerta);
    setTimeout(() => alerta.remove(), 6000);
  }

  let backdropAtual = null;

  function abrirModal(modalEl) {
    modalEl.classList.add("show");
    modalEl.style.display = "block";
    document.body.classList.add("modal-open");
    backdropAtual = document.createElement("div");
    backdropAtual.className = "modal-backdrop fade show";
    document.body.appendChild(backdropAtual);
  }

  function fecharModal(modalEl) {
    modalEl.classList.remove("show");
    modalEl.style.display = "none";
    document.body.classList.remove("modal-open");
    if (backdropAtual) {
      backdropAtual.remove();
      backdropAtual = null;
    }
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatarDuracao(minutosTotais) {
    const horas = Math.floor(minutosTotais / 60);
    const minutos = Math.floor(minutosTotais % 60);
    return `${horas}h ${String(minutos).padStart(2, "0")}min`;
  }

  function formatarHora(isoString) {
    const data = new Date(isoString);
    return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function hojeISO() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  window.Ui = {
    mostrarAlerta,
    abrirModal,
    fecharModal,
    formatarMoeda,
    formatarDuracao,
    formatarHora,
    hojeISO,
  };
})();
