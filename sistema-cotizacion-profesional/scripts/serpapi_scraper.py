#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SerpAPI Scraper Unificado
Soporta: Google Shopping, Amazon, Walmart, eBay
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from config_serpapi import ConfigSerpAPI
from cotizacion_modelo import Cotizacion
import requests
from typing import List, Optional
import time

class SerpAPIScraper:
    """Scraper unificado para múltiples plataformas usando SerpAPI"""
    
    def __init__(self):
        self.config = ConfigSerpAPI()
        self.api_key = self.config.obtener_api_key()
        self.base_url = "https://serpapi.com/search"
        
        print(f"✓ SerpAPI inicializado")
    
    def _hacer_request(self, params: dict, plataforma: str) -> dict:
        """Hace request a SerpAPI con manejo de errores"""
        params['api_key'] = self.api_key
        
        print(f"  Consultando {plataforma}...", end=" ")
        
        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                print("✓")
                return data
            else:
                print(f"✗ Error {response.status_code}")
                return {}
                
        except Exception as e:
            print(f"✗ {str(e)}")
            return {}
    
    def buscar_google_shopping(self, query: str, limite: int = 20) -> List[Cotizacion]:
        """
        Busca en Google Shopping (agregador de múltiples tiendas)
        
        Args:
            query: Búsqueda (ej: "pantalla OLED Samsung S22 Plus")
            limite: Máximo de productos
            
        Returns:
            Lista de cotizaciones
        """
        print(f"\n[Google Shopping] {query}")
        
        params = {
            'engine': 'google_shopping',
            'q': query,
            'location': 'Mexico',
            'google_domain': 'google.com.mx',
            'hl': 'es',
            'num': min(limite, 100)
        }
        
        data = self._hacer_request(params, "Google Shopping")
        
        cotizaciones = []
        
        # Extraer productos
        shopping_results = data.get('shopping_results', [])
        
        for idx, item in enumerate(shopping_results[:limite]):
            try:
                # Precio
                precio_raw = item.get('price', '0')
                precio = self._parsear_precio(precio_raw)
                
                # Título
                titulo = item.get('title', 'Sin título')
                
                # Vendedor
                vendedor = item.get('source', '') or item.get('merchant', 'Desconocido')
                
                # URL
                url = item.get('link', '')
                
                # Calificación
                rating = item.get('rating')
                reviews = item.get('reviews')
                
                # Envío
                shipping = item.get('delivery', '')
                envio_gratis = 'gratis' in str(shipping).lower() if shipping else False
                
                cotizacion = Cotizacion(
                    plataforma="Google Shopping",
                    titulo=titulo,
                    precio=precio,
                    moneda="MXN",
                    url_compra=url,
                    calificacion=rating if rating else "",
                    num_resenas=reviews if reviews else "",
                    envio_gratis=envio_gratis,
                    tiempo_entrega=shipping if shipping else "",
                    vendedor=vendedor
                )
                
                cotizaciones.append(cotizacion)
                
            except Exception as e:
                print(f"  ⚠ Error en producto {idx+1}: {str(e)}")
                continue
        
        print(f"  → {len(cotizaciones)} productos extraídos")
        return cotizaciones
    
    def buscar_amazon(self, query: str, limite: int = 20) -> List[Cotizacion]:
        """
        Busca en Amazon México
        
        Args:
            query: Búsqueda
            limite: Máximo de productos
            
        Returns:
            Lista de cotizaciones
        """
        print(f"\n[Amazon México] {query}")
        
        params = {
            'engine': 'amazon',
            'amazon_domain': 'amazon.com.mx',
            'q': query,
            'page': 1
        }
        
        data = self._hacer_request(params, "Amazon")
        
        cotizaciones = []
        
        # Extraer productos
        organic_results = data.get('organic_results', [])
        
        for idx, item in enumerate(organic_results[:limite]):
            try:
                # Precio
                precio_raw = item.get('price', {}).get('value', 0)
                precio = float(precio_raw) if precio_raw else 0
                
                # Título
                titulo = item.get('title', 'Sin título')
                
                # URL
                url = item.get('link', '')
                
                # Rating
                rating = item.get('rating')
                reviews = item.get('reviews_count')
                
                # Envío
                delivery = item.get('delivery', '')
                envio_gratis = 'gratis' in str(delivery).lower() if delivery else False
                
                cotizacion = Cotizacion(
                    plataforma="Amazon MX",
                    titulo=titulo,
                    precio=precio,
                    moneda="MXN",
                    url_compra=url,
                    calificacion=str(rating) if rating else "",
                    num_resenas=str(reviews) if reviews else "",
                    envio_gratis=envio_gratis,
                    tiempo_entrega=delivery if delivery else "",
                    vendedor="Amazon"
                )
                
                cotizaciones.append(cotizacion)
                
            except Exception as e:
                print(f"  ⚠ Error en producto {idx+1}: {str(e)}")
                continue
        
        print(f"  → {len(cotizaciones)} productos extraídos")
        return cotizaciones
    
    def buscar_walmart(self, query: str, limite: int = 20) -> List[Cotizacion]:
        """
        Busca en Walmart México
        
        Args:
            query: Búsqueda
            limite: Máximo de productos
            
        Returns:
            Lista de cotizaciones
        """
        print(f"\n[Walmart México] {query}")
        
        params = {
            'engine': 'walmart',
            'query': query,
            'store_id': '4001',  # México
            'max_page': 1
        }
        
        data = self._hacer_request(params, "Walmart")
        
        cotizaciones = []
        
        # Extraer productos
        organic_results = data.get('organic_results', [])
        
        for idx, item in enumerate(organic_results[:limite]):
            try:
                # Precio
                precio_raw = item.get('primary_offer', {}).get('offer_price', 0)
                precio = float(precio_raw) if precio_raw else 0
                
                # Título
                titulo = item.get('title', 'Sin título')
                
                # URL
                url = item.get('product_page_url', '')
                
                # Rating
                rating = item.get('rating')
                reviews = item.get('reviews')
                
                cotizacion = Cotizacion(
                    plataforma="Walmart MX",
                    titulo=titulo,
                    precio=precio,
                    moneda="MXN",
                    url_compra=url,
                    calificacion=str(rating) if rating else "",
                    num_resenas=str(reviews) if reviews else "",
                    envio_gratis=False,  # Walmart no siempre proporciona esto
                    tiempo_entrega="",
                    vendedor="Walmart"
                )
                
                cotizaciones.append(cotizacion)
                
            except Exception as e:
                print(f"  ⚠ Error en producto {idx+1}: {str(e)}")
                continue
        
        print(f"  → {len(cotizaciones)} productos extraídos")
        return cotizaciones
    
    def buscar_ebay(self, query: str, limite: int = 20) -> List[Cotizacion]:
        """
        Busca en eBay
        
        Args:
            query: Búsqueda
            limite: Máximo de productos
            
        Returns:
            Lista de cotizaciones
        """
        print(f"\n[eBay] {query}")
        
        params = {
            'engine': 'ebay',
            'ebay_domain': 'ebay.com',
            '_nkw': query,
            '_ipg': min(limite, 50)
        }
        
        data = self._hacer_request(params, "eBay")
        
        cotizaciones = []
        
        # Extraer productos
        organic_results = data.get('organic_results', [])
        
        for idx, item in enumerate(organic_results[:limite]):
            try:
                # Precio
                precio_raw = item.get('price', {})
                if isinstance(precio_raw, dict):
                    precio = float(precio_raw.get('raw', 0))
                else:
                    precio = self._parsear_precio(str(precio_raw))
                
                # Título
                titulo = item.get('title', 'Sin título')
                
                # URL
                url = item.get('link', '')
                
                # Condición
                condition = item.get('condition', '')
                
                # Shipping
                shipping = item.get('shipping', {})
                envio_gratis = False
                if isinstance(shipping, dict):
                    envio_gratis = shipping.get('free', False)
                
                cotizacion = Cotizacion(
                    plataforma="eBay",
                    titulo=f"{titulo} ({condition})" if condition else titulo,
                    precio=precio,
                    moneda="USD",  # eBay generalmente en USD
                    url_compra=url,
                    calificacion="",
                    num_resenas="",
                    envio_gratis=envio_gratis,
                    tiempo_entrega="",
                    vendedor="eBay"
                )
                
                cotizaciones.append(cotizacion)
                
            except Exception as e:
                print(f"  ⚠ Error en producto {idx+1}: {str(e)}")
                continue
        
        print(f"  → {len(cotizaciones)} productos extraídos")
        return cotizaciones
    
    def buscar_todas_plataformas(self, query: str, limite_por_plataforma: int = 20) -> List[Cotizacion]:
        """
        Busca en todas las plataformas disponibles
        
        Args:
            query: Búsqueda
            limite_por_plataforma: Productos por plataforma
            
        Returns:
            Lista combinada de todas las plataformas
        """
        print("\n" + "="*80)
        print(f"BÚSQUEDA MULTI-PLATAFORMA: {query}")
        print("="*80)
        
        todas_cotizaciones = []
        
        # Google Shopping (agregador - muy importante)
        try:
            cot_google = self.buscar_google_shopping(query, limite_por_plataforma)
            todas_cotizaciones.extend(cot_google)
            time.sleep(1)
        except Exception as e:
            print(f"⚠ Error en Google Shopping: {str(e)}")
        
        # Amazon México
        try:
            cot_amazon = self.buscar_amazon(query, limite_por_plataforma)
            todas_cotizaciones.extend(cot_amazon)
            time.sleep(1)
        except Exception as e:
            print(f"⚠ Error en Amazon: {str(e)}")
        
        # Walmart México
        try:
            cot_walmart = self.buscar_walmart(query, limite_por_plataforma)
            todas_cotizaciones.extend(cot_walmart)
            time.sleep(1)
        except Exception as e:
            print(f"⚠ Error en Walmart: {str(e)}")
        
        # eBay (opcional - internacional)
        try:
            cot_ebay = self.buscar_ebay(query, limite_por_plataforma)
            todas_cotizaciones.extend(cot_ebay)
        except Exception as e:
            print(f"⚠ Error en eBay: {str(e)}")
        
        print("\n" + "="*80)
        print(f"TOTAL: {len(todas_cotizaciones)} productos de todas las plataformas")
        print("="*80)
        
        return todas_cotizaciones
    
    def _parsear_precio(self, precio_str: str) -> float:
        """Parsea string de precio a float"""
        try:
            # Remover símbolos y comas
            precio_clean = str(precio_str).replace('$', '').replace(',', '').replace('MXN', '').strip()
            return float(precio_clean)
        except:
            return 0.0


def test_serpapi():
    """Test del scraper SerpAPI"""
    print("="*80)
    print("TEST SERPAPI SCRAPER")
    print("="*80)
    
    try:
        scraper = SerpAPIScraper()
        
        query = input("\nProducto a buscar (Enter = pantalla Samsung S22): ").strip()
        if not query:
            query = "pantalla Samsung S22"
        
        # Buscar en todas las plataformas
        cotizaciones = scraper.buscar_todas_plataformas(query, limite_por_plataforma=5)
        
        # Mostrar resultados
        print(f"\n📊 RESULTADOS ({len(cotizaciones)} productos):\n")
        
        for idx, cot in enumerate(cotizaciones[:10], 1):
            print(f"{idx}. [{cot.plataforma}] {cot.titulo[:60]}")
            print(f"   ${cot.precio:,.2f} {cot.moneda}")
            print()
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\n💡 Asegúrate de configurar tu API key:")
        print("   python config_serpapi.py")


if __name__ == "__main__":
    test_serpapi()
