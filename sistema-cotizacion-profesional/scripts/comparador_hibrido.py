#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comparador Híbrido: Scraping Directo + SerpAPI
La mejor de ambos mundos
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from mercadolibre_scraper import MercadoLibreSeleniumScraper
from aliexpress_scraper_v2 import AliExpressScraperV2
from serpapi_scraper import SerpAPIScraper
from cache_equipos import CacheEquipos
from cotizacion_modelo import Cotizacion
import json
import csv
from datetime import datetime
from dataclasses import asdict
from typing import List, Dict, Optional
import time

class ComparadorHibrido:
    """
    Comparador que combina:
    - Scraping directo (MercadoLibre + AliExpress) → GRATIS ILIMITADO
    - SerpAPI (Amazon + Google Shopping) → 2 búsquedas por query
    
    Optimización: 125 búsquedas/mes posibles vs 62 con 4 plataformas SerpAPI
    """
    
    def __init__(self, headless: bool = False):
        print("\n" + "="*80)
        print("COMPARADOR HÍBRIDO - SCRAPING + SERPAPI")
        print("="*80)
        print("🆓 Scraping directo: MercadoLibre + AliExpress (ilimitado)")
        print("🔑 SerpAPI: Amazon + Google Shopping (contado)")
        print("💾 Sistema de caché: Equipos completos (30 días)")
        print("="*80)
        
        self.headless = headless
        self.cache = CacheEquipos()
        
        # Contadores
        self.busquedas_gratis = 0
        self.busquedas_serpapi = 0
        
        try:
            self.serpapi = SerpAPIScraper()
            self.serpapi_disponible = True
            print("✓ SerpAPI: Disponible")
        except ValueError:
            self.serpapi_disponible = False
            print("⚠ SerpAPI: No configurado (solo usará scraping directo)")
    
    def cotizar_pieza_nueva(self, query_pieza: str, limite: int = 20) -> Dict:
        """
        Cotiza piezas NUEVAS usando todas las plataformas disponibles
        
        Args:
            query_pieza: "pantalla OLED Samsung S22 Plus"
            limite: Productos por plataforma
            
        Returns:
            Dict con cotizaciones y estadísticas
        """
        print("\n" + "🔍 " + "="*76)
        print(f"COTIZANDO PIEZA (BÚSQUEDA FRESCA): {query_pieza}")
        print("="*80)
        
        todas_cotizaciones = []
        
        # ============================================
        # PARTE 1: SCRAPING DIRECTO (GRATIS)
        # ============================================
        
        # MercadoLibre
        print("\n[1/4] MercadoLibre (Scraping directo - gratis)...")
        try:
            scraper = MercadoLibreSeleniumScraper(headless=self.headless)
            cot_ml = scraper.buscar_productos(query_pieza, limite=limite)
            todas_cotizaciones.extend(cot_ml)
            scraper.cerrar()
            self.busquedas_gratis += 1
            print(f"✓ {len(cot_ml)} productos")
        except Exception as e:
            print(f"✗ Error: {str(e)}")
        
        time.sleep(2)
        
        # AliExpress
        print("\n[2/4] AliExpress (Scraping directo - gratis)...")
        try:
            scraper = AliExpressScraperV2(headless=self.headless)
            cot_ali = scraper.buscar_productos(query_pieza, limite=limite)
            todas_cotizaciones.extend(cot_ali)
            scraper.cerrar()
            self.busquedas_gratis += 1
            print(f"✓ {len(cot_ali)} productos")
        except Exception as e:
            print(f"✗ Error: {str(e)}")
        
        # ============================================
        # PARTE 2: SERPAPI (CONTADO)
        # ============================================
        
        if self.serpapi_disponible:
            time.sleep(2)
            
            # Amazon
            print("\n[3/4] Amazon México (SerpAPI - contado)...")
            try:
                cot_amazon = self.serpapi.buscar_amazon(query_pieza, limite=limite)
                todas_cotizaciones.extend(cot_amazon)
                self.busquedas_serpapi += 1
                print(f"✓ {len(cot_amazon)} productos")
            except Exception as e:
                print(f"✗ Error: {str(e)}")
            
            time.sleep(1)
            
            # Google Shopping
            print("\n[4/4] Google Shopping (SerpAPI - contado)...")
            try:
                cot_google = self.serpapi.buscar_google_shopping(query_pieza, limite=limite)
                todas_cotizaciones.extend(cot_google)
                self.busquedas_serpapi += 1
                print(f"✓ {len(cot_google)} productos")
            except Exception as e:
                print(f"✗ Error: {str(e)}")
        else:
            print("\n⚠ SerpAPI no disponible - usando solo scraping directo")
        
        # Estadísticas
        if not todas_cotizaciones:
            print("\n⚠ No se encontraron productos")
            return None
        
        precios = [c.precio for c in todas_cotizaciones if c.precio > 0]
        
        if not precios:
            print("\n⚠ No se encontraron precios válidos")
            return None
        
        stats = {
            'cantidad': len(todas_cotizaciones),
            'precio_minimo': min(precios),
            'precio_promedio': sum(precios) / len(precios),
            'precio_maximo': max(precios),
            'cotizaciones': todas_cotizaciones
        }
        
        print(f"\n📊 ESTADÍSTICAS PIEZA:")
        print(f"  Total productos: {stats['cantidad']}")
        print(f"  Precio mínimo: ${stats['precio_minimo']:,.2f}")
        print(f"  Precio promedio: ${stats['precio_promedio']:,.2f}")
        print(f"  Precio máximo: ${stats['precio_maximo']:,.2f}")
        
        return stats
    
    def cotizar_equipo_completo(self, modelo: str, condicion: str, limite: int = 20) -> Dict:
        """
        Cotiza equipo completo (USA CACHÉ si disponible)
        
        Args:
            modelo: "Samsung S22 Plus"
            condicion: "nuevo" o "usado"
            limite: Productos por plataforma
            
        Returns:
            Dict con estadísticas
        """
        print("\n" + "🔍 " + "="*76)
        print(f"COTIZANDO EQUIPO: {modelo} ({condicion.upper()})")
        print("="*80)
        
        # Intentar caché
        cached = self.cache.obtener(modelo, condicion)
        if cached:
            print("💾 USANDO CACHÉ (no gasta búsquedas)")
            return cached
        
        # Búsqueda fresca
        print("🌐 BÚSQUEDA FRESCA")
        
        query = f"{modelo} {'usado reacondicionado' if condicion == 'usado' else 'nuevo'}"
        
        todas_cotizaciones = []
        
        # Scraping directo
        print("\n[1/4] MercadoLibre (Scraping - gratis)...")
        try:
            scraper = MercadoLibreSeleniumScraper(headless=self.headless)
            cot_ml = scraper.buscar_productos(query, limite=limite)
            todas_cotizaciones.extend(cot_ml)
            scraper.cerrar()
            self.busquedas_gratis += 1
            print(f"✓ {len(cot_ml)} productos")
        except Exception as e:
            print(f"✗ Error: {str(e)}")
        
        time.sleep(2)
        
        # AliExpress (solo para nuevos)
        if condicion == "nuevo":
            print("\n[2/4] AliExpress (Scraping - gratis)...")
            try:
                scraper = AliExpressScraperV2(headless=self.headless)
                cot_ali = scraper.buscar_productos(query, limite=limite)
                todas_cotizaciones.extend(cot_ali)
                scraper.cerrar()
                self.busquedas_gratis += 1
                print(f"✓ {len(cot_ali)} productos")
            except Exception as e:
                print(f"✗ Error: {str(e)}")
        
        # SerpAPI
        if self.serpapi_disponible:
            time.sleep(2)
            
            print("\n[3/4] Amazon (SerpAPI - contado)...")
            try:
                cot_amazon = self.serpapi.buscar_amazon(query, limite=limite)
                todas_cotizaciones.extend(cot_amazon)
                self.busquedas_serpapi += 1
                print(f"✓ {len(cot_amazon)} productos")
            except Exception as e:
                print(f"✗ Error: {str(e)}")
            
            time.sleep(1)
            
            print("\n[4/4] Google Shopping (SerpAPI - contado)...")
            try:
                cot_google = self.serpapi.buscar_google_shopping(query, limite=limite)
                todas_cotizaciones.extend(cot_google)
                self.busquedas_serpapi += 1
                print(f"✓ {len(cot_google)} productos")
            except Exception as e:
                print(f"✗ Error: {str(e)}")
        
        if not todas_cotizaciones:
            print("\n⚠ No se encontraron productos")
            return None
        
        precios = [c.precio for c in todas_cotizaciones if c.precio > 0]
        
        if not precios:
            print("\n⚠ No se encontraron precios válidos")
            return None
        
        stats = {
            'cantidad': len(todas_cotizaciones),
            'precio_minimo': min(precios),
            'precio_promedio': sum(precios) / len(precios),
            'precio_maximo': max(precios)
        }
        
        # Guardar en caché
        self.cache.guardar(modelo, condicion, stats)
        
        print(f"\n📊 ESTADÍSTICAS EQUIPO:")
        print(f"  Total productos: {stats['cantidad']}")
        print(f"  Precio mínimo: ${stats['precio_minimo']:,.2f}")
        print(f"  Precio promedio: ${stats['precio_promedio']:,.2f}")
        print(f"  Precio máximo: ${stats['precio_maximo']:,.2f}")
        
        return stats
    
    def analizar_comparacion(self, pieza: Dict, equipo_nuevo: Dict, 
                           equipo_usado: Optional[Dict]) -> Dict:
        """Análisis comparativo pieza vs equipo"""
        print("\n" + "📊 " + "="*76)
        print("ANÁLISIS COMPARATIVO")
        print("="*80)
        
        precio_pieza = pieza['precio_promedio']
        precio_nuevo = equipo_nuevo['precio_promedio']
        precio_usado = equipo_usado['precio_promedio'] if equipo_usado else None
        
        relacion_nuevo = (precio_pieza / precio_nuevo) * 100
        relacion_usado = (precio_pieza / precio_usado) * 100 if precio_usado else None
        
        print(f"\n💰 PRECIOS:")
        print(f"  Pieza (promedio): ${precio_pieza:,.2f} MXN")
        print(f"  Equipo NUEVO: ${precio_nuevo:,.2f} MXN")
        if precio_usado:
            print(f"  Equipo USADO: ${precio_usado:,.2f} MXN")
        
        print(f"\n📈 RELACIONES:")
        print(f"  Pieza vs Equipo NUEVO: {relacion_nuevo:.1f}%")
        if relacion_usado:
            print(f"  Pieza vs Equipo USADO: {relacion_usado:.1f}%")
        
        print(f"\n💡 RECOMENDACIÓN:")
        
        if relacion_nuevo < 20:
            recomendacion = f"✅ REPARAR - Pieza cuesta solo {relacion_nuevo:.1f}% del equipo nuevo"
            emoji = "✅"
        elif relacion_nuevo < 40:
            recomendacion = f"⚠️ EVALUAR - Pieza cuesta {relacion_nuevo:.1f}% del equipo nuevo"
            emoji = "⚠️"
        else:
            recomendacion = f"❌ COMPRAR NUEVO - Pieza cuesta {relacion_nuevo:.1f}% del equipo nuevo"
            emoji = "❌"
        
        print(f"  {recomendacion}")
        
        if precio_usado and relacion_usado:
            if relacion_usado > 50:
                print(f"\n  💡 Alternativa: Mejor comprar equipo usado (${precio_usado:,.2f})")
        
        return {
            'precio_pieza': precio_pieza,
            'precio_equipo_nuevo': precio_nuevo,
            'precio_equipo_usado': precio_usado,
            'relacion_nuevo_porcentaje': relacion_nuevo,
            'relacion_usado_porcentaje': relacion_usado,
            'recomendacion': recomendacion,
            'emoji': emoji
        }
    
    def guardar_analisis(self, query_pieza: str, modelo: str, pieza: Dict,
                        equipo_nuevo: Dict, equipo_usado: Optional[Dict],
                        analisis: Dict):
        """Guarda análisis en JSON y CSV"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        modelo_clean = modelo.replace(' ', '_')
        
        archivo_json = f"C:\\CotizadorClaude\\resultados\\analisis_{modelo_clean}_{timestamp}.json"
        os.makedirs(os.path.dirname(archivo_json), exist_ok=True)
        
        data = {
            'fecha_analisis': datetime.now().isoformat(),
            'query_pieza': query_pieza,
            'modelo_equipo': modelo,
            'busquedas_gratis': self.busquedas_gratis,
            'busquedas_serpapi': self.busquedas_serpapi,
            'busquedas_totales': self.busquedas_gratis + self.busquedas_serpapi,
            'pieza': {
                'cantidad_cotizaciones': pieza['cantidad'],
                'precio_minimo': pieza['precio_minimo'],
                'precio_promedio': pieza['precio_promedio'],
                'precio_maximo': pieza['precio_maximo'],
                'productos': [asdict(c) for c in pieza['cotizaciones']]
            },
            'equipo_nuevo': equipo_nuevo,
            'equipo_usado': equipo_usado,
            'analisis_comparativo': analisis
        }
        
        with open(archivo_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 JSON: {archivo_json}")
        
        # CSV
        archivo_csv = archivo_json.replace('.json', '_piezas.csv')
        self._generar_csv(pieza['cotizaciones'], archivo_csv)
        
        return archivo_json
    
    def _generar_csv(self, cotizaciones: List[Cotizacion], archivo: str):
        """Genera CSV de piezas"""
        with open(archivo, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'Plataforma', 'Titulo', 'Precio', 'Moneda',
                'Envio_Gratis', 'Tiempo_Entrega', 'Vendedor', 'URL'
            ])
            
            for cot in cotizaciones:
                writer.writerow([
                    cot.plataforma,
                    cot.titulo,
                    f"{cot.precio:.2f}",
                    cot.moneda,
                    "Sí" if getattr(cot, 'envio_gratis', False) else "No",
                    getattr(cot, 'tiempo_entrega', ''),
                    getattr(cot, 'vendedor', ''),
                    cot.url_compra
                ])
        
        print(f"💾 CSV: {archivo}")
    
    def mostrar_resumen(self):
        """Muestra resumen de búsquedas"""
        print("\n" + "="*80)
        print("📊 RESUMEN DE BÚSQUEDAS")
        print("="*80)
        print(f"🆓 Scraping directo (gratis): {self.busquedas_gratis} búsquedas")
        print(f"🔑 SerpAPI (contado): {self.busquedas_serpapi} búsquedas")
        print(f"📊 Total: {self.busquedas_gratis + self.busquedas_serpapi} búsquedas")
        
        if self.serpapi_disponible:
            restantes = 250 - self.busquedas_serpapi
            print(f"\n💡 Búsquedas SerpAPI restantes este mes: ~{restantes}")


def main():
    """Función principal"""
    print("="*80)
    print("🚀 COMPARADOR HÍBRIDO - SCRAPING + SERPAPI")
    print("="*80)
    print("La mejor combinación: Gratis ilimitado + API premium")
    print("="*80)
    
    # Input
    print("\n📝 DATOS:")
    query_pieza = input("Pieza a cotizar: ").strip()
    if not query_pieza:
        query_pieza = "pantalla OLED Samsung S22 Plus"
        print(f"→ Default: {query_pieza}")
    
    modelo = input("Modelo del equipo: ").strip()
    if not modelo:
        modelo = "Samsung S22 Plus"
        print(f"→ Default: {modelo}")
    
    try:
        comparador = ComparadorHibrido(headless=False)
        
        # Cotizar pieza
        pieza = comparador.cotizar_pieza_nueva(query_pieza, limite=20)
        if not pieza:
            print("\n❌ Error al cotizar pieza")
            return
        
        # Cotizar equipos
        equipo_nuevo = comparador.cotizar_equipo_completo(modelo, "nuevo", limite=20)
        if not equipo_nuevo:
            print("\n❌ Error al cotizar equipo nuevo")
            return
        
        equipo_usado = comparador.cotizar_equipo_completo(modelo, "usado", limite=20)
        
        # Analizar
        analisis = comparador.analizar_comparacion(pieza, equipo_nuevo, equipo_usado)
        
        # Guardar
        archivo = comparador.guardar_analisis(
            query_pieza, modelo, pieza, equipo_nuevo, equipo_usado, analisis
        )
        
        # Resumen
        comparador.mostrar_resumen()
        
        print("\n" + "="*80)
        print("✅ COMPLETADO")
        print("="*80)
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Interrumpido")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
