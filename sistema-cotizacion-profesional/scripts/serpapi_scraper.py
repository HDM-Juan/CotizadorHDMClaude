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
        self.tipo_cambio_usd_mxn = self._obtener_tipo_cambio()

        print(f"✓ SerpAPI inicializado (TC USD/MXN: {self.tipo_cambio_usd_mxn})")

    def _obtener_tipo_cambio(self) -> float:
        """Obtiene tipo de cambio USD→MXN. Usa API gratuita con fallback."""
        try:
            resp = requests.get(
                "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
                timeout=5
            )
            if resp.status_code == 200:
                rate = resp.json().get('usd', {}).get('mxn', 0)
                if rate > 0:
                    return round(rate, 2)
        except Exception:
            pass
        return 20.50  # Fallback conservador
    
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
                
                # URL (Google Shopping usa product_link para URL directa)
                url = item.get('product_link', '') or item.get('link', '') or item.get('serpapi_product_api', '')

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
        Busca en Amazon México.
        Intento 1: Engine nativo con amazon.com (más estable que .com.mx)
        Intento 2: Fallback con Google Search site:amazon.com.mx
        """
        print(f"\n[Amazon México] {query}")

        # Intento 1: Engine nativo de Amazon (amazon.com es más estable en SerpAPI)
        params = {
            'engine': 'amazon',
            'amazon_domain': 'amazon.com',
            'q': query
        }

        data = self._hacer_request(params, "Amazon (engine nativo)")

        cotizaciones = []
        organic_results = data.get('organic_results', [])

        for idx, item in enumerate(organic_results[:limite]):
            try:
                # Extraer precio (puede venir como dict o string)
                precio_raw = item.get('price', {})
                precio = 0.0
                if isinstance(precio_raw, dict):
                    precio = float(precio_raw.get('value', 0) or 0)
                    if precio == 0 and precio_raw.get('raw'):
                        precio = self._parsear_precio(str(precio_raw['raw']))
                elif precio_raw:
                    precio = self._parsear_precio(str(precio_raw))

                # También revisar price_string
                if precio == 0:
                    price_str = item.get('price_string', '')
                    if price_str:
                        precio = self._parsear_precio(str(price_str))

                titulo = item.get('title', 'Sin título')
                url = item.get('link', '')
                rating = item.get('rating')
                reviews = item.get('reviews_count')
                delivery = item.get('delivery', '')
                envio_gratis = 'gratis' in str(delivery).lower() if delivery else False

                cotizaciones.append(Cotizacion(
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
                ))

            except Exception as e:
                print(f"  ⚠ Error en producto {idx+1}: {str(e)}")
                continue

        # Intento 2: Fallback con Google Search si no hubo resultados
        if len(cotizaciones) == 0:
            print("  ⚠ Sin resultados del engine nativo, intentando via Google Search...")
            cotizaciones = self._buscar_amazon_google(query, limite)

        print(f"  → {len(cotizaciones)} productos extraídos ({sum(1 for c in cotizaciones if c.precio > 0)} con precio)")
        return cotizaciones

    def _buscar_amazon_google(self, query: str, limite: int = 10) -> List[Cotizacion]:
        """Fallback: busca productos Amazon via Google Search con site:"""
        params = {
            'engine': 'google',
            'q': f'site:amazon.com.mx {query}',
            'google_domain': 'google.com.mx',
            'hl': 'es',
            'num': min(limite, 20)
        }

        data = self._hacer_request(params, "Amazon (via Google)")
        cotizaciones = []
        organic_results = data.get('organic_results', [])

        for idx, item in enumerate(organic_results[:limite]):
            try:
                titulo = item.get('title', 'Sin título')
                url = item.get('link', '')

                # Filtrar URLs que no son de productos
                if '/dp/' not in url and '/gp/' not in url:
                    continue

                precio = self._extraer_precio_google(item)

                cotizaciones.append(Cotizacion(
                    plataforma="Amazon MX",
                    titulo=titulo,
                    precio=precio,
                    moneda="MXN",
                    url_compra=url,
                    vendedor="Amazon"
                ))
            except Exception as e:
                print(f"  ⚠ Error en producto {idx+1}: {str(e)}")
                continue

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
                    precio = self._parsear_precio(str(precio_raw.get('raw', '0')))
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
    
    def _extraer_precio_google(self, item: dict) -> float:
        """Extrae precio de un resultado de Google Search buscando en múltiples campos"""
        import re

        precio = 0.0

        # 1. Buscar en rich_snippet (datos estructurados de Google)
        rich = item.get('rich_snippet', {})
        if isinstance(rich, dict):
            # rich_snippet.top.detected_extensions.price
            top = rich.get('top', {})
            extensions = top.get('detected_extensions', {})
            if extensions.get('price'):
                precio = self._parsear_precio(str(extensions['price']))
                if precio > 0:
                    return precio
            # rich_snippet.top.extensions (lista de strings)
            for ext in top.get('extensions', []):
                if '$' in str(ext):
                    match = re.search(r'\$[\s]*([\d,.]+)', str(ext))
                    if match:
                        precio = self._parsear_precio(match.group(1))
                        if precio > 0:
                            return precio

        # 2. Buscar en snippet y título
        for text in [item.get('snippet', ''), item.get('title', '')]:
            if not text:
                continue
            # Buscar formatos: $1,234.56 | $1234 | $ 1,234 | US $12.34 | US$ 12.34
            matches = re.findall(r'(?:US\s*)?[\$]\s*([\d,]+\.?\d*)', text)
            for m in matches:
                p = self._parsear_precio(m)
                if p > 0:
                    return p

        # 3. Buscar en snippet_highlighted_words
        for word in item.get('snippet_highlighted_words', []):
            if '$' in str(word):
                match = re.search(r'\$[\s]*([\d,]+\.?\d*)', str(word))
                if match:
                    precio = self._parsear_precio(match.group(1))
                    if precio > 0:
                        return precio

        return 0.0

    def buscar_mercadolibre(self, query: str, limite: int = 10) -> List[Cotizacion]:
        """Busca en MercadoLibre México via Google Search"""
        print(f"\n[MercadoLibre] {query}")

        params = {
            'engine': 'google',
            'q': f'site:mercadolibre.com.mx {query}',
            'google_domain': 'google.com.mx',
            'hl': 'es',
            'num': min(limite, 20)
        }

        data = self._hacer_request(params, "MercadoLibre")
        cotizaciones = []
        organic_results = data.get('organic_results', [])

        for idx, item in enumerate(organic_results[:limite]):
            try:
                titulo = item.get('title', 'Sin título')
                url = item.get('link', '')

                # Filtrar URLs que no son de productos (categorías, búsquedas)
                if '/MLM-' not in url and '/p/' not in url:
                    continue

                precio = self._extraer_precio_google(item)

                cotizaciones.append(Cotizacion(
                    plataforma="MercadoLibre",
                    titulo=titulo,
                    precio=precio,
                    moneda="MXN",
                    url_compra=url,
                    vendedor="MercadoLibre"
                ))
            except Exception as e:
                print(f"  ⚠ Error en producto {idx+1}: {str(e)}")
                continue

        print(f"  → {len(cotizaciones)} productos extraídos ({sum(1 for c in cotizaciones if c.precio > 0)} con precio)")
        return cotizaciones

    def buscar_aliexpress(self, query: str, limite: int = 10) -> List[Cotizacion]:
        """Busca en AliExpress via Google Search"""
        print(f"\n[AliExpress] {query}")

        params = {
            'engine': 'google',
            'q': f'site:aliexpress.com {query}',
            'hl': 'es',
            'num': min(limite, 20)
        }

        data = self._hacer_request(params, "AliExpress")
        cotizaciones = []
        organic_results = data.get('organic_results', [])

        for idx, item in enumerate(organic_results[:limite]):
            try:
                titulo = item.get('title', 'Sin título')
                url = item.get('link', '')

                # Filtrar URLs que no son de productos
                if '/item/' not in url and '/i/' not in url:
                    continue

                precio = self._extraer_precio_google(item)

                cotizaciones.append(Cotizacion(
                    plataforma="AliExpress",
                    titulo=titulo,
                    precio=precio,
                    moneda="USD",
                    url_compra=url,
                    vendedor="AliExpress"
                ))
            except Exception as e:
                print(f"  ⚠ Error en producto {idx+1}: {str(e)}")
                continue

        print(f"  → {len(cotizaciones)} productos extraídos ({sum(1 for c in cotizaciones if c.precio > 0)} con precio)")
        return cotizaciones

    def _categorizar_por_tienda(self, cotizacion: Cotizacion) -> str:
        """Identifica la plataforma real basándose en el vendedor/source de Google Shopping"""
        source = (cotizacion.vendedor or '').lower()
        url = (cotizacion.url_compra or '').lower()

        # MercadoLibre
        if 'mercado' in source or 'meli' in source or 'mercadolibre' in url:
            return 'MercadoLibre'
        # Amazon
        if 'amazon' in source or 'amazon' in url:
            return 'Amazon MX'
        # AliExpress
        if 'aliexpress' in source or 'ali express' in source or 'aliexpress' in url:
            return 'AliExpress'
        # Otras tiendas conocidas
        if 'walmart' in source or 'walmart' in url:
            return 'Walmart'
        if 'liverpool' in source:
            return 'Liverpool'
        if 'elektra' in source:
            return 'Elektra'

        # Devolver el nombre real de la tienda para ver cuáles hay
        return source.title() if source else 'Desconocido'

    # Plataformas permitidas (solo estas se incluyen en resultados)
    PLATAFORMAS_PERMITIDAS = {'MercadoLibre', 'AliExpress', 'Amazon MX', 'eBay'}

    def buscar_todas_plataformas(self, query: str, limite_por_plataforma: int = 20) -> List[Cotizacion]:
        """
        Busca en todas las plataformas deseadas:
        - MercadoLibre (vía Google Search site:) - puede no tener precio
        - AliExpress (vía Google Shopping)
        - Amazon (vía Google Shopping)
        - eBay (engine dedicado)

        Filtra: solo plataformas permitidas, solo resultados con precio > 0
        (excepto MercadoLibre que se incluye aunque no tenga precio).

        Consume 3 búsquedas SerpAPI por ronda.
        """
        print("\n" + "="*80)
        print(f"BÚSQUEDA MULTI-PLATAFORMA: {query}")
        print("="*80)

        todas_cotizaciones = []
        conteo = {}

        # 1. MercadoLibre - vía Google Search site: (1 búsqueda SerpAPI)
        #    Puede no tener precio pero es la plataforma más usada
        try:
            cot_ml = self.buscar_mercadolibre(query, 15)
            todas_cotizaciones.extend(cot_ml)
            conteo['MercadoLibre'] = len(cot_ml)
            time.sleep(1)
        except Exception as e:
            print(f"⚠ Error en MercadoLibre: {str(e)}")

        # 2. Google Shopping - para AliExpress y Amazon (1 búsqueda SerpAPI)
        #    Solo se conservan plataformas permitidas con precio > 0
        try:
            cot_shopping = self.buscar_google_shopping(query, 60)

            for cot in cot_shopping:
                plataforma_real = self._categorizar_por_tienda(cot)
                cot.plataforma = plataforma_real

                # Solo mantener plataformas permitidas con precio
                if plataforma_real not in self.PLATAFORMAS_PERMITIDAS:
                    continue
                if cot.precio <= 0:
                    continue

                # AliExpress en Google Shopping MX: precios son USD aunque diga MXN
                if plataforma_real == 'AliExpress' and cot.precio < 200:
                    cot.moneda = 'USD'

                todas_cotizaciones.append(cot)
                conteo[plataforma_real] = conteo.get(plataforma_real, 0) + 1

            time.sleep(1)

        except Exception as e:
            print(f"⚠ Error en Google Shopping: {str(e)}")

        # 3. eBay - engine dedicado (1 búsqueda SerpAPI)
        try:
            cot_ebay = self.buscar_ebay(query, limite_por_plataforma)
            # Solo eBay con precio
            cot_ebay_filtrado = [c for c in cot_ebay if c.precio > 0]
            todas_cotizaciones.extend(cot_ebay_filtrado)
            conteo['eBay'] = len(cot_ebay_filtrado)
        except Exception as e:
            print(f"⚠ Error en eBay: {str(e)}")

        # 4. Convertir todos los precios USD a MXN
        convertidos = 0
        for cot in todas_cotizaciones:
            if cot.moneda == 'USD' and cot.precio > 0:
                cot.precio = round(cot.precio * self.tipo_cambio_usd_mxn, 2)
                cot.moneda = 'MXN'
                convertidos += 1

        # Resumen
        print(f"\n  📊 Resultados por plataforma:")
        for plat, cant in sorted(conteo.items(), key=lambda x: -x[1]):
            print(f"     {plat}: {cant} productos")
        if convertidos > 0:
            print(f"\n  💱 {convertidos} precios convertidos USD→MXN (TC: ${self.tipo_cambio_usd_mxn})")

        total_con_precio = sum(1 for c in todas_cotizaciones if c.precio > 0)
        total_sin_precio = len(todas_cotizaciones) - total_con_precio

        print("\n" + "="*80)
        print(f"TOTAL: {len(todas_cotizaciones)} productos ({total_con_precio} con precio, {total_sin_precio} sin precio)")
        print(f"Plataformas: {', '.join(conteo.keys())}")
        print(f"Búsquedas SerpAPI usadas: 3")
        print("="*80)

        return todas_cotizaciones
    
    def _parsear_precio(self, precio_str: str) -> float:
        """Parsea string de precio a float"""
        try:
            # Convertir a string y limpiar
            precio_clean = str(precio_str)

            # Remover símbolos de moneda y espacios
            precio_clean = precio_clean.replace('$', '').replace('USD', '').replace('MXN', '')
            precio_clean = precio_clean.replace('€', '').replace('£', '')

            # Remover comas (separadores de miles)
            precio_clean = precio_clean.replace(',', '')

            # Limpiar espacios
            precio_clean = precio_clean.strip()

            # Si está vacío, retornar 0
            if not precio_clean or precio_clean == '':
                return 0.0

            return float(precio_clean)
        except Exception as e:
            # En caso de error, retornar 0
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
