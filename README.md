# QR Runner · JA Pernambuco (versão GitHub Pages)

Perfil de emergência em QR Code para corredores. Versão **100% estática**: não precisa de servidor.

- Os dados ficam no navegador de quem cria e **dentro do próprio QR**.
- Ao editar o perfil, o QR muda e o adesivo precisa ser reimpresso.
- Não há pausa de QR, troca de código nem contagem de leituras (isso exige servidor: veja a versão completa).

## Publicar
1. Envie estes arquivos para a raiz do repositório (o `index.html` deve ficar na lista principal).
2. Settings → Pages → Deploy from a branch → `main` / `(root)`.
3. Abra `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.
4. Gere e imprima os QRs somente depois, por esse endereço.

## Identidade visual
Cores e fontes: `brand.css`. Logo: `logo.svg` e `favicon.svg`. Nome da marca e número de emergência: constante `BRAND` no início do script do `index.html`.
