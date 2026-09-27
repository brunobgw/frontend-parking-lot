# Frontend - Sistema de Estacionamento

SPA simples em HTML + CSS (Bootstrap, apenas o CSS) + JavaScript puro,
sem frameworks de aplicação (sem React/Vue/Angular, sem bundler, sem
build). Consome a API REST do
[backend-parking-lot](../backend-parking-lot).

## Como executar

Não precisa de servidor de frontend. Basta abrir o arquivo `index.html`
diretamente no navegador (duplo clique ou "Abrir com" o navegador).

Pré-requisitos:

1. O backend precisa estar rodando em `http://localhost:5000`
   (ver README do `backend-parking-lot`).
2. Conexão com a internet, pois o CSS do Bootstrap é carregado via CDN
   (`cdn.jsdelivr.net`). Sem internet, baixe o arquivo
   `bootstrap.min.css` e troque o `<link>` em `index.html` por um
   caminho local.

Se a API estiver em outro host/porta, altere `API_BASE_URL` em
`js/config.js`.

## Como executar com Docker

Como alternativa a abrir o `index.html` direto no navegador, é possível
servir o frontend com Nginx via Docker.

Pré-requisitos:

1. Docker instalado.
2. O backend rodando e acessível (ver seção acima). Se o backend também
   estiver em um container, garanta que ambos consigam se comunicar
   (mesma rede Docker, ou backend publicado em `localhost`).

Build da imagem:

```
docker build -t frontend-parking-lot .
```

Executar o container (aplicação disponível em `http://localhost:8080`):

```
docker run --rm -p 8080:80 --name frontend-parking-lot frontend-parking-lot
```

Para parar o container:

```
docker stop frontend-parking-lot
```

Caso a API não esteja em `http://localhost:5000`, lembre-se de ajustar
`API_BASE_URL` em `js/config.js` antes de gerar a imagem (o build da
imagem precisa ser refeito para que a alteração tenha efeito, já que os
arquivos são copiados para dentro dela).

## Estrutura

```
index.html          Estrutura da página
css/styles.css       Identidade visual própria por cima do Bootstrap
js/config.js         URL base da API
js/api.js            Chamadas fetch para cada endpoint do backend
js/ui.js             Helpers de interface (alertas, modal, formatação)
js/app.js            Lógica da tela: carrega dados e reage aos cliques
```

Os scripts são carregados como `<script>` comuns (não `type="module"`),
para funcionar também quando a página é aberta via `file://`.

## Funcionalidades

- Cadastrar/editar/remover a configuração do estacionamento (área,
  capacidade, preço por hora).
- Listar vagas e status (livre/ocupada).
- Registrar entrada de veículo (ocupar vaga) informando a placa e,
  opcionalmente, uma observação e o CPF/CNPJ do responsável. Ao informar um
  CNPJ, a razão social e os dados de contato (telefone e e-mail) da empresa
  são consultados automaticamente pelo backend e exibidos no card da vaga.
- Registrar saída (liberar vaga), com valor estimado calculado no
  frontend a partir do horário de entrada e do preço por hora (mesma
  regra do backend: hora arredondada para cima, mínimo de 1 hora).
- Consultar pagamentos recebidos em um dia, com filtro de data e o
  total consolidado do dia selecionado.

## Estilo

O visual não é o Bootstrap padrão: `css/styles.css` define uma paleta
própria (verde-petróleo e coral, via CSS variables), cabeçalho com
gradiente, cartões com cantos suaves e destaque lateral colorido por
status da vaga, e botões em formato pílula. O HTML só usa as classes
utilitárias do Bootstrap (grid, cards, botões, modal); a aparência final
vem desse arquivo.

## Observação sobre CORS

O backend precisa responder com cabeçalhos de CORS para o navegador
permitir chamadas `fetch` a partir do `file://` (ou de outra origem).
Isso já foi configurado no `backend-parking-lot` (`flask-cors`, em
`app.py`). Caso a API dê erro de CORS no console do navegador, verifique
se essa dependência está instalada (`pip install -r requirements.txt`)
e se `CORS(app)` está presente em `app.py`.
