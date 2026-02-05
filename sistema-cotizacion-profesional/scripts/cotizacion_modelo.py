#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Estructura de datos común para todas las plataformas
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Cotizacion:
    """
    Estructura de datos para cotización de producto
    
    DATOS GARANTIZADOS (siempre disponibles):
    - id_busqueda: ID único de la búsqueda
    - id_cotizacion: ID único de la cotización
    - plataforma: Nombre de la plataforma (MercadoLibre, Amazon, etc.)
    - titulo: Título del producto
    - precio: Precio principal del producto
    - moneda: Código de moneda (MXN, USD, etc.)
    - url_compra: URL directa al producto
    - fecha_extraccion: Timestamp de extracción
    
    DATOS OPCIONALES (dependen de la plataforma):
    - calificacion: Rating del producto/vendedor (0.0-5.0)
    - num_resenas: Número de reseñas/calificaciones
    - envio_gratis: Si el envío es gratis
    - tiempo_entrega: Estimado de tiempo (texto: "2-3 días", "Llega mañana")
    - vendedor: Nombre del vendedor
    - condicion: Nuevo/Usado/Reacondicionado
    - disponibilidad: Stock disponible o mensaje de disponibilidad
    - imagen_url: URL de la imagen principal
    
    DATOS NO DISPONIBLES EN SCRAPING (requieren checkout):
    - costo_envio_exacto: Costo exacto del envío
    - impuestos: Impuestos aplicables
    - costos_importacion: Costos de aduana/importación
    - precio_final_total: Precio todo incluido
    """
    
    # OBLIGATORIOS
    id_busqueda: str
    id_cotizacion: str
    plataforma: str
    titulo: str
    precio: float
    moneda: str
    url_compra: str
    
    # OPCIONALES - Set None si no disponible
    calificacion: Optional[float] = None
    num_resenas: Optional[int] = None
    envio_gratis: Optional[bool] = None
    tiempo_entrega: Optional[str] = None
    vendedor: Optional[str] = None
    condicion: Optional[str] = None
    disponibilidad: Optional[str] = None
    imagen_url: Optional[str] = None
    
    # METADATA
    fecha_extraccion: Optional[str] = None
    
    def __post_init__(self):
        """Genera fecha de extracción si no se proporciona"""
        if self.fecha_extraccion is None:
            self.fecha_extraccion = datetime.now().isoformat()


# Mapeo de plataformas soportadas
PLATAFORMAS = {
    'mercadolibre': {
        'nombre': 'MercadoLibre',
        'url_base': 'https://listado.mercadolibre.com.mx',
        'moneda': 'MXN',
        'pais': 'México'
    },
    'amazon': {
        'nombre': 'Amazon México',
        'url_base': 'https://www.amazon.com.mx',
        'moneda': 'MXN',
        'pais': 'México'
    },
    'aliexpress': {
        'nombre': 'AliExpress',
        'url_base': 'https://es.aliexpress.com',
        'moneda': 'USD',
        'pais': 'Internacional'
    },
    'ebay': {
        'nombre': 'eBay',
        'url_base': 'https://www.ebay.com',
        'moneda': 'USD',
        'pais': 'Internacional'
    }
}
