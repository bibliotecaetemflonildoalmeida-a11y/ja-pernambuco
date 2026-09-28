# QR Runner · JA Pernambuco

Perfil de emergência em QR Code para corredores. O QR contém apenas um **código curto** (`seusite.com/p/a7k2m3x`); os dados ficam no servidor e podem ser editados, pausados ou apagados sem reimprimir o adesivo.

## O que tem
- Página pública para quem escaneia: botão SAMU (192), até 2 contatos com ligar/SMS, envio de localização por WhatsApp/SMS, informações de saúde atrás de um botão.
- Painel do dono: criação em 3 passos, edição, pausar QR, trocar código, excluir dados, contagem de leituras, baixar QR (PNG, correção de erro nível H) e folha de adesivos para impressão.
- Sem contas: o dono recebe uma chave secreta guardada no navegador. O "link de acesso" permite gerenciar em outro aparelho.
- Consentimento LGPD no cadastro; a chave é guardada só como hash no banco.

## Rodar localmente
Requer Node 22.13+ (sem `npm install`, nenhuma dependência).

    npm start        # http://localhost:3000

## Trocar paleta, fontes e logo
- Cores, fontes e raio: **`public/brand.css`** (uma lista de variáveis).
- Logo: substitua **`public/logo.svg`** (e `favicon.svg`).
- Nome da marca e número de emergência: constante `BRAND` no início do `<script>` de `public/index.html`.
- O QR é sempre escuro sobre fundo claro de propósito, para leitura confiável.

## Publicar (o GitHub Pages NÃO serve, pois há servidor)
Suba o repositório no GitHub e conecte a um host que rode Node/Docker: Render (`render.yaml` incluso), Railway, Fly.io etc.
- Variáveis: `PORT` (automática) e `DATA_DIR` (pasta do banco SQLite).
- **O banco precisa de disco persistente**, senão os perfis somem a cada deploy. No Render isso exige plano pago; no Fly/Railway use um volume.
- Use HTTPS (os hosts acima já entregam). A localização só funciona em HTTPS.
- Gere e imprima os QRs **somente pelo domínio final**.

## Antes de distribuir em escala
Faça backup periódico do arquivo `qrrunner.db`, publique uma política de privacidade e teste os adesivos impressos em vários celulares (iPhone e Android), com suor e sol.
