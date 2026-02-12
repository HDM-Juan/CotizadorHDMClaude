#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comparador SerpAPI - Versión CLI
Para ser llamado desde Node.js backend
Output: JSON
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from serpapi_scraper import SerpAPIScraper
from cache_equipos import CacheEquipos
from cotizacion_modelo import Cotizacion
import json
import argparse
from datetime import datetime
from typing import List, Dict
from dataclasses import asdict

class ComparadorCLI:
    """Comparador para uso desde línea de comandos"""

    def __init__(self, quiet=False):
        self.quiet = quiet
        self.scraper = SerpAPIScraper()
        self.cache = CacheEquipos()

    def log(self, mensaje):
        """Log solo si no está en modo quiet"""
        if not self.quiet:
            print(mensaje, file=sys.stderr)

    def buscar_completo(self, query_pieza: str, query_modelo: str,
                       id_busqueda: str = None) -> Dict:
        """
        Ejecuta búsqueda completa de pieza + equipos

        Args:
            query_pieza: "pantalla OLED Samsung S22 Plus"
            query_modelo: "Samsung S22 Plus"
            id_busqueda: ID único de la búsqueda

        Returns:
            Dict con todos los resultados en formato JSON
        """
        self.log(f"\n🔍 Búsqueda: {query_pieza}")
        self.log(f"📱 Modelo: {query_modelo}")

        resultado = {
            'id_busqueda': id_busqueda,
            'query_pieza': query_pieza,
            'query_modelo': query_modelo,
            'timestamp': datetime.now().isoformat(),
            'piezas': [],
            'equipos_nuevos': [],
            'equipos_usados': [],
            'estadisticas': {},
            'busquedas_serpapi': 0
        }

        # 1. Buscar pieza (siempre fresco)
        self.log("\n📦 Buscando pieza...")
        cotizaciones_pieza = self.scraper.buscar_todas_plataformas(
            query_pieza,
            limite_por_plataforma=20
        )

        resultado['busquedas_serpapi'] += 3  # MercadoLibre + Google Shopping + eBay

        # Convertir a dict (manejar tanto objetos Cotizacion como dicts del cache)
        resultado['piezas'] = [
            c if isinstance(c, dict) else asdict(c)
            for c in cotizaciones_pieza
        ]

        self.log(f"   ✓ {len(resultado['piezas'])} piezas encontradas")

        # 2. Buscar equipos nuevos (con caché optimizado)
        self.log("\n🆕 Buscando equipos nuevos...")
        equipos_nuevos, busquedas_nuevo, stats_nuevo = self._buscar_equipo_cacheado(
            query_modelo, "nuevo"
        )
        resultado['equipos_nuevos'] = equipos_nuevos
        resultado['busquedas_serpapi'] += busquedas_nuevo
        self.log(f"   ✓ {len(equipos_nuevos)} equipos nuevos" if equipos_nuevos else f"   ✓ Estadísticas cacheadas")

        # 3. Buscar equipos usados (con caché optimizado)
        self.log("\n♻️  Buscando equipos usados...")
        equipos_usados, busquedas_usado, stats_usado = self._buscar_equipo_cacheado(
            query_modelo, "usado"
        )
        resultado['equipos_usados'] = equipos_usados
        resultado['busquedas_serpapi'] += busquedas_usado
        self.log(f"   ✓ {len(equipos_usados)} equipos usados" if equipos_usados else f"   ✓ Estadísticas cacheadas")

        # 4. Calcular estadísticas
        # Si hay stats cacheados, usarlos; si no, calcular de las cotizaciones
        resultado['estadisticas'] = self._calcular_estadisticas_con_cache(
            resultado['piezas'],
            equipos_nuevos if equipos_nuevos else None,
            equipos_usados if equipos_usados else None,
            stats_nuevo,
            stats_usado
        )

        self.log(f"\n📊 Total búsquedas SerpAPI: {resultado['busquedas_serpapi']}")

        return resultado

    def _buscar_equipo_cacheado(self, modelo: str, condicion: str) -> tuple:
        """
        Busca equipo con sistema de caché
        
        OPTIMIZADO: Solo guarda estadísticas, no todas las cotizaciones

        Returns:
            (estadisticas_dict, busquedas_realizadas)
        """
        # Intentar obtener del caché
        cached = self.cache.obtener(modelo, condicion)

        if cached:
            # cached son las estadísticas calculadas
            self.log(f"   💾 Estadísticas cargadas del caché")
            # Retornar en formato compatible (lista vacía para cotizaciones)
            return [], 0, cached

        # No está en caché, buscar
        self.log("   🔄 No hay caché, buscando...")

        query = f"{modelo} {'nuevo' if condicion == 'nuevo' else 'usado'}"
        cotizaciones = self.scraper.buscar_todas_plataformas(query, 15)

        # Convertir a dict
        cotizaciones_dict = [
            c if isinstance(c, dict) else asdict(c)
            for c in cotizaciones
        ]

        # Calcular estadísticas
        estadisticas = self._calcular_estadisticas_equipo(cotizaciones_dict)

        # Guardar SOLO estadísticas en caché (no las 15-20 cotizaciones)
        self.cache.guardar(modelo, condicion, estadisticas)
        
        self.log(f"   💾 Guardadas estadísticas en caché (precio promedio: ${estadisticas.get('promedio', 0):.2f})")

        return cotizaciones_dict, 3, estadisticas  # MercadoLibre + Google Shopping + eBay
    
    def _calcular_estadisticas_equipo(self, cotizaciones: List[Dict]) -> Dict:
        """Calcula estadísticas de un conjunto de cotizaciones de equipos"""
        if not cotizaciones:
            return {}
        
        precios = [c['precio'] for c in cotizaciones if c.get('precio', 0) > 0]
        
        if not precios:
            return {}
        
        return {
            'cantidad': len(precios),
            'minimo': min(precios),
            'promedio': sum(precios) / len(precios),
            'maximo': max(precios),
            'timestamp_calculo': datetime.now().isoformat()
        }

    def _calcular_estadisticas_con_cache(self, piezas: List[Dict],
                                          nuevos: List[Dict],
                                          usados: List[Dict],
                                          stats_nuevo_cached: Dict,
                                          stats_usado_cached: Dict) -> Dict:
        """
        Calcula estadísticas usando datos cacheados cuando estén disponibles
        
        Args:
            piezas: Lista de cotizaciones de piezas (siempre frescas)
            nuevos: Lista de cotizaciones de equipos nuevos (None si hay cache)
            usados: Lista de cotizaciones de equipos usados (None si hay cache)
            stats_nuevo_cached: Estadísticas cacheadas de equipos nuevos
            stats_usado_cached: Estadísticas cacheadas de equipos usados
        """
        stats = {
            'pieza': {},
            'equipo_nuevo': {},
            'equipo_usado': {},
            'comparacion': {}
        }

        # Estadísticas de pieza (siempre se calcula fresco)
        if piezas:
            precios_pieza = [p['precio'] for p in piezas if p['precio'] > 0]
            if precios_pieza:
                stats['pieza'] = {
                    'cantidad': len(precios_pieza),
                    'minimo': min(precios_pieza),
                    'promedio': sum(precios_pieza) / len(precios_pieza),
                    'maximo': max(precios_pieza)
                }

        # Estadísticas de equipos nuevos (usar cache si está disponible)
        if stats_nuevo_cached:
            stats['equipo_nuevo'] = stats_nuevo_cached
        elif nuevos:
            precios_nuevo = [e['precio'] for e in nuevos if e['precio'] > 0]
            if precios_nuevo:
                stats['equipo_nuevo'] = {
                    'cantidad': len(precios_nuevo),
                    'minimo': min(precios_nuevo),
                    'promedio': sum(precios_nuevo) / len(precios_nuevo),
                    'maximo': max(precios_nuevo)
                }

        # Estadísticas de equipos usados (usar cache si está disponible)
        if stats_usado_cached:
            stats['equipo_usado'] = stats_usado_cached
        elif usados:
            precios_usado = [e['precio'] for e in usados if e['precio'] > 0]
            if precios_usado:
                stats['equipo_usado'] = {
                    'cantidad': len(precios_usado),
                    'minimo': min(precios_usado),
                    'promedio': sum(precios_usado) / len(precios_usado),
                    'maximo': max(precios_usado)
                }

        # Comparaciones
        if stats.get('pieza') and stats.get('equipo_nuevo'):
            prom_pieza = stats['pieza']['promedio']
            prom_nuevo = stats['equipo_nuevo']['promedio']
            stats['comparacion']['pieza_vs_nuevo_pct'] = (prom_pieza / prom_nuevo * 100) if prom_nuevo > 0 else 0

        if stats.get('pieza') and stats.get('equipo_usado'):
            prom_pieza = stats['pieza']['promedio']
            prom_usado = stats['equipo_usado']['promedio']
            stats['comparacion']['pieza_vs_usado_pct'] = (prom_pieza / prom_usado * 100) if prom_usado > 0 else 0

        # Recomendación
        if stats['comparacion'].get('pieza_vs_nuevo_pct'):
            pct = stats['comparacion']['pieza_vs_nuevo_pct']
            if pct < 30:
                stats['comparacion']['recomendacion'] = 'REPARAR - Muy rentable'
            elif pct < 60:
                stats['comparacion']['recomendacion'] = 'REPARAR - Rentable'
            else:
                stats['comparacion']['recomendacion'] = 'EVALUAR - Considerar equipo nuevo'

        return stats
    
    def _calcular_estadisticas(self, piezas: List[Dict],
                               nuevos: List[Dict],
                               usados: List[Dict]) -> Dict:
        """Calcula estadísticas de precios"""

        stats = {
            'pieza': {},
            'equipo_nuevo': {},
            'equipo_usado': {},
            'comparacion': {}
        }

        # Estadísticas de pieza
        if piezas:
            precios_pieza = [p['precio'] for p in piezas if p['precio'] > 0]
            if precios_pieza:
                stats['pieza'] = {
                    'cantidad': len(precios_pieza),
                    'minimo': min(precios_pieza),
                    'promedio': sum(precios_pieza) / len(precios_pieza),
                    'maximo': max(precios_pieza)
                }

        # Estadísticas de equipos nuevos
        if nuevos:
            precios_nuevo = [e['precio'] for e in nuevos if e['precio'] > 0]
            if precios_nuevo:
                stats['equipo_nuevo'] = {
                    'cantidad': len(precios_nuevo),
                    'minimo': min(precios_nuevo),
                    'promedio': sum(precios_nuevo) / len(precios_nuevo),
                    'maximo': max(precios_nuevo)
                }

        # Estadísticas de equipos usados
        if usados:
            precios_usado = [e['precio'] for e in usados if e['precio'] > 0]
            if precios_usado:
                stats['equipo_usado'] = {
                    'cantidad': len(precios_usado),
                    'minimo': min(precios_usado),
                    'promedio': sum(precios_usado) / len(precios_usado),
                    'maximo': max(precios_usado)
                }

        # Comparaciones
        if stats.get('pieza') and stats.get('equipo_nuevo'):
            prom_pieza = stats['pieza']['promedio']
            prom_nuevo = stats['equipo_nuevo']['promedio']
            stats['comparacion']['pieza_vs_nuevo_pct'] = (prom_pieza / prom_nuevo * 100) if prom_nuevo > 0 else 0

        if stats.get('pieza') and stats.get('equipo_usado'):
            prom_pieza = stats['pieza']['promedio']
            prom_usado = stats['equipo_usado']['promedio']
            stats['comparacion']['pieza_vs_usado_pct'] = (prom_pieza / prom_usado * 100) if prom_usado > 0 else 0

        # Recomendación
        if stats['comparacion'].get('pieza_vs_nuevo_pct'):
            pct = stats['comparacion']['pieza_vs_nuevo_pct']
            if pct < 30:
                stats['comparacion']['recomendacion'] = 'REPARAR - Muy rentable'
            elif pct < 60:
                stats['comparacion']['recomendacion'] = 'REPARAR - Rentable'
            else:
                stats['comparacion']['recomendacion'] = 'EVALUAR - Considerar equipo nuevo'

        return stats


