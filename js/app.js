(function () {
  let configuracaoAtual = null;
  let vagasAtuais = [];

  const secaoConfigVisualizacao = document.getElementById("config-visualizacao");
  const formConfiguracao = document.getElementById("form-configuracao");
  const btnSalvarConfig = document.getElementById("btn-salvar-config");
  const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");
  const btnEditarConfig = document.getElementById("btn-editar-config");
  const btnRemoverConfig = document.getElementById("btn-remover-config");

  const inputArea = document.getElementById("input-area");
  const inputCapacidade = document.getElementById("input-capacidade");
  const inputPrecoHora = document.getElementById("input-preco-hora");

  const vagasContainer = document.getElementById("vagas-container");
  const vagasVazio = document.getElementById("vagas-vazio");
  const btnAtualizarVagas = document.getElementById("btn-atualizar-vagas");

  const modalOcupar = document.getElementById("modal-ocupar");
  const formOcupar = document.getElementById("form-ocupar");
  const inputPlaca = document.getElementById("input-placa");
  const ocuparNumeroLabel = document.getElementById("ocupar-numero-label");
  let numeroVagaSelecionada = null;

  function mensagemErro(erro) {
    return erro && erro.message ? erro.message : "Ocorreu um erro inesperado";
  }

  // ---------- Configuração ----------

  async function carregarConfiguracao() {
    try {
      configuracaoAtual = await Api.getConfiguracao();
    } catch (erro) {
      configuracaoAtual = null;
    }
    renderizarConfiguracao();
  }

  function renderizarConfiguracao() {
    if (configuracaoAtual) {
      secaoConfigVisualizacao.classList.remove("d-none");
      formConfiguracao.classList.add("d-none");
      document.getElementById("config-area").textContent = configuracaoAtual.area;
      document.getElementById("config-capacidade").textContent = configuracaoAtual.capacidade;
      document.getElementById("config-preco-hora").textContent = Ui.formatarMoeda(
        configuracaoAtual.preco_hora
      );
    } else {
      secaoConfigVisualizacao.classList.add("d-none");
      formConfiguracao.classList.remove("d-none");
      btnCancelarEdicao.classList.add("d-none");
      btnSalvarConfig.textContent = "Cadastrar configuração";
      formConfiguracao.reset();
    }
  }

  function iniciarEdicaoConfiguracao() {
    inputArea.value = configuracaoAtual.area;
    inputCapacidade.value = configuracaoAtual.capacidade;
    inputPrecoHora.value = configuracaoAtual.preco_hora;
    secaoConfigVisualizacao.classList.add("d-none");
    formConfiguracao.classList.remove("d-none");
    btnCancelarEdicao.classList.remove("d-none");
    btnSalvarConfig.textContent = "Salvar alterações";
  }

  formConfiguracao.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const dados = {
      area: parseFloat(inputArea.value),
      capacidade: parseInt(inputCapacidade.value, 10),
      preco_hora: parseFloat(inputPrecoHora.value),
    };
    try {
      if (configuracaoAtual) {
        configuracaoAtual = await Api.atualizarConfiguracao(dados);
        Ui.mostrarAlerta("Configuração atualizada com sucesso.", "success");
      } else {
        configuracaoAtual = await Api.criarConfiguracao(dados);
        Ui.mostrarAlerta("Configuração cadastrada com sucesso.", "success");
      }
      renderizarConfiguracao();
      await carregarVagas();
    } catch (erro) {
      Ui.mostrarAlerta(mensagemErro(erro), "danger");
    }
  });

  btnEditarConfig.addEventListener("click", iniciarEdicaoConfiguracao);

  btnCancelarEdicao.addEventListener("click", () => {
    renderizarConfiguracao();
  });

  btnRemoverConfig.addEventListener("click", async () => {
    if (!confirm("Remover a configuração do estacionamento e todas as suas vagas?")) return;
    try {
      await Api.removerConfiguracao();
      configuracaoAtual = null;
      vagasAtuais = [];
      Ui.mostrarAlerta("Configuração removida com sucesso.", "success");
      renderizarConfiguracao();
      renderizarVagas();
    } catch (erro) {
      Ui.mostrarAlerta(mensagemErro(erro), "danger");
    }
  });

  // ---------- Vagas ----------

  async function carregarVagas() {
    if (!configuracaoAtual) {
      vagasAtuais = [];
      renderizarVagas();
      return;
    }
    try {
      const resposta = await Api.listarVagas();
      vagasAtuais = resposta.vagas || [];
    } catch (erro) {
      vagasAtuais = [];
      Ui.mostrarAlerta(mensagemErro(erro), "danger");
    }
    renderizarVagas();
  }

  function calcularOcupacao(vaga) {
    const entrada = new Date(vaga.hora_entrada);
    const minutos = Math.max(0, (Date.now() - entrada.getTime()) / 60000);
    // Mesma regra de cobrança do backend: hora arredondada para cima, mínimo de 1 hora.
    const horasCobradas = Math.max(1, Math.ceil(minutos / 60));
    const valor = horasCobradas * configuracaoAtual.preco_hora;
    return { minutos, valor };
  }

  function criarCardVaga(vaga) {
    const coluna = document.createElement("div");
    coluna.className = "col-sm-6 col-lg-4 col-xl-3";

    const ocupada = vaga.status === "ocupada";
    const corBorda = ocupada ? "border-danger" : "border-success";
    const corBadge = ocupada ? "bg-danger" : "bg-success";

    coluna.innerHTML = `
      <div class="card h-100 ${corBorda}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h3 class="h5 mb-0">Vaga ${vaga.numero}</h3>
            <span class="badge ${corBadge}">${ocupada ? "Ocupada" : "Livre"}</span>
          </div>
          <div class="vaga-detalhes small text-muted mb-3"></div>
          <button type="button" class="btn btn-sm w-100 ${
            ocupada ? "btn-outline-danger" : "btn-outline-success"
          }" data-acao="${ocupada ? "liberar" : "ocupar"}">
            ${ocupada ? "Registrar saída" : "Registrar entrada"}
          </button>
        </div>
      </div>
    `;

    const detalhes = coluna.querySelector(".vaga-detalhes");
    if (ocupada) {
      const { minutos, valor } = calcularOcupacao(vaga);
      detalhes.innerHTML = `
        Placa: <strong>${vaga.placa}</strong><br>
        Tempo: ${Ui.formatarDuracao(minutos)}<br>
        Valor estimado: ${Ui.formatarMoeda(valor)}
      `;
    } else {
      detalhes.innerHTML = "Vaga disponível";
    }

    const botaoAcao = coluna.querySelector("[data-acao]");
    botaoAcao.addEventListener("click", () => {
      if (ocupada) {
        liberarVaga(vaga);
      } else {
        abrirModalOcupar(vaga);
      }
    });

    return coluna;
  }

  function renderizarVagas() {
    vagasContainer.innerHTML = "";
    if (vagasAtuais.length === 0) {
      vagasVazio.classList.remove("d-none");
      return;
    }
    vagasVazio.classList.add("d-none");
    vagasAtuais
      .slice()
      .sort((a, b) => a.numero - b.numero)
      .forEach((vaga) => vagasContainer.appendChild(criarCardVaga(vaga)));
  }

  function abrirModalOcupar(vaga) {
    numeroVagaSelecionada = vaga.numero;
    ocuparNumeroLabel.textContent = vaga.numero;
    inputPlaca.value = "";
    Ui.abrirModal(modalOcupar);
    inputPlaca.focus();
  }

  document.querySelectorAll("[data-fechar-modal]").forEach((botao) => {
    botao.addEventListener("click", () => Ui.fecharModal(modalOcupar));
  });

  formOcupar.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const placa = inputPlaca.value.trim().toUpperCase();
    if (!placa) return;
    try {
      await Api.ocuparVaga(numeroVagaSelecionada, placa);
      Ui.fecharModal(modalOcupar);
      Ui.mostrarAlerta(`Entrada registrada na vaga ${numeroVagaSelecionada}.`, "success");
      await carregarVagas();
    } catch (erro) {
      Ui.mostrarAlerta(mensagemErro(erro), "danger");
    }
  });

  async function liberarVaga(vaga) {
    const { valor } = calcularOcupacao(vaga);
    const confirmou = confirm(
      `Liberar a vaga ${vaga.numero} (placa ${vaga.placa})?\nValor estimado a cobrar: ${Ui.formatarMoeda(
        valor
      )}`
    );
    if (!confirmou) return;
    try {
      const pagamento = await Api.liberarVaga(vaga.numero);
      Ui.mostrarAlerta(
        `Vaga ${vaga.numero} liberada. Valor cobrado: ${Ui.formatarMoeda(pagamento.valor)}`,
        "success"
      );
      await carregarVagas();
      await carregarPagamentos();
    } catch (erro) {
      Ui.mostrarAlerta(mensagemErro(erro), "danger");
    }
  }

  btnAtualizarVagas.addEventListener("click", carregarVagas);

  // ---------- Pagamentos ----------

  const inputDataPagamentos = document.getElementById("input-data-pagamentos");
  const pagamentosTotal = document.getElementById("pagamentos-total");
  const pagamentosQuantidade = document.getElementById("pagamentos-quantidade");
  const pagamentosCorpo = document.getElementById("pagamentos-corpo");
  const pagamentosVazio = document.getElementById("pagamentos-vazio");

  async function carregarPagamentos() {
    const data = inputDataPagamentos.value;
    try {
      const resposta = await Api.listarPagamentos(data);
      renderizarPagamentos(resposta.pagamentos || []);
    } catch (erro) {
      renderizarPagamentos([]);
      Ui.mostrarAlerta(mensagemErro(erro), "danger");
    }
  }

  function renderizarPagamentos(pagamentos) {
    const total = pagamentos.reduce((soma, pagamento) => soma + pagamento.valor, 0);
    pagamentosTotal.textContent = Ui.formatarMoeda(total);
    pagamentosQuantidade.textContent = `${pagamentos.length} pagamento${
      pagamentos.length === 1 ? "" : "s"
    }`;

    pagamentosCorpo.innerHTML = "";
    pagamentosVazio.classList.toggle("d-none", pagamentos.length > 0);

    pagamentos
      .slice()
      .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
      .forEach((pagamento) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
          <td>${Ui.formatarHora(pagamento.data_hora)}</td>
          <td>${pagamento.numero_vaga}</td>
          <td>${pagamento.placa}</td>
          <td class="text-end">${Ui.formatarMoeda(pagamento.valor)}</td>
        `;
        pagamentosCorpo.appendChild(linha);
      });
  }

  inputDataPagamentos.addEventListener("change", carregarPagamentos);

  // Atualiza tempo/valor das vagas ocupadas sem precisar buscar de novo na API.
  setInterval(() => {
    if (vagasAtuais.some((v) => v.status === "ocupada")) {
      renderizarVagas();
    }
  }, 30000);

  // ---------- Inicialização ----------

  (async function iniciar() {
    inputDataPagamentos.value = Ui.hojeISO();
    await carregarConfiguracao();
    await carregarVagas();
    await carregarPagamentos();
  })();
})();
