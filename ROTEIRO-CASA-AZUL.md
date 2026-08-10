# Roteiro da demonstração — Casa Azul Felipe Augusto

Escrito em 10 de agosto de 2026, depois de percorrer as telas em produção.
Cada passo abaixo foi verificado, exceto os três marcados com ⚠️.

**A ordem importa.** Ela conta uma história: *este é o projeto de vocês → é
assim que um servidor destina → e esta é a tela que vocês vão operar.* Começar
pelo cadastro inverteria o efeito — o Felipe veria o produto antes de entender
o problema que ele resolve.

---

## Antes de começar

**Abra as abas na ordem, e deixe-as abertas.** Trocar de aba é mais rápido e
menos arriscado do que digitar endereço na frente do cliente.

| # | Aba | Endereço |
|---|---|---|
| 1 | O projeto deles | `https://www.incentivabr.com.br/projetos-rouanet.html?org=casa-azul` |
| 2 | Painel do destinador | `https://www.incentivabr.com.br/dashboard.html?org=casa-azul` |
| 3 | Fila de conferência | `https://www.incentivabr.com.br/conferencia.html?org=casa-azul` |
| 4 | Cadastro de clientes | `https://www.incentivabr.com.br/admin-clientes.html` |

**Nunca comece pela `index.html`.** Ela não é multi-tenant: sai com a marca da
IncentivaBR, e o Felipe veria a plataforma antes de ver a instituição dele.

**O `?org=casa-azul` só precisa estar no primeiro endereço.** Daí em diante ele
se propaga sozinho — nos links e em toda chamada de API.

**Faça login antes da reunião**, com `contato@incentivabr.com.br`. Sessão
expirada no meio da demonstração custa a atenção da sala.

---

## Ato 1 — O projeto deles, ao vivo do Ministério

**Aba 1.** A página abre com a marca da Casa Azul: o símbolo no cabeçalho, o
azul-marinho `#1E346B`, e o título da janela dizendo "Casa Azul Felipe Augusto".

O que dizer, mais ou menos nestas palavras:

> "Isto não é uma maquete. O PRONAC 2511274, o nome do projeto e a situação da
> captação vêm da API do SALIC, do Ministério da Cultura, agora. Se amanhã o
> Ministério mudar a situação, muda aqui."

**Por que abrir por aqui:** ninguém duvida de um sistema que sabe o número
certo. É o argumento mais barato e mais forte que você tem.

Se quiser reforçar: a mesma integração lista os **59.669 projetos aprovados**
do país. A plataforma não foi feita para um projeto — ele é que foi plugado.

---

## Ato 2 — O que muda para o servidor

Ainda na aba 1, clique em **"Destinar para este projeto"**.

O fluxo pede o imposto devido, calcula o limite de 6% e mostra quanto daquele
valor vai para o projeto. O ponto a fazer:

> "O custo líquido para o servidor é zero. Ele não está doando: está decidindo
> para onde vai um dinheiro que sairia do bolso dele de qualquer jeito."

**Duas coisas para dizer antes que perguntem** — dizer primeiro passa mais
segurança do que responder depois:

- **Só vale para quem entrega a declaração pelo modelo completo.** No
  simplificado, o desconto padrão substitui todas as deduções.
- **O limite é de 6% do imposto devido**, e é compartilhado com os outros
  incentivos — não é 6% por mecanismo.

---

## Ato 3 — A tela que o Felipe vai operar

**Aba 3, a fila de conferência.** É o coração da demonstração, porque é a única
tela que responde à pergunta que ele realmente tem: *"e como eu sei que o
dinheiro entrou?"*

Mostre a fila com as destinações aguardando, e o que cada linha traz: quem
destinou, quanto, e o comprovante que a pessoa anexou. Depois:

> "Quem confirma é você, não o sistema. O dinheiro cai na Conta de Captação do
> projeto, no banco — a plataforma nunca toca nele. Você confere o comprovante
> contra o extrato e confirma. Aí o destinador recebe o aviso de que você vai
> emitir o Recibo de Mecenato."

E mostre o botão de **recusar**: ele exige um motivo, que aparece na tela do
destinador. Vale explicar por quê:

> "Se a devolução fosse silenciosa, quem já transferiu dinheiro ficaria sem
> saber o que corrigir."

⚠️ **Não verifiquei esta tela com dados.** O semeador cria três destinações de
exemplo, mas eu não as vi renderizadas. **Abra a aba 3 antes da reunião.** Se
estiver vazia, avise que eu conserto.

---

## Ato 4 — Quanto tempo leva para pôr um cliente no ar

**Aba 4.** Este ato é opcional e serve a um propósito só: mostrar que a Casa
Azul não é um caso único feito à mão.

Crie uma instituição fictícia na frente dele — nome, identificador, cores —,
consulte um PRONAC no SALIC e vincule. Leva menos de um minuto.

> "Foi assim que a de vocês entrou. E é assim que entra a próxima."

**Se quiser fechar com efeito:** convide o e-mail dele ali, ao vivo. Ele recebe
na hora um convite que diz exatamente o que está aceitando — ver as
destinações, conferir comprovantes, confirmar. O link vale 48 horas e serve uma
vez só.

⚠️ **Não verifiquei o e-mail chegando.** Mande um convite para você mesmo antes
da reunião. Se não chegar, não improvise na hora — pule este fecho.

---

## As duas perguntas difíceis, e o que responder

### "Por que está escrito Simulação?"

Não esconda. Use:

> "Porque falta uma coisa que só vocês podem me dar: a Conta de Captação do
> projeto. Enquanto ela não estiver aqui, eu não deixo ninguém transferir de
> verdade — depósito na conta errada não gera recibo, e o servidor perde a
> dedução. No dia em que vocês me passarem a conta, eu viro a chave."

Isso transforma a etiqueta em prova de cuidado, e deixa a pendência **do lado
deles** — que é onde ela deve estar numa reunião de venda.

### "Quanto custa?"

Não é assunto do sistema, mas vai aparecer. O que o sistema sustenta:

- a plataforma é **ferramenta de captação do proponente**, não consultoria;
- o custo cabe nas rubricas do próprio projeto aprovado.

Os números da proposta são seus. O roteiro só garante que a demonstração não
contradiga o que a proposta afirma.

---

## O que NÃO mostrar

**A `index.html` e as páginas institucionais.** Vinte e duas das 33 telas não
são multi-tenant — saem com a marca da IncentivaBR. Não é defeito (são páginas
da plataforma), mas no meio da demonstração parece troca de identidade.

**O painel sem `?org=casa-azul`.** Ele mostra a organização padrão, com o
projeto fictício da Orquestra das Periferias. Numa tela ao lado da outra, isso
confunde.

**A etapa de pagamento com a conta em branco** — a não ser que você vá usar o
argumento do item anterior. Aí é proposital, e é forte.

---

## Depois da reunião

O que pedir antes de sair:

1. **A Conta de Captação do PRONAC 2511274** — banco, agência e conta. É o que
   destrava a virada. Reforce: tem que ser a conta **de captação** do projeto,
   não a conta institucional.
2. **O e-mail de quem vai operar a fila.** Pode ser o Felipe ou outra pessoa —
   o convite leva um minuto.
3. **O CNPJ do proponente**, para o cadastro ficar completo.

Com esses três, o que falta para desligar a simulação está em
[`VIRADA-PRODUCAO.md`](VIRADA-PRODUCAO.md) — e o que ainda depende de
tributarista, em [`CONSULTA-TRIBUTARISTA.md`](CONSULTA-TRIBUTARISTA.md).
