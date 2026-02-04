# 🔌 Guía de Configuración de APIs

**CotizadorClaude - Sistema de Cotización Hospital del Móvil**

---

## 📋 Resumen

Esta guía te ayudará a configurar las credenciales de API para conectar el sistema con las plataformas de comercio electrónico: Amazon, eBay, Mercado Libre y AliExpress.

---

## 🛠️ Paso 1: Instalar Dependencias

Primero, instala las librerías necesarias:

```bash
npm install dotenv axios amazon-paapi mercadolibre ebay-api
```

---

## 📦 APIs Disponibles

### 1. **Amazon Product Advertising API** 🟠

**¿Qué necesitas?**
- Access Key
- Secret Key
- Partner Tag (Associate ID)

**Cómo obtener credenciales:**

1. Ve a [Amazon Associates](https://affiliate-program.amazon.com/)
2. Regístrate o inicia sesión
3. Ve a **Tools** → **Product Advertising API**
4. Solicita acceso (requiere al menos 3 ventas cualificadas en 180 días)
5. Una vez aprobado, ve a **Security Credentials**
6. Crea un nuevo **Access Key**

**Copiar a .env:**
```
AMAZON_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AMAZON_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AMAZON_PARTNER_TAG=tupartner-20
```

**Limitaciones:**
- Requiere tener una cuenta de Amazon Associates activa
- Límite de 1 request por segundo (para cuentas nuevas)
- Solo funciona en regiones específicas (US, UK, DE, FR, JP, etc.)

---

### 2. **eBay API** 🔵

**¿Qué necesitas?**
- App ID (Client ID)
- Cert ID (Client Secret)
- Dev ID

**Cómo obtener credenciales:**

1. Ve a [eBay Developers Program](https://developer.ebay.com/)
2. Regístrate o inicia sesión
3. Ve a **My Account** → **Application Keys**
4. Crea una nueva aplicación (Sandbox o Production)
5. Copia las credenciales generadas

**Copiar a .env:**
```
EBAY_APP_ID=TuAppID-Example-PRD-1234567890
EBAY_CERT_ID=PRD-1234567890-abcd-efgh-ijkl-mnopqrstuvwx
EBAY_DEV_ID=1234567890-abcd-efgh-ijkl-mnopqrstuvwx
```

**Limitaciones:**
- Sandbox tiene datos limitados
- Production requiere aprobación
- 5,000 llamadas/día para cuentas básicas

**API Útiles:**
- **Finding API**: Búsqueda de productos
- **Shopping API**: Obtener detalles de productos
- **Browse API**: Navegación avanzada

---

### 3. **Mercado Libre API** 🟡

**¿Qué necesitas?**
- Client ID
- Client Secret
- Access Token

**Cómo obtener credenciales:**

1. Ve a [Mercado Libre Developers](https://developers.mercadolibre.com/)
2. Regístrate o inicia sesión
3. Ve a **Mis Aplicaciones** → **Crear nueva aplicación**
4. Completa el formulario:
   - Nombre: CotizadorHDM
   - Short Name: cotizador
   - Redirect URI: http://localhost:3000/callback
5. Obtén tu **Client ID** y **Client Secret**

**Para obtener Access Token:**

```bash
# 1. Abre esta URL en tu navegador (reemplaza CLIENT_ID):
https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=TU_CLIENT_ID&redirect_uri=http://localhost:3000/callback

# 2. Autoriza la aplicación

# 3. Copia el "code" de la URL de redirección

# 4. Usa este endpoint para obtener el token:
POST https://api.mercadolibre.com/oauth/token
{
  "grant_type": "authorization_code",
  "client_id": "TU_CLIENT_ID",
  "client_secret": "TU_CLIENT_SECRET",
  "code": "EL_CODE_QUE_OBTUVISTE",
  "redirect_uri": "http://localhost:3000/callback"
}
```

**Copiar a .env:**
```
ML_CLIENT_ID=1234567890123456
ML_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
ML_ACCESS_TOKEN=APP_USR-1234567890123456-010100-abcdef1234567890
```

**Limitaciones:**
- Access Token expira cada 6 horas (usa Refresh Token)
- 1,000 requests/hora para cuentas básicas
- Algunas búsquedas requieren autenticación

**Endpoints Útiles:**
- `GET /sites/MLM/search?q=pantalla+iphone`: Búsqueda de productos
- `GET /items/{id}`: Detalles de producto
- `GET /items/{id}/shipping_options`: Opciones de envío

---

### 4. **AliExpress API** 🔴 (Opcional)

**¿Qué necesitas?**
- App Key
- App Secret

**Cómo obtener credenciales:**

1. Ve a [AliExpress Open Platform](https://portals.aliexpress.com/)
2. Regístrate como desarrollador
3. Crea una aplicación
4. Obtén tu **App Key** y **App Secret**

**Copiar a .env:**
```
ALIEXPRESS_APP_KEY=12345678
ALIEXPRESS_APP_SECRET=abcdef1234567890abcdef1234567890
```

**Limitaciones:**
- Requiere verificación de negocio
- Documentación limitada en español
- Tiempos de entrega largos (puede no ser útil)

---

## 🚀 Paso 2: Configurar el Archivo .env

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita el archivo `.env` con tus credenciales reales:
```bash
notepad .env
```

3. **IMPORTANTE**: Nunca subas el archivo `.env` a Git
   - El archivo `.gitignore` ya lo excluye
   - Usa `.env.example` para compartir la estructura

---

## 🧪 Paso 3: Probar las Conexiones

El backend ya tiene endpoints para probar cada API:

```bash
# Probar Amazon
curl http://localhost:3000/api/test/amazon?query=iphone+13+screen

# Probar eBay
curl http://localhost:3000/api/test/ebay?query=iphone+13+screen

# Probar Mercado Libre
curl http://localhost:3000/api/test/mercadolibre?query=pantalla+iphone+13

# Probar AliExpress
curl http://localhost:3000/api/test/aliexpress?query=iphone+13+display
```

---

## 📝 Paso 4: Usar las APIs en el Sistema

Una vez configuradas, el sistema usará automáticamente las APIs reales cuando ejecutes búsquedas.

### Ejemplo de búsqueda de pieza:

**Frontend** → **Backend (puerto 3000)** → **APIs externas**

```javascript
// El HTML llama a:
POST http://localhost:3000/api/search
{
  "tipo": "pieza",
  "marca": "Apple",
  "modelo": "iPhone 13",
  "pieza": "Pantalla",
  "variantes": ["OLED", "Original"]
}

// El backend busca en:
// 1. Mercado Libre (México)
// 2. eBay (Global)
// 3. Amazon (US/MX)
// 4. AliExpress (opcional)

// Y devuelve resultados combinados
```

---

## ⚡ Modo Desarrollo vs Producción

### Modo Desarrollo (Datos Simulados)

Si NO tienes credenciales de API configuradas, el sistema usa **datos simulados**:
- Genera 40 resultados ficticios
- Precios aleatorios realistas
- Tiempos de entrega simulados
- No consume cuotas de API

### Modo Producción (APIs Reales)

Cuando configures `.env`, el sistema automáticamente:
- Usa APIs reales
- Combina resultados de múltiples plataformas
- Calcula costos de envío reales
- Obtiene precios actualizados

---

## 🔒 Seguridad

1. **NUNCA** compartas tus credenciales de API
2. **NUNCA** subas el archivo `.env` a GitHub
3. Usa variables de entorno en producción
4. Rota tus keys periódicamente
5. Monitorea el uso de cuotas

---

## 🐛 Troubleshooting

### Error: "API Key inválida"
- Verifica que copiaste la key completa
- Revisa que no haya espacios al inicio/final
- Confirma que la key esté activa

### Error: "Rate limit exceeded"
- Estás haciendo demasiadas peticiones
- Espera unos minutos
- Considera actualizar tu plan de API

### Error: "Access Token expirado" (Mercado Libre)
- Los tokens expiran cada 6 horas
- Usa el Refresh Token para obtener uno nuevo
- Implementa renovación automática

### Error: "CORS"
- El backend debe permitir requests del frontend
- Verifica que el backend esté corriendo en puerto 3000

---

## 📚 Recursos Adicionales

- [Amazon PA-API Docs](https://webservices.amazon.com/paapi5/documentation/)
- [eBay API Explorer](https://developer.ebay.com/api-explorer/)
- [Mercado Libre API Docs](https://developers.mercadolibre.com/es_ar/api-docs)
- [AliExpress API Docs](https://developers.aliexpress.com/)

---

## ✅ Checklist de Configuración

- [ ] Instalar dependencias npm
- [ ] Crear cuenta en Amazon Associates
- [ ] Crear aplicación en eBay Developers
- [ ] Crear aplicación en Mercado Libre
- [ ] Obtener credenciales de cada plataforma
- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar credenciales en `.env`
- [ ] Reiniciar el backend
- [ ] Probar conexiones con curl
- [ ] Verificar que las búsquedas usen datos reales

---

**¿Listo para conectar las APIs?**

El siguiente paso es ejecutar las pruebas y verificar que todo funcione correctamente.
