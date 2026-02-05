# 🚀 PROYECTO COMPLETO: COTIZADOR INTELIGENTE CON SERPAPI

## 📋 DESCRIPCIÓN

Sistema profesional de cotización y comparación de repuestos vs equipos completos.

**Características:**
- ✅ Cotizaciones multi-plataforma (6 plataformas)
- ✅ Sistema de caché (30 días para equipos)
- ✅ Análisis comparativo inteligente
- ✅ Optimización de búsquedas
- ✅ Reportes en JSON y CSV

---

## 🎯 3 MODOS DE USO

### MODO 1: Solo SerpAPI (Profesional) ⭐

**Archivo:** `comparador_serpapi.py`

**Plataformas:**
- Google Shopping (agregador)
- Amazon México
- Walmart México
- eBay

**Búsquedas por query:** 4
**Límite mensual:** 250/4 = ~62 búsquedas distintas/mes

**Ventajas:**
- Sin problemas de anti-bot
- API estable
- Fácil mantenimiento

**Desventajas:**
- Límite de 250 búsquedas/mes (plan gratis)
- Requiere API key

**Uso:**
```bash
python comparador_serpapi.py
```

---

### MODO 2: Solo Scraping Directo (Gratis Ilimitado)

**Archivo:** `comparador_inteligente.py`

**Plataformas:**
- MercadoLibre
- AliExpress

**Búsquedas:** Ilimitadas y gratis
**Sin límites mensuales**

**Ventajas:**
- Totalmente gratis
- Búsquedas ilimitadas
- No requiere API key

**Desventajas:**
- Requiere ChromeDriver
- Problemas ocasionales de anti-bot
- Mantenimiento de selectores

**Uso:**
```bash
python comparador_inteligente.py
```

---

### MODO 3: Híbrido (Recomendado) 🏆

**Archivo:** `comparador_hibrido.py`

**Plataformas:**
- MercadoLibre (Scraping - gratis)
- AliExpress (Scraping - gratis)
- Amazon (SerpAPI - contado)
- Google Shopping (SerpAPI - contado)

**Búsquedas por query:** 2 gratis + 2 SerpAPI
**Límite mensual:** 250/2 = ~125 búsquedas distintas/mes

**Ventajas:**
- Lo mejor de ambos mundos
- 4-6 plataformas
- Optimiza límite SerpAPI
- Backup si una falla

**Uso:**
```bash
python comparador_hibrido.py
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
C:\CotizadorClaude\
├── 🎯 SCRIPTS PRINCIPALES
│   ├── comparador_serpapi.py         ⭐ Solo SerpAPI (4 plataformas)
│   ├── comparador_hibrido.py         🏆 Híbrido (scraping + API)
│   └── comparador_inteligente.py     🆓 Solo scraping directo
│
├── 🔧 SCRAPERS
│   ├── serpapi_scraper.py           → SerpAPI unificado
│   ├── mercadolibre_scraper.py      → MercadoLibre Selenium
│   └── aliexpress_scraper_v2.py     → AliExpress undetected
│
├── ⚙️ CONFIGURACIÓN
│   ├── config_serpapi.py            → Setup API key
│   ├── cache_equipos.py             → Sistema de caché
│   └── cotizacion_modelo.py         → Modelo de datos
│
├── 📄 DOCUMENTACIÓN
│   ├── README_SERPAPI.md            → Este archivo
│   ├── SETUP_SERPAPI.md             → Guía de configuración
│   ├── ESTADO_ACTUAL_SISTEMA.md     → Estado del proyecto
│   └── SERPAPI_INTEGRACION.md       → Detalles técnicos
│
├── 💾 DATOS
│   ├── config/                      → API keys
│   ├── cache/                       → Caché de equipos
│   └── resultados/                  → JSON y CSV
│
└── 🔨 UTILIDADES
    └── regenerar_csv.py             → Regenerar CSVs
```

---

## 🚀 INICIO RÁPIDO (5 MINUTOS)

### Paso 1: Obtener API Key (2 min)

1. Registro: https://serpapi.com/users/sign_up
2. Confirma email
3. Copia API key

### Paso 2: Configurar (1 min)

```bash
cd C:\CotizadorClaude
python config_serpapi.py
```

Pega tu API key cuando te lo pida.

### Paso 3: Primera Búsqueda (2 min)

**Opción A - Híbrido (Recomendado):**
```bash
python comparador_hibrido.py

Pieza: pantalla OLED Samsung S22 Plus
Modelo: Samsung S22 Plus
```

**Opción B - Solo SerpAPI:**
```bash
python comparador_serpapi.py

Pieza: pantalla OLED Samsung S22 Plus
Modelo: Samsung S22 Plus
```

