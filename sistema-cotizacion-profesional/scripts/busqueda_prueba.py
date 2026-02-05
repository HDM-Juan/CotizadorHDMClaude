#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Búsqueda de prueba con SerpAPI
"""

import json
import sys
from pathlib import Path

def busqueda_prueba():
    """Realizar búsqueda de prueba"""

    print("\n" + "="*70)
    print("BUSQUEDA DE PRUEBA - SERPAPI")
    print("="*70 + "\n")

    # Cargar API key
    config_path = Path(__file__).parent.parent / 'config' / 'serpapi.json'

    with open(config_path, 'r') as f:
        config = json.load(f)

    api_key = config['api_key']

    # Importar SerpAPI
    from serpapi import GoogleSearch

    # Búsqueda de prueba: Pantalla iPhone 14
    query = "pantalla iPhone 14 Mexico"

    print(f"[1/3] Buscando en Google Shopping: {query}")
    print("-" * 70)

    params = {
        "engine": "google_shopping",
        "q": query,
        "location": "Mexico",
        "hl": "es",
        "gl": "mx",
        "num": 10,
        "api_key": api_key
    }

    try:
        search = GoogleSearch(params)
        results = search.get_dict()

        shopping_results = results.get("shopping_results", [])

        if not shopping_results:
            print("\n[INFO] No se encontraron resultados")
            return

        print(f"\n[OK] Se encontraron {len(shopping_results)} resultados\n")
        print("="*70)
        print("RESULTADOS:")
        print("="*70 + "\n")

        for i, item in enumerate(shopping_results[:5], 1):
            titulo = item.get('title', 'Sin titulo')
            precio = item.get('price', 'Sin precio')
            origen = item.get('source', 'Sin origen')
            link = item.get('link', 'Sin link')

            print(f"{i}. {titulo}")
            print(f"   Precio: {precio}")
            print(f"   Tienda: {origen}")
            print(f"   Link: {link[:60]}...")
            print()

        print("="*70)

        # Verificar créditos restantes
        account = search.get_account()
        searches_left = account.get('plan_searches_left', 0)

        print(f"\n[INFO] Busquedas restantes: {searches_left}")
        print(f"[INFO] Esta busqueda uso 1 credito")

        print("\n" + "="*70)
        print("PRUEBA EXITOSA!")
        print("="*70)
        print("\nEl sistema esta funcionando correctamente.")
        print("\nPuedes usar:")
        print("  - comparador_serpapi_cli.py (solo SerpAPI)")
        print("  - comparador_hibrido.py (SerpAPI + Scraping - recomendado)")

    except Exception as e:
        print(f"\n[ERROR] Error durante la busqueda: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    try:
        busqueda_prueba()
    except KeyboardInterrupt:
        print("\n\n[INFO] Busqueda cancelada por el usuario")
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Error inesperado: {e}")
        sys.exit(1)
