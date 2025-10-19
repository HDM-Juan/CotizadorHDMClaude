// backend-apis-oficiales.js
// Backend Node.js para Sistema de Cotización Profesional 3.0

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// CONFIGURACIÓN DE APIs
// ============================================

const AMAZON_CONFIG = {
    accessKey: process.env.AMAZON_ACCESS_KEY,
    secretKey: process.env.AMAZON_SECRET_KEY,
    partnerTag: process.env.AMAZON_PARTNER_TAG,
    host: 'webservices.amazon.com.mx',
    region: 'us-east-1'
};

const EBAY_CONFIG = {
    appId: process.env.EBAY_APP_ID,
    certId: process.env.EBAY_CERT_ID,
    devId: process.env.EBAY_DEV_ID,
    endpoint: 'https://svcs.ebay.com/services/search/FindingService/v1'
};

// ============================================
// RUTAS PRINCIPALES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        version: '3.0.0'
    });
});

// Buscar refacciones en todas las plataformas
app.post('/api/search', async (req, res) => {
    try {
        const { deviceType, brand, model, partType, variant } = req.body;

        console.log('🔍 Búsqueda iniciada:', {
            deviceType,
            brand,
            model,
            partType,
            variant
        });

        // Construir query de búsqueda
        const searchQuery = `${brand} ${model} ${partType} ${variant || ''}`.trim();

        // Buscar en paralelo en todas las plataformas
        const [amazonResults, ebayResults, mercadoLibreResults, aliExpressResults] = await Promise.allSettled([
            searchAmazon(searchQuery),
            searchEbay(searchQuery),
            searchMercadoLibre(searchQuery),
            searchAliExpress(searchQuery)
        ]);

        // Consolidar resultados
        const results = {
            query: searchQuery,
            timestamp: new Date().toISOString(),
            platforms: {
                amazon: amazonResults.status === 'fulfilled' ? amazonResults.value : [],
                ebay: ebayResults.status === 'fulfilled' ? ebayResults.value : [],
                mercadolibre: mercadoLibreResults.status === 'fulfilled' ? mercadoLibreResults.value : [],
                aliexpress: aliExpressResults.status === 'fulfilled' ? aliExpressResults.value : []
            },
            statistics: {}
        };

        // Calcular estadísticas
        const allResults = [
            ...results.platforms.amazon,
            ...results.platforms.ebay,
            ...results.platforms.mercadolibre,
            ...results.platforms.aliexpress
        ];

        if (allResults.length > 0) {
            const prices = allResults.map(r => r.totalPrice);
            results.statistics = {
                total: allResults.length,
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
                avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length
            };
        }

        console.log('✅ Búsqueda completada:', results.statistics);
        res.json(results);

    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        res.status(500).json({
            error: 'Error en la búsqueda',
            message: error.message
        });
    }
});

// Buscar dispositivos completos (nuevos y usados)
app.post('/api/search-devices', async (req, res) => {
    try {
        const { brand, model } = req.body;
        const searchQuery = `${brand} ${model}`.trim();

        console.log('📱 Búsqueda de dispositivos:', searchQuery);

        const [newDevices, usedDevices] = await Promise.allSettled([
            searchDevices(searchQuery, 'new'),
            searchDevices(searchQuery, 'used')
        ]);

        const results = {
            query: searchQuery,
            timestamp: new Date().toISOString(),
            newDevices: newDevices.status === 'fulfilled' ? newDevices.value : [],
            usedDevices: usedDevices.status === 'fulfilled' ? usedDevices.value : []
        };

        console.log('✅ Dispositivos encontrados:', {
            new: results.newDevices.length,
            used: results.usedDevices.length
        });

        res.json(results);

    } catch (error) {
        console.error('❌ Error buscando dispositivos:', error);
        res.status(500).json({
            error: 'Error en la búsqueda de dispositivos',
            message: error.message
        });
    }
});

// ============================================
// FUNCIONES DE BÚSQUEDA POR PLATAFORMA
// ============================================

// Amazon Product Advertising API
async function searchAmazon(query) {
    try {
        // Nota: Requiere implementación completa de firma AWS
        // Este es un ejemplo simplificado
        
        console.log('🛒 Buscando en Amazon:', query);

        // IMPLEMENTACIÓN REAL REQUIERE:
        // 1. AWS4 signature
        // 2. Amazon PA-API 5.0
        // 3. Credenciales válidas

        // Por ahora, retornamos datos de ejemplo
        return generateMockResults('Amazon', 5);

    } catch (error) {
        console.error('Error en Amazon:', error);
        return [];
    }
}

// eBay Finding API
async function searchEbay(query) {
    try {
        console.log('🛍️ Buscando en eBay:', query);

        if (!EBAY_CONFIG.appId) {
            console.warn('eBay App ID no configurado');
            return generateMockResults('eBay', 5);
        }

        const response = await axios.get(EBAY_CONFIG.endpoint, {
            params: {
                'OPERATION-NAME': 'findItemsByKeywords',
                'SERVICE-VERSION': '1.0.0',
                'SECURITY-APPNAME': EBAY_CONFIG.appId,
                'RESPONSE-DATA-FORMAT': 'JSON',
                'REST-PAYLOAD': '',
                'keywords': query,
                'paginationInput.entriesPerPage': '10',
                'GLOBAL-ID': 'EBAY-US'
            },
            timeout: 5000
        });

        if (response.data.findItemsByKeywordsResponse) {
            const items = response.data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
            
            return items.map(item => ({
                platform: 'eBay',
                title: item.title[0],
                price: parseFloat(item.sellingStatus[0].currentPrice[0].__value__),
                currency: item.sellingStatus[0].currentPrice[0]['@currencyId'],
                shipping: item.shippingInfo ? parseFloat(item.shippingInfo[0].shippingServiceCost[0].__value__ || 0) : 0,
                taxes: 0,
                totalPrice: parseFloat(item.sellingStatus[0].currentPrice[0].__value__) + (item.shippingInfo ? parseFloat(item.shippingInfo[0].shippingServiceCost[0].__value__ || 0) : 0),
                url: item.viewItemURL[0],
                imageUrl: item.galleryURL ? item.galleryURL[0] : null,
                condition: item.condition ? item.condition[0].conditionDisplayName[0] : 'Unknown',
                seller: 'eBay Seller',
                rating: 4.0,
                deliveryDays: 7
            }));
        }

        return [];

    } catch (error) {
        console.error('Error en eBay:', error.message);
        return generateMockResults('eBay', 5);
    }
}

