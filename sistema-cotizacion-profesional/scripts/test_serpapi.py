#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test rápido de SerpAPI
Verifica que la API key funciona correctamente
"""

import json
import os
from pathlib import Path

def test_serpapi_key():
    """Prueba la API key de SerpAPI"""

    print("\n" + "="*60)
    print("TEST DE SERPAPI")
    print("="*60 + "\n")

    # Cargar API key
    config_path = Path(__file__).parent.parent / 'config' / 'serpapi.json'

    if not config_path.exists():
        print("[ERROR] No se encontro el archivo de configuracion")
        print(f"Esperado en: {config_path}")
        return False

    with open(config_path, 'r') as f:
        config = json.load(f)

    api_key = config.get('api_key')

    if not api_key:
        print("[ERROR] API key no encontrada en el archivo")
        return False

    print(f"[OK] API key cargada: {api_key[:10]}...{api_key[-10:]}")

    # Intentar importar serpapi
    try:
        from serpapi import GoogleSearch
        print("[OK] Modulo serpapi importado correctamente")
    except ImportError:
        print("[ERROR] Modulo serpapi no instalado")
        print("\nInstalar con: pip install google-search-results")
        return False

    # Test de la API key
    print("\n[INFO] Consultando informacion de la cuenta...")

    try:
        params = {
            'engine': 'google',
            'q': 'test',
            'api_key': api_key
        }

        search = GoogleSearch(params)
        account = search.get_account()

        print("\n" + "="*60)
        print("INFORMACION DE LA CUENTA")
        print("="*60)
        print(f"Plan: {account.get('plan', 'N/A')}")
        print(f"Busquedas este mes: {account.get('total_searches_this_month', 0)}")

        plan_limit = account.get('plan_searches_left', 0) + account.get('total_searches_this_month', 0)
        searches_left = account.get('plan_searches_left', 0)

        print(f"Limite mensual: {plan_limit}")
        print(f"Busquedas restantes: {searches_left}")
        print("="*60 + "\n")

        if searches_left > 0:
            print("[OK] API key valida y con creditos disponibles")
            return True
        else:
            print("[ADVERTENCIA] API key valida pero sin creditos")
            return True

    except Exception as e:
        print(f"\n[ERROR] Error al verificar la API key: {e}")
        return False

if __name__ == '__main__':
    success = test_serpapi_key()

    if success:
        print("\n[EXITO] La configuracion de SerpAPI esta correcta")
        print("\nPuedes usar:")
        print("  - python comparador_serpapi_cli.py")
        print("  - python comparador_hibrido.py")
    else:
        print("\n[FALLO] Hay problemas con la configuracion")
        print("\nRevisa:")
        print("  1. API key en config/serpapi.json")
        print("  2. Instalacion: pip install google-search-results")

    input("\nPresiona Enter para salir...")
