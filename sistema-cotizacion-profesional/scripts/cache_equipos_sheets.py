#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cache de Equipos usando Google Sheets como base de datos
Reemplaza cache_equipos.py que usaba archivos JSON locales
"""

import requests
from datetime import datetime, timedelta
from typing import Optional, Dict

class CacheEquiposSheets:
    """
    Maneja caché de equipos usando Google Sheets via Web App
    
    Ventajas sobre archivo JSON local:
    - Centralizado y accesible desde cualquier lugar
    - No depende de archivos locales
    - Visible y administrable desde Google Sheets
    - Más confiable y persistente
    """
    
    def __init__(self, web_app_url: str):
        """
        Args:
            web_app_url: URL del Web App de Google Apps Script
        """
        self.web_app_url = web_app_url
        self.duracion_dias = 30
    
    def obtener(self, marca: str, modelo: str, condicion: str) -> Optional[Dict]:
        """
        Obtiene estadísticas del caché si están disponibles y no han expirado
        
        Args:
            marca: Marca del equipo (ej: "Samsung")
            modelo: Modelo del equipo (ej: "S22 Plus")
            condicion: "nuevo" o "usado"
            
        Returns:
            Dict con estadísticas o None si no hay caché válido
        """
        try:
            params = {
                'action': 'obtenerCache',
                'marca': marca,
                'modelo': modelo,
                'condicion': condicion
            }
            
            response = requests.get(self.web_app_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and data.get('cached'):
                    print(f"  💾 Cache encontrado para {marca} {modelo} ({condicion})")
                    return data['data']
                else:
                    print(f"  ⚠️ No hay cache para {marca} {modelo} ({condicion})")
                    return None
            else:
                print(f"  ❌ Error obteniendo cache: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"  ❌ Error de conexión: {str(e)}")
            return None
    
    def guardar(self, marca: str, modelo: str, condicion: str, estadisticas: Dict):
        """
        Guarda estadísticas en el caché de Google Sheets
        
        Args:
            marca: Marca del equipo
            modelo: Modelo del equipo
            condicion: "nuevo" o "usado"
            estadisticas: Dict con min, max, promedio, cantidad
        """
        try:
            payload = {
                'action': 'guardarCache',
                'marca': marca,
                'modelo': modelo,
                'condicion': condicion,
                'estadisticas': estadisticas
            }
            
            response = requests.post(
                self.web_app_url,
                json=payload,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"  ✅ Cache guardado: {marca} {modelo} ({condicion})")
                else:
                    print(f"  ⚠️ Error al guardar: {data.get('error', 'Unknown')}")
            else:
                print(f"  ❌ Error HTTP: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Error guardando cache: {str(e)}")
    
    def invalidar(self, marca: str, modelo: str, condicion: str):
        """Invalida (borra) entrada del caché"""
        try:
            params = {
                'action': 'invalidarCache',
                'marca': marca,
                'modelo': modelo,
                'condicion': condicion
            }
            
            response = requests.post(
                self.web_app_url,
                json=params,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"  🗑️ Cache invalidado: {marca} {modelo} ({condicion})")
            else:
                print(f"  ❌ Error invalidando cache")
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
    
    def listar_todo(self) -> list:
        """Lista todos los elementos en caché"""
        try:
            params = {'action': 'listarCache'}
            response = requests.get(self.web_app_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('cache', [])
            else:
                return []
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            return []


# ============================================
# TEST
# ============================================

if __name__ == "__main__":
    # URL del Web App (actualizar)
    WEB_APP_URL = "https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec"
    
    cache = CacheEquiposSheets(WEB_APP_URL)
    
    # Test: guardar
    cache.guardar("Samsung", "S22 Plus", "nuevo", {
        'minimo': 12000,
        'promedio': 15000,
        'maximo': 18000,
        'cantidad': 15
    })
    
    # Test: recuperar
    cached = cache.obtener("Samsung", "S22 Plus", "nuevo")
    print(f"\n📊 Datos recuperados: {cached}")
    
    # Test: listar
    todos = cache.listar_todo()
    print(f"\n📋 Total en cache: {len(todos)}")
