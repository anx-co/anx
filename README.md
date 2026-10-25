# AX // NÚCLEO PRINCIPAL

Web holográfica RGB con tablero de 4 subsistemas y acceso privado cifrado.

## Arrancar en local
    npx --yes serve .
    # abre http://localhost:3000

## Contraseña
Por defecto: **AX2026** (definida en `js/auth-config.js`).

## Cifrado automático en GitHub
1. Sube el repo a GitHub.
2. Settings → Secrets and variables → Actions → New repository secret
   Nombre: `AX_PASSWORD`  Valor: tu contraseña real.
3. Cada push ejecuta `.github/workflows/cifrar-password.yml`, que calcula el
   SHA-256 y lo escribe en `js/auth-config.js` (borrando el texto en claro).
4. Activa GitHub Pages: Settings → Pages → Branch `main` / root.

## Cifrar en local
    AX_PASSWORD="tu_clave" npm run hash