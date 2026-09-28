# QR Runner · JA Pernambuco

Perfil de emergência em QR Code para quem corre. Sem cadastro, sem backend: os dados ficam no dispositivo e dentro do próprio QR.

## Como funciona

1. A pessoa preenche nome, contato de emergência e (opcionalmente) informações médicas.
2. O app gera um QR Code cujo link já contém os dados do perfil.
3. Quem escanear vê o contato de emergência e pode ligar ou enviar mensagem.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie estes arquivos para a branch `main`.
2. Vá em **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
4. Aguarde um minuto. O site ficará em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

> Gere e imprima os QR Codes **depois** de publicar, pelo endereço final. O QR usa o endereço em que a página está aberta.

## Rodar localmente

Abra `index.html` no navegador (ou `python3 -m http.server`).

## Limitações

- Editar o perfil muda o QR. QRs antigos continuam mostrando os dados antigos.
- Não é possível desativar um QR já impresso, pois os dados estão dentro dele.
- Quem tiver o QR vê tudo que foi preenchido: compartilhe só o essencial.

## Tecnologia

HTML, CSS e JavaScript puros, mais [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) via cdnjs.
