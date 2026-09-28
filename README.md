# QR Runner · JA Pernambuco

Perfil de emergência em QR Code para quem corre. Sem cadastro e sem servidor: os dados ficam no dispositivo e dentro do próprio QR.

## Novidades desta versão
- **Vários QR Codes no mesmo aparelho:** crie quantos quiser (você, filha, bike, pouch de corrida). Alterne pela faixa no topo do painel, use **Duplicar este QR** para partir de um perfil pronto e **Excluir este QR** para remover só o atual. Cada QR tem um nome que só você vê. Quem já tinha um perfil salvo não perde nada: ele vira o primeiro QR da lista.
- **Número de peito:** o cartão do perfil agora é um bib de corrida, com um número próprio de cada pessoa (também aparece na página de quem escaneia).
- **Prontidão do perfil:** barra que mostra o quanto o perfil está completo e o que falta.
- **QR com "radar":** moldura de scanner e uma linha que varre o código ao abrir o painel.
- **Confete** ao criar o perfil e botões com resposta ao toque.
- **Botão "Ligar" pulsante** na página pública, para chamar atenção em uma emergência.
- Animações respeitam a opção "reduzir movimento" do aparelho.

## Como funciona
1. A pessoa preenche nome, contato de emergência e (opcionalmente) informações médicas.
2. O app gera um QR Code cujo link já contém os dados do perfil.
3. Quem escanear vê o contato de emergência e pode ligar ou enviar mensagem.

## Publicar no GitHub Pages
1. Envie `index.html` (e os demais arquivos) para a raiz do repositório, na branch `main`.
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

> Gere e imprima os QR Codes **depois** de publicar, pelo endereço final. O QR usa o endereço em que a página está aberta.

## Trocar paleta e logo
- Cores: variáveis no início do CSS (`:root`) do `index.html`.
- Logo: o ícone dentro de `.logo i` no cabeçalho.

## Limitações
- Editar o perfil muda o QR. QRs antigos continuam mostrando os dados antigos.
- Não é possível desativar um QR já impresso, pois os dados estão dentro dele.
- Os QR Codes ficam guardados no navegador deste aparelho; limpar os dados do navegador apaga a lista (os adesivos impressos continuam funcionando).
- Quem tiver o QR vê tudo que foi preenchido: compartilhe só o essencial.

## Tecnologia
HTML, CSS e JavaScript puros, mais [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) via cdnjs.