// MercadoLibre API
async function searchMercadoLibre(query) {
    try {
        console.log('🛒 Buscando en MercadoLibre:', query);

        const response = await axios.get('https://api.mercadolibre.com/sites/MLM/search', {
            params: {
                q: query,
                limit: 10
            },
            timeout: 5000
        });

        if (response.data.results) {
            return response.data.results.map(item => ({
                platform: 'MercadoLibre',
                title: item.title,
                price: item.price,
                currency: item.currency_id,
                shipping: item.shipping && item.shipping.free_shipping ? 0 : 100,
                taxes: item.price * 0.16,
                totalPrice: item.price + (item.shipping && item.shipping.free_shipping ? 0 : 100) + (item.price * 0.16),
                url: item.permalink,
                imageUrl: item.thumbnail,
                condition: item.condition,
                seller: item.seller ? item.seller.nickname : 'MercadoLibre Seller',
                rating: 4.2,
                deliveryDays: 5
            }));
        }

        return [];

    } catch (error) {
        console.error('Error en MercadoLibre:', error.message);
        return generateMockResults('MercadoLibre', 5);
    }
}

// AliExpress (Scraping o API no oficial)
async function searchAliExpress(query) {
    try {
        console.log('🛒 Buscando en AliExpress:', query);

        // Nota: AliExpress no tiene API pública oficial
        // Requiere scraping o API de terceros (no recomendado)
        
        return generateMockResults('AliExpress', 5);

    } catch (error) {
        console.error('Error en AliExpress:', error);
        return [];
    }
}

// Búsqueda de dispositivos completos
async function searchDevices(query, condition) {
    try {
        // Buscar en MercadoLibre como fuente principal
        const mlQuery = condition === 'new' ? `${query} nuevo` : `${query} usado`;
        
        const response = await axios.get('https://api.mercadolibre.com/sites/MLM/search', {
            params: {
                q: mlQuery,
                category: condition === 'new' ? 'MLM1051' : 'MLM1747', // Categorías de celulares
                limit: 10
            },
            timeout: 5000
        });

        if (response.data.results) {
            return response.data.results.map(item => ({
                title: item.title,
                price: item.price,
                currency: item.currency_id,
                url: item.permalink,
                imageUrl: item.thumbnail,
                condition: condition,
                seller: item.seller ? item.seller.nickname : 'Seller'
            }));
        }

        return [];

    } catch (error) {
        console.error(`Error buscando dispositivos ${condition}:`, error.message);
        
        // Generar datos simulados de respaldo
        const basePrice = condition === 'new' ? 5000 : 3000;
        return Array(8).fill(null).map(() => ({
            price: basePrice + (Math.random() * basePrice * 0.5),
            condition: condition
        }));
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Generar resultados simulados para demos
function generateMockResults(platform, count) {
    const results = [];
    const platformColors = {
        'Amazon': '#ff9900',
        'eBay': '#e53238',
        'MercadoLibre': '#ffe600',
        'AliExpress': '#e62e04'
    };

    for (let i = 0; i < count; i++) {
        const basePrice = Math.random() * 2000 + 500;
        const shipping = Math.random() * 200 + 50;
        const taxes = basePrice * 0.16;

        results.push({
            platform: platform,
            title: `${platform} Item #${i + 1}`,
            price: basePrice,
            shipping: shipping,
            taxes: taxes,
            totalPrice: basePrice + shipping + taxes,
            url: `https://${platform.toLowerCase()}.com/item${i}`,
            imageUrl: `https://via.placeholder.com/200/${platformColors[platform].replace('#', '')}?text=${platform}`,
            condition: 'New',
            seller: `${platform} Seller #${i + 1}`,
            rating: (Math.random() * 2 + 3).toFixed(1),
            deliveryDays: Math.floor(Math.random() * 20) + 3,
            currency: 'MXN'
        });
    }

    return results;
}

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   🏥 Hospital del Móvil - Backend API    ║
║   Sistema de Cotización Profesional 3.0  ║
╚═══════════════════════════════════════════╝

✅ Servidor corriendo en http://localhost:${PORT}

📡 Endpoints disponibles:
   GET  /health                  - Health check
   POST /api/search              - Buscar refacciones
   POST /api/search-devices      - Buscar dispositivos

⚙️  Configuración:
   Amazon API: ${AMAZON_CONFIG.accessKey ? '✅' : '❌'} Configurado
   eBay API:   ${EBAY_CONFIG.appId ? '✅' : '❌'} Configurado
   
💡 Consejo: Configura tus credenciales en el archivo .env

🚀 Sistema listo para recibir solicitudes...
    `);
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Manejo de shutdown graceful
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recibido. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT recibido. Cerrando servidor...');
    process.exit(0);
});