**Opción C - Solo Scraping (sin API key):**
```bash
python comparador_inteligente.py

Pieza: pantalla OLED Samsung S22 Plus
Modelo: Samsung S22 Plus
```

---

## 📊 COMPARACIÓN DE MODOS

| Característica | Híbrido 🏆 | SerpAPI ⭐ | Scraping 🆓 |
|----------------|-----------|-----------|------------|
| **Plataformas** | 4-6 | 4 | 2 |
| **Búsquedas/mes** | ~125 | ~62 | ∞ |
| **Costo** | Gratis | Gratis | Gratis |
| **API key** | Sí | Sí | No |
| **Anti-bot** | Excelente | Excelente | Bueno |
| **Mantenimiento** | Bajo | Muy bajo | Medio |
| **Velocidad** | Media | Rápida | Lenta |
| **Confiabilidad** | Alta | Muy alta | Buena |

---

## 💰 EJEMPLO DE SALIDA

```
================================================================================
ANÁLISIS COMPARATIVO
================================================================================

💰 PRECIOS:
  Pieza (promedio): $1,730.50 MXN
  Equipo NUEVO: $15,000.00 MXN
  Equipo USADO: $8,000.00 MXN

📈 RELACIONES:
  Pieza vs Equipo NUEVO: 11.5%
  Pieza vs Equipo USADO: 21.6%

💡 RECOMENDACIÓN:
  ✅ REPARAR - Pieza cuesta solo 11.5% del equipo nuevo (MUY RENTABLE)

📊 RESUMEN DE BÚSQUEDAS
  🆓 Scraping directo (gratis): 6 búsquedas
  🔑 SerpAPI (contado): 4 búsquedas
  📊 Total: 10 búsquedas

  💡 Búsquedas SerpAPI restantes este mes: ~246
```

**Archivos generados:**
- `analisis_Samsung_S22_Plus_20260204_153045.json`
- `analisis_Samsung_S22_Plus_20260204_153045_piezas.csv`

---

## 🎯 FLUJO DE TRABAJO

### Primera Búsqueda de un Modelo:

```
Query: "pantalla OLED Samsung S22 Plus"
Modelo: "Samsung S22 Plus"

BÚSQUEDAS REALIZADAS:
├─ Pieza (4 plataformas) → 4 búsquedas SerpAPI
├─ Equipo nuevo (4 plataformas) → 4 búsquedas SerpAPI ✅ CACHEADO
└─ Equipo usado (4 plataformas) → 4 búsquedas SerpAPI ✅ CACHEADO

Total: 12 búsquedas (4 frescas + 8 cacheadas)
```

### Búsquedas Subsecuentes (Mismo Modelo):

```
Query: "batería Samsung S22 Plus"
Modelo: "Samsung S22 Plus"

BÚSQUEDAS REALIZADAS:
├─ Pieza (4 plataformas) → 4 búsquedas SerpAPI
├─ Equipo nuevo → 💾 CACHÉ (0 búsquedas)
└─ Equipo usado → 💾 CACHÉ (0 búsquedas)

Total: 4 búsquedas
```

### Con Modo Híbrido:

```
Query: "pantalla OLED Samsung S22 Plus"

BÚSQUEDAS:
├─ MercadoLibre → Gratis ∞
├─ AliExpress → Gratis ∞
├─ Amazon → 1 SerpAPI
└─ Google Shopping → 1 SerpAPI

Total: 2 SerpAPI (125 búsquedas/mes posibles)
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### Modificar Plataformas Usadas

**En `comparador_hibrido.py`:**

```python
# Desactivar plataformas que no necesites
# Comenta las líneas que no quieras usar

def cotizar_pieza_nueva(self, query_pieza: str, limite: int = 20):
    todas_cotizaciones = []
    
    # ✅ MercadoLibre (gratis)
    cot_ml = self.ml.buscar(query_pieza, limite)
    todas_cotizaciones.extend(cot_ml)
    
    # ✅ AliExpress (gratis)
    cot_ali = self.ali.buscar(query_pieza, limite)
    todas_cotizaciones.extend(cot_ali)
    
    # ❌ Comentar si no necesitas Amazon
    # cot_amazon = self.serpapi.buscar_amazon(query_pieza, limite)
    # todas_cotizaciones.extend(cot_amazon)
    
    # ✅ Google Shopping (recomendado - agregador)
    cot_google = self.serpapi.buscar_google_shopping(query_pieza, limite)
    todas_cotizaciones.extend(cot_google)
```

### Invalidar Caché

```python
from cache_equipos import CacheEquipos

cache = CacheEquipos()

