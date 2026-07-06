(function () {
  const BASE_URL = window.APP_CONFIG.API_BASE_URL;

  async function request(path, options) {
    let resposta;
    try {
      resposta = await fetch(BASE_URL + path, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
    } catch (erro) {
      throw new Error(
        "Não foi possível conectar ao backend em " +
          BASE_URL +
          ". Verifique se ele está rodando e se o CORS está habilitado."
      );
    }

    const texto = await resposta.text();
    const dados = texto ? JSON.parse(texto) : null;

    if (!resposta.ok) {
      const mensagem = (dados && dados.message) || "Erro ao comunicar com o servidor";
      throw new Error(mensagem);
    }

    return dados;
  }

  window.Api = {
    getConfiguracao: () => request("/configuracao"),

    criarConfiguracao: (config) =>
      request("/configuracao", { method: "POST", body: JSON.stringify(config) }),

    atualizarConfiguracao: (config) =>
      request("/configuracao", { method: "PUT", body: JSON.stringify(config) }),

    removerConfiguracao: () => request("/configuracao", { method: "DELETE" }),

    listarVagas: () => request("/vagas"),

    obterVaga: (numero) => request(`/vagas/${numero}`),

    ocuparVaga: (numero, placa) =>
      request(`/vagas/${numero}/ocupar`, {
        method: "PUT",
        body: JSON.stringify({ placa }),
      }),

    liberarVaga: (numero) =>
      request(`/vagas/${numero}/liberar`, { method: "PUT" }),

    listarPagamentos: (data) =>
      request(data ? `/pagamentos?data=${data}` : "/pagamentos"),
  };
})();