def main():
    """Función principal CLI"""
    parser = argparse.ArgumentParser(
        description='Comparador SerpAPI - Versión CLI'
    )

    parser.add_argument(
        '--query-pieza',
        required=True,
        help='Query para buscar la pieza (ej: "pantalla OLED Samsung S22 Plus")'
    )

    parser.add_argument(
        '--query-modelo',
        required=True,
        help='Query para buscar el modelo completo (ej: "Samsung S22 Plus")'
    )

    parser.add_argument(
        '--id-busqueda',
        default=None,
        help='ID único de la búsqueda'
    )

    parser.add_argument(
        '--output-json',
        action='store_true',
        help='Salida en formato JSON (para Node.js)'
    )

    parser.add_argument(
        '--quiet',
        action='store_true',
        help='Modo silencioso (sin logs)'
    )

    args = parser.parse_args()

    try:
        # Crear comparador
        comparador = ComparadorCLI(quiet=args.quiet or args.output_json)

        # Ejecutar búsqueda
        resultado = comparador.buscar_completo(
            args.query_pieza,
            args.query_modelo,
            args.id_busqueda
        )

        if args.output_json:
            # Output solo JSON (para Node.js) - UNA SOLA LÍNEA para parsing fácil
            print(json.dumps(resultado, ensure_ascii=False))
        else:
            # Output formateado para humanos
            print("\n" + "="*80)
            print("RESULTADOS")
            print("="*80)
            print(f"\n📦 Piezas: {len(resultado['piezas'])}")
            print(f"🆕 Equipos nuevos: {len(resultado['equipos_nuevos'])}")
            print(f"♻️  Equipos usados: {len(resultado['equipos_usados'])}")

            if resultado['estadisticas'].get('pieza'):
                stats = resultado['estadisticas']['pieza']
                print(f"\n💰 Precio pieza (promedio): ${stats['promedio']:,.2f}")

            if resultado['estadisticas'].get('comparacion'):
                comp = resultado['estadisticas']['comparacion']
                if comp.get('recomendacion'):
                    print(f"\n💡 {comp['recomendacion']}")

            print(f"\n🔑 Búsquedas SerpAPI: {resultado['busquedas_serpapi']}")
            print("\n" + "="*80)

        sys.exit(0)

    except Exception as e:
        error = {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

        if args.output_json:
            print(json.dumps(error, ensure_ascii=False), file=sys.stderr)
        else:
            print(f"\n❌ ERROR: {str(e)}", file=sys.stderr)

        sys.exit(1)


if __name__ == "__main__":
    main()