# Invalidar un modelo específico
cache.invalidar("Samsung S22 Plus", "nuevo")
cache.invalidar("Samsung S22 Plus", "usado")

# Ver estado del caché
entradas = cache.listar_cache()
for entrada in entradas:
    print(f"{entrada['modelo']} ({entrada['condicion']}) - {entrada['dias_restantes']} días")
```

---

## 📊 GESTIÓN DE BÚSQUEDAS

### Verificar Créditos SerpAPI

```bash
python config_serpapi.py
```

Salida:
```
📊 ESTADO DE TU CUENTA SERPAPI:
  Plan: free
  Búsquedas este mes: 48
  Límite mensual: 250
  Restantes: 202
```

### Estrategias de Optimización

**Para 150 piezas/mes:**

```
ESTRATEGIA 1: Solo 2 plataformas SerpAPI
├─ Google Shopping: 75 búsquedas
├─ Amazon: 75 búsquedas
└─ Total: 150 búsquedas

ESTRATEGIA 2: Híbrido (RECOMENDADO)
├─ ML + AliExpress: 150 búsquedas gratis
├─ Amazon: 75 búsquedas SerpAPI
├─ Google Shopping: 75 búsquedas SerpAPI
└─ Total: 150 SerpAPI (dentro del límite)

ESTRATEGIA 3: Solo Scraping
├─ ML + AliExpress: ∞ gratis
└─ Sin límites
```

---

## 🐛 TROUBLESHOOTING

### Error: "API key no configurada"

```bash
python config_serpapi.py
```

### Error: "Too Many Requests"

Has excedido 250 búsquedas/mes.

**Soluciones:**
1. Esperar al próximo mes
2. Usar modo solo scraping
3. Actualizar a plan pagado ($50/mes para 5,000)

### Scrapers fallan

**MercadoLibre/AliExpress:**
```bash
# Verificar ChromeDriver
chromedriver --version

# Reinstalar undetected-chromedriver
pip install undetected-chromedriver --upgrade
```

### Búsquedas lentas

- Normal: 2-5 segundos por plataforma
- Múltiples plataformas = más tiempo
- Considera reducir `limite` de 20 a 10

---

## 📚 DOCUMENTACIÓN

- `SETUP_SERPAPI.md` → Guía de configuración completa
- `ESTADO_ACTUAL_SISTEMA.md` → Estado y arquitectura
- `SERPAPI_INTEGRACION.md` → Detalles de integración

---

## 🎓 CASOS DE USO REALES

### Caso 1: Taller de Reparación (150 piezas/mes)

**Modo:** Híbrido  
**Búsquedas:** 2 SerpAPI por pieza = 300/mes  
**Problema:** Excede 250/mes  
**Solución:** 
- Usar solo 1 plataforma SerpAPI (Google Shopping)
- ML + AliExpress gratis
- Total: 150 SerpAPI/mes ✅

### Caso 2: Uso Ocasional (10-20 piezas/mes)

**Modo:** Solo SerpAPI  
**Búsquedas:** 4 × 20 = 80/mes  
**Resultado:** Dentro del límite ✅

### Caso 3: Uso Intensivo (500+ piezas/mes)

**Modo:** Solo Scraping  
**Búsquedas:** Ilimitadas gratis  
**Resultado:** Sin límites ✅

---

## 🔮 ROADMAP FUTURO

- [ ] Google Sheets integration
- [ ] Dashboard web
- [ ] Alertas de precio
- [ ] Historial de precios
- [ ] Más plataformas (Liverpool, Sears)
- [ ] API REST propia

---

## 💡 RECOMENDACIÓN FINAL

**Para tu caso (150 búsquedas/mes):**

1. **AHORA:** Usa modo Híbrido
2. **Configura:** Solo Google Shopping en SerpAPI
3. **Resultado:** 150 SerpAPI + ilimitado gratis

**Configuración óptima:**
```python
# comparador_hibrido.py
# Usar solo Google Shopping de SerpAPI
# ML + AliExpress gratis
# = 150 SerpAPI/mes (dentro del límite)
```

---

## 📞 COMANDOS ÚTILES

```bash
# Setup inicial
python config_serpapi.py

# Test SerpAPI
python serpapi_scraper.py

# Comparador híbrido (recomendado)
python comparador_hibrido.py

# Comparador SerpAPI
python comparador_serpapi.py

# Comparador scraping
python comparador_inteligente.py

# Ver caché
python cache_equipos.py
```

---

## 📄 LICENCIA

Proyecto personal - Uso libre

---

**Archivo:** `README_SERPAPI.md`  
**Actualizado:** 2026-02-04  
**Versión:** 2.0 con SerpAPI
