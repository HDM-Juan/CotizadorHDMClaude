#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema de Caché para Equipos Completos
Cachea búsquedas de equipos nuevos/usados por 30 días
"""

import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List

class CacheEquipos:
    """
    Maneja caché de búsquedas de equipos completos
    
    OPTIMIZADO: Solo guarda estadísticas calculadas (min, max, promedio, cantidad)
    en lugar de todas las cotizaciones completas.
    
    Esto reduce el tamaño del caché de ~500KB a ~5KB por modelo.
    """
    
    def __init__(self, cache_dir: str = "C:\\CotizadorClaude\\cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        self.cache_file = os.path.join(cache_dir, "equipos_cache.json")
        self.duracion_dias = 30
        self._cargar_cache()
    
    def _cargar_cache(self):
        """Carga el caché desde disco"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.cache = json.load(f)
            except:
                self.cache = {}
        else:
            self.cache = {}
    
    def _guardar_cache(self):
        """Guarda el caché a disco"""
        with open(self.cache_file, 'w', encoding='utf-8') as f:
            json.dump(self.cache, f, ensure_ascii=False, indent=2)
    
    def _generar_clave(self, modelo: str, condicion: str) -> str:
        """Genera clave única para el caché"""
        # Normalizar: "Samsung S22 Plus" + "nuevo" -> "samsung_s22_plus_nuevo"
        modelo_clean = modelo.lower().replace(' ', '_')
        condicion_clean = condicion.lower()
        return f"{modelo_clean}_{condicion_clean}"
    
    def obtener(self, modelo: str, condicion: str) -> Optional[Dict]:
        """
        Obtiene datos del caché si están disponibles y no han expirado
        
        Args:
            modelo: Modelo del equipo (ej: "Samsung S22 Plus")
            condicion: "nuevo" o "usado"
            
        Returns:
            Dict con datos o None si no hay caché válido
        """
        clave = self._generar_clave(modelo, condicion)
        
        if clave not in self.cache:
            return None
        
        entrada = self.cache[clave]
        fecha_cache = datetime.fromisoformat(entrada['fecha'])
        
        # Verificar si expiró (30 días)
        if datetime.now() - fecha_cache > timedelta(days=self.duracion_dias):
            print(f"  Cache expirado para {modelo} ({condicion})")
            del self.cache[clave]
            self._guardar_cache()
            return None
        
        dias_restantes = self.duracion_dias - (datetime.now() - fecha_cache).days
        print(f"  Cache valido para {modelo} ({condicion}) - {dias_restantes} dias restantes")
        return entrada['datos']
    
    def guardar(self, modelo: str, condicion: str, datos: Dict):
        """
        Guarda datos en el caché
        
        Args:
            modelo: Modelo del equipo
            condicion: "nuevo" o "usado"
            datos: Estadísticas y productos
        """
        clave = self._generar_clave(modelo, condicion)
        
        self.cache[clave] = {
            'modelo': modelo,
            'condicion': condicion,
            'fecha': datetime.now().isoformat(),
            'expira': (datetime.now() + timedelta(days=self.duracion_dias)).isoformat(),
            'datos': datos
        }
        
        self._guardar_cache()
        print(f"  Guardado en cache: {modelo} ({condicion})")
    
    def invalidar(self, modelo: str, condicion: str):
        """Invalida (borra) entrada del caché"""
        clave = self._generar_clave(modelo, condicion)
        if clave in self.cache:
            del self.cache[clave]
            self._guardar_cache()
            print(f"  Cache invalidado: {modelo} ({condicion})")
    
    def listar_cache(self) -> List[Dict]:
        """Lista todas las entradas del caché con su estado"""
        resultado = []
        
        for clave, entrada in self.cache.items():
            fecha_cache = datetime.fromisoformat(entrada['fecha'])
            expira = datetime.fromisoformat(entrada['expira'])
            dias_restantes = (expira - datetime.now()).days
            
            resultado.append({
                'modelo': entrada['modelo'],
                'condicion': entrada['condicion'],
                'fecha_cache': entrada['fecha'],
                'expira': entrada['expira'],
                'dias_restantes': dias_restantes,
                'valido': dias_restantes > 0
            })
        
        return resultado


def test_cache():
    """Prueba del sistema de caché"""
    print("="*80)
    print("TEST - SISTEMA DE CACHE")
    print("="*80)
    
    cache = CacheEquipos()
    
    # Datos de ejemplo
    datos_nuevo = {
        'cantidad': 20,
        'precio_promedio': 15000.0,
        'precio_minimo': 12000.0,
        'precio_maximo': 18000.0
    }
    
    datos_usado = {
        'cantidad': 15,
        'precio_promedio': 8000.0,
        'precio_minimo': 6000.0,
        'precio_maximo': 10000.0
    }
    
    # Guardar
    print("\n1. Guardando en caché...")
    cache.guardar("Samsung S22 Plus", "nuevo", datos_nuevo)
    cache.guardar("Samsung S22 Plus", "usado", datos_usado)
    
    # Obtener
    print("\n2. Obteniendo del caché...")
    resultado_nuevo = cache.obtener("Samsung S22 Plus", "nuevo")
    print(f"  Nuevo: ${resultado_nuevo['precio_promedio']:,.2f}")
    
    resultado_usado = cache.obtener("Samsung S22 Plus", "usado")
    print(f"  Usado: ${resultado_usado['precio_promedio']:,.2f}")
    
    # Listar
    print("\n3. Listando caché...")
    entradas = cache.listar_cache()
    for entrada in entradas:
        print(f"  {entrada['modelo']} ({entrada['condicion']}) - {entrada['dias_restantes']} días restantes")
    
    print("\nTest completado")


if __name__ == "__main__":
    test_cache()
