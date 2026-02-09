@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║   🔧 CONFIGURAR GIT PARA HDM-JUAN                                ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo.
echo Este script configurará Git para usar la cuenta HDM-Juan
echo.
echo ¿Deseas continuar? (S/N)
set /p confirmar=

if /i "%confirmar%" NEQ "S" (
    echo Operación cancelada
    pause
    exit
)

echo.
echo Configurando Git...
echo.

REM Configurar nombre de usuario
git config user.name "HDM-Juan"
echo ✓ Nombre configurado: HDM-Juan

REM Configurar email (actualizar con el email correcto)
echo.
echo Ingresa el email de la cuenta HDM-Juan:
set /p email=
git config user.email "%email%"
echo ✓ Email configurado: %email%

echo.
echo ════════════════════════════════════════════════════════════════════
echo CONFIGURACIÓN COMPLETADA
echo ════════════════════════════════════════════════════════════════════
echo.
echo Usuario: HDM-Juan
echo Email: %email%
echo.
echo SIGUIENTE PASO:
echo.
echo 1. Ejecuta: git push origin main
echo.
echo Si pide contraseña, usa un Personal Access Token:
echo https://github.com/settings/tokens
echo.
pause
