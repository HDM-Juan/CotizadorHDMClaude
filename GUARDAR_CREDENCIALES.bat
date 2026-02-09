@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║   💾 GUARDAR CREDENCIALES DE GIT                                 ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo.
echo Este script configurará Git para recordar tus credenciales
echo.
echo ¿Deseas continuar? (S/N)
set /p confirmar=

if /i "%confirmar%" NEQ "S" (
    echo Operación cancelada
    pause
    exit
)

echo.
echo Configurando credential helper...
git config --global credential.helper wincred

echo.
echo ════════════════════════════════════════════════════════════════════
echo ✅ CONFIGURACIÓN COMPLETADA
echo ════════════════════════════════════════════════════════════════════
echo.
echo Git ahora recordará tus credenciales en Windows Credential Manager
echo.
echo La próxima vez que hagas git push, no pedirá contraseña
echo.
pause
