#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configuración de SerpAPI
Gestiona la API key de forma segura
"""

import os
import json

class ConfigSerpAPI:
    """Maneja la configuración de SerpAPI"""
    
    def __init__(self):
        self.config_file = "C:\\CotizadorClaude\\config\\serpapi_config.json"
        self.api_key = None
        self._cargar_config()
    
    def _cargar_config(self):
        """Carga la API key desde archivo o variable de entorno"""
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
        
        # Intentar cargar desde archivo
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    self.api_key = config.get('api_key')
                    if self.api_key:
                        print("✓ API key cargada desde archivo")
                        return
            except:
                pass
        
        # Intentar desde variable de entorno
        self.api_key = os.environ.get('SERPAPI_KEY')
        if self.api_key:
            print("✓ API key cargada desde variable de entorno")
            return
        
        print("⚠ No se encontró API key")
    
    def configurar_api_key(self, api_key: str):
        """
        Guarda la API key
        
        Args:
            api_key: Tu API key de SerpAPI
        """
        self.api_key = api_key
        
        config = {'api_key': api_key}
        
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"✓ API key guardada en: {self.config_file}")
    
    def obtener_api_key(self) -> str:
        """Retorna la API key o lanza error si no está configurada"""
        if not self.api_key:
            raise ValueError(
                "API key no configurada.\n"
                "Opciones:\n"
                "1. Ejecuta: python config_serpapi.py\n"
                "2. O establece variable de entorno: SERPAPI_KEY\n"
                "3. Regístrate gratis en: https://serpapi.com/users/sign_up"
            )
        return self.api_key
    
    def verificar_creditos(self):
        """Verifica créditos restantes en SerpAPI"""
        import requests
        
        try:
            response = requests.get(
                'https://serpapi.com/account',
                params={'api_key': self.obtener_api_key()}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n📊 ESTADO DE TU CUENTA SERPAPI:")
                print(f"  Plan: {data.get('plan', 'N/A')}")
                print(f"  Búsquedas este mes: {data.get('this_month_usage', 0)}")
                print(f"  Límite mensual: {data.get('monthly_searches_limit', 'N/A')}")
                print(f"  Restantes: {data.get('searches_remaining', 'N/A')}")
                return data
            else:
                print(f"⚠ Error al verificar cuenta: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"⚠ Error: {str(e)}")
            return None


def configurar_interactivo():
    """Configuración interactiva de la API key"""
    print("="*80)
    print("CONFIGURACIÓN DE SERPAPI")
    print("="*80)
    print()
    print("Para obtener tu API key gratuita:")
    print("1. Visita: https://serpapi.com/users/sign_up")
    print("2. Regístrate con tu email")
    print("3. Copia tu API key del dashboard")
    print()
    
    config = ConfigSerpAPI()
    
    if config.api_key:
        print(f"✓ Ya tienes una API key configurada")
        respuesta = input("¿Quieres cambiarla? (s/n): ").strip().lower()
        if respuesta != 's':
            config.verificar_creditos()
            return
    
    print()
    api_key = input("Pega tu API key aquí: ").strip()
    
    if not api_key:
        print("⚠ API key vacía, cancelado")
        return
    
    config.configurar_api_key(api_key)
    print()
    print("Verificando...")
    config.verificar_creditos()


if __name__ == "__main__":
    configurar_interactivo()
