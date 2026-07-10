# Metas do Piloto — Loop de Turno (Claude Code)

Escopo: ajustes mecânicos isolados, sem tocar em lógica de negócio de produção.
Fonte da verdade deste arquivo: as descrições dos cards no Trello (board "Projetos automação", lista "Backlog / Ideias").
Regra: um item só é marcado `[x]` quando o **gestor testar de fato** o resultado (não confiar só no relatório dos subagents).

Convenção de status:
- `[ ]` pendente
- `[~]` em andamento
- `[x]` validado pelo gestor (testado)

---

## Projeto: Checklist Dinâmica (repo React — Vite + Tailwind)

### [x] 1. Limitar campos cm
- **Card:** #72 — https://trello.com/c/LVKukigd
- **Meta:** limitar os campos de medida em cm para aceitar 2 ou 3 algarismos; avaliar a possibilidade de aceitar inteiros mais decimais.
- **Pronto quando:** o campo cm rejeita/impede entrada acima do limite definido; gestor testa digitando valores válidos e inválidos e reporta o comportamento no chat.
- **Não pode mexer em:** lógica de score ou validação de negócio de outros campos.

### [x] 2. Navegação após resumo
- **Card:** #54 — https://trello.com/c/QEP377GK
- **Meta:** na janela de resumo, a opção "editar ambientes" deve permitir navegar novamente pelos ambientes já existentes para preenchê-los. Hoje ela só permite adicionar um ambiente novo esquecido, mas não deixa voltar e navegar pelos ambientes já cadastrados.
- **Pronto quando:** a partir do resumo, o gestor consegue reabrir um ambiente já cadastrado e percorrer suas perguntas; testado e reportado no chat.
- **Não pode mexer em:** o cálculo de score já feito para os ambientes.

### [x] 3. CEP abre teclado numérico no celular
- **Card:** #69 — https://trello.com/c/9CS0HqLn
- **Meta:** o campo de CEP deve abrir já com o teclado numérico ao ser tocado no celular (atributo de input, não lógica).
- **Pronto quando:** ao focar o campo CEP em mobile, o teclado numérico aparece; gestor confirma no navegador/emulação mobile e reporta.
- **Não pode mexer em:** a integração ViaCEP nem o autofill de endereço.

### [x] 4. Destacar nome do ambiente visualmente
- **Card:** #71 — https://trello.com/c/QIs6zrCE
- **Meta:** destacar o nome do ambiente visualmente para o usuário se localizar melhor. A abordagem pode ser side bar fixa em desktop e header sticky em mobile; se a única forma segura (sem mexer em navegação) for apenas aumentar a fonte/peso do nome do ambiente, isso já atende. Priorizar manter dentro do escopo.
- **Pronto quando:** o nome do ambiente fica visualmente mais destacado do que hoje; gestor testa em desktop e mobile e reporta no chat.
- **Não pode mexer em:** a lógica de navegação entre ambientes, o fluxo de perguntas por ambiente nem o score.

---

## Projeto: Organiza Encomendas (operação de arquivos — sem código)

### [x] 5. Organizar pastas de encomendas por ano
- **Card:** #37 — https://trello.com/c/GQ0rok5J (ORGANIZAR ENCS POR ANOS)
- **Meta:** dar acesso à pasta raiz de encomendas e mover as encomendas para subpastas com nome de ano (2022, 2023, 2024, 2025), deixando as de 2026 soltas na pasta raiz.
- **Pronto quando:** as encomendas anteriores a 2026 estão dentro da subpasta do ano correto, as de 2026 permanecem na raiz, nenhum arquivo foi criado/renomeado/apagado; gestor lista a estrutura final e confirma no chat.
- **Fonte da verdade:** a pasta raiz de encomendas.
- **Não pode:** criar, renomear ou apagar arquivos — só mover.

---

## Critério de sucesso do piloto (geral)

Os 5 itens marcados `[x]`, testados de fato pelo gestor, sem intervenção manual sua no meio do processo. Se o gestor escalar algum item ("não consegui validar sozinho"), isso é o sistema funcionando — não falha.

## Observação sobre o workspace

Este piloto abrange dois projetos de natureza diferente no mesmo workspace: o repo React do Checklist Dinâmica (mexe em código) e a pasta de encomendas (só move arquivo). São independentes. Nenhuma tarefa de um projeto deve tocar arquivos do outro.
