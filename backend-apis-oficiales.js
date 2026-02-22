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

const MERCADOLIBRE_CONFIG = {
    clientId: process.env.ML_CLIENT_ID,
    clientSecret: process.env.ML_CLIENT_SECRET,
    accessToken: process.env.ML_ACCESS_TOKEN,
    apiUrl: 'https://api.mercadolibre.com',
    site: 'MLM' // México
};

const ALIEXPRESS_CONFIG = {
    appKey: process.env.ALIEXPRESS_APP_KEY,
    appSecret: process.env.ALIEXPRESS_APP_SECRET
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
async function searchMercadoLibre(query, limit = 10) {
    try {
        console.log('🛒 Buscando en MercadoLibre:', query);

        // Búsqueda principal
        const searchUrl = `${MERCADOLIBRE_CONFIG.apiUrl}/sites/${MERCADOLIBRE_CONFIG.site}/search`;

        const headers = {
            'User-Agent': 'CotizadorHospitalDelMovil/3.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (MERCADOLIBRE_CONFIG.accessToken) {
            headers['Authorization'] = `Bearer ${MERCADOLIBRE_CONFIG.accessToken}`;
        }

        const response = await axios.get(searchUrl, {
            params: {
                q: query,
                limit: limit,
                offset: 0
            },
            headers: headers,
            timeout: 10000
        });

        if (!response.data.results || response.data.results.length === 0) {
            console.warn('⚠️ MercadoLibre: No se encontraron resultados');
            return [];
        }

        console.log(`✅ MercadoLibre: ${response.data.results.length} resultados encontrados`);

        // Mapear resultados con información mejorada
        const results = await Promise.all(response.data.results.map(async (item) => {
            try {
                // Calcular costos de envío estimados
                const shippingCost = item.shipping?.free_shipping ? 0 :
                                    item.shipping?.logistic_type === 'fulfillment' ? 0 : 150;

                // Calcular IVA (16% en México)
                const taxes = item.price * 0.16;

                // Calcular total
                const totalPrice = item.price + shippingCost + taxes;

                // Estimar días de entrega
                let deliveryDays = 7; // Default
                if (item.shipping?.free_shipping) deliveryDays = 3;
                if (item.shipping?.logistic_type === 'fulfillment') deliveryDays = 2;
                if (item.shipping?.tags && item.shipping.tags.includes('same_day')) deliveryDays = 1;

                // Obtener calificación del vendedor si está disponible
                let sellerRating = 4.0;
                if (item.seller?.seller_reputation?.transactions?.total > 0) {
                    const reputation = item.seller.seller_reputation;
                    sellerRating = reputation.transactions.completed ?
                        (reputation.transactions.completed / reputation.transactions.total) * 5 : 4.0;
                }

                return {
                    platform: 'MercadoLibre',
                    title: item.title,
                    price: parseFloat(item.price.toFixed(2)),
                    currency: item.currency_id,
                    shipping: parseFloat(shippingCost.toFixed(2)),
                    taxes: parseFloat(taxes.toFixed(2)),
                    totalPrice: parseFloat(totalPrice.toFixed(2)),
                    url: item.permalink,
                    imageUrl: item.thumbnail?.replace('-I.jpg', '-O.jpg') || item.thumbnail, // Mejor calidad
                    condition: item.condition === 'new' ? 'Nuevo' :
                              item.condition === 'used' ? 'Usado' : 'Reacondicionado',
                    seller: item.seller?.nickname || 'Vendedor ML',
                    rating: parseFloat(sellerRating.toFixed(1)),
                    deliveryDays: deliveryDays,
                    soldQuantity: item.sold_quantity || 0,
                    availableQuantity: item.available_quantity || 0,
                    warranty: item.warranty || 'Sin garantía especificada',
                    freeShipping: item.shipping?.free_shipping || false,
                    officialStore: item.official_store_id ? true : false
                };
            } catch (itemError) {
                console.error('Error procesando item de MercadoLibre:', itemError.message);
                return null;
            }
        }));

        // Filtrar resultados nulos
        return results.filter(r => r !== null);

    } catch (error) {
        console.error('❌ Error en MercadoLibre:', error.message);

        // Si no hay credenciales configuradas, mostrar advertencia
        if (error.response?.status === 401) {
            console.warn('⚠️ Token de MercadoLibre expirado o inválido');
        }

        // Retornar array vacío en lugar de datos simulados para APIs reales
        return [];
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
        console.log(`📱 Buscando dispositivos ${condition}:`, query);

        // Construir query específico para dispositivos
        const mlQuery = condition === 'new' ? `${query} nuevo` : `${query} usado excelente estado`;

        const searchUrl = `${MERCADOLIBRE_CONFIG.apiUrl}/sites/${MERCADOLIBRE_CONFIG.site}/search`;

        const headers = {
            'User-Agent': 'CotizadorHospitalDelMovil/3.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (MERCADOLIBRE_CONFIG.accessToken) {
            headers['Authorization'] = `Bearer ${MERCADOLIBRE_CONFIG.accessToken}`;
        }

        const response = await axios.get(searchUrl, {
            params: {
                q: mlQuery,
                category: 'MLM1051', // Categoría de celulares y smartphones
                condition: condition === 'new' ? 'new' : 'used',
                limit: 10,
                sort: 'price_asc' // Ordenar por precio ascendente
            },
            headers: headers,
            timeout: 10000
        });

        if (!response.data.results || response.data.results.length === 0) {
            console.warn(`⚠️ No se encontraron dispositivos ${condition}`);
            return [];
        }

        console.log(`✅ Encontrados ${response.data.results.length} dispositivos ${condition}`);

        return response.data.results.map(item => {
            const shippingCost = item.shipping?.free_shipping ? 0 : 150;
            const taxes = item.price * 0.16;
            const totalPrice = item.price + shippingCost + taxes;

            let deliveryDays = condition === 'new' ? 5 : 7;
            if (item.shipping?.free_shipping) deliveryDays = 3;
            if (item.shipping?.logistic_type === 'fulfillment') deliveryDays = 2;

            return {
                platform: 'MercadoLibre',
                title: item.title,
                price: parseFloat(item.price.toFixed(2)),
                currency: item.currency_id,
                shipping: parseFloat(shippingCost.toFixed(2)),
                taxes: parseFloat(taxes.toFixed(2)),
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                url: item.permalink,
                imageUrl: item.thumbnail?.replace('-I.jpg', '-O.jpg') || item.thumbnail,
                condition: condition === 'new' ? 'Nuevo' : 'Usado',
                seller: item.seller?.nickname || 'Vendedor ML',
                rating: 4.0,
                deliveryDays: deliveryDays,
                soldQuantity: item.sold_quantity || 0,
                availableQuantity: item.available_quantity || 0,
                freeShipping: item.shipping?.free_shipping || false
            };
        });

    } catch (error) {
        console.error(`❌ Error buscando dispositivos ${condition}:`, error.message);
        return [];
    }
}

// ============================================
// SERPAPI - Búsqueda para Google Apps Script
// ============================================

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';

async function buscarConSerpAPI(query, limite = 15) {
    if (!SERPAPI_KEY) {
        console.warn('⚠️ SERPAPI_KEY no configurado en variables de entorno');
        return [];
    }
    try {
        const params = {
            engine: 'google_shopping',
            q: query,
            api_key: SERPAPI_KEY,
            hl: 'es',
            num: limite
        };

        console.log(`   🔍 SerpAPI query: "${query}"`);
        const response = await axios.get(SERPAPI_URL, { params, timeout: 30000 });

        // Detectar errores reportados por la propia API (créditos agotados, key inválida, etc.)
        if (response.data.error) {
            console.error(`   ❌ SerpAPI error: ${response.data.error}`);
            return [];
        }

        const items = response.data.shopping_results || [];
        console.log(`   📦 SerpAPI devolvió ${items.length} resultados para "${query}"`);

        if (items.length === 0 && response.data.search_information) {
            console.warn(`   ⚠️ Sin resultados. Info: ${JSON.stringify(response.data.search_information)}`);
        }

        return items.map(item => {
            const priceStr = (item.price || '0').replace(/[^0-9.]/g, '');
            const precio = parseFloat(priceStr) || 0;
            return {
                plataforma:     item.source || 'Google Shopping',
                titulo:         item.title || 'Sin título',
                precio:         precio,
                moneda:         'MXN',
                envio:          item.delivery || 'No especificado',
                tiempo_entrega: 'N/A',
                calificacion:   item.rating ? String(item.rating) : 'N/A',
                url_compra:     item.link || item.product_link || '',
                imagen:         item.thumbnail || ''
            };
        });
    } catch (error) {
        const detail = error.response?.data?.error || error.message;
        console.error(`   ❌ Error en SerpAPI para "${query}": ${detail}`);
        return [];
    }
}

// Endpoint llamado por Google Apps Script onChange trigger
app.post('/api/buscar-serpapi', async (req, res) => {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('📥 BÚSQUEDA SERPAPI');

        const { id, id_busqueda, dispositivo, marca, modelo, color, variante1, variante2, pieza } = req.body;
        const busqueda_id = id_busqueda || id || 'COT-' + Date.now();

        console.log(`   ID: ${busqueda_id} | Marca: ${marca} | Modelo: ${modelo} | Pieza: ${pieza}`);

        if (!SERPAPI_KEY) {
            return res.status(500).json({
                success: false,
                error: 'SERPAPI_KEY no está configurado en las variables de entorno de Railway'
            });
        }

        // Construir queries
        const queryPieza  = [pieza, variante1, variante2, marca, modelo].filter(Boolean).join(' ').trim();
        const queryNuevo  = `${marca} ${modelo} nuevo`.trim();
        const queryUsado  = `${marca} ${modelo} usado`.trim();

        console.log(`   Query pieza:  "${queryPieza}"`);
        console.log(`   Query nuevo:  "${queryNuevo}"`);
        console.log(`   Query usado:  "${queryUsado}"`);

        // Buscar en paralelo — incluyendo AliExpress como query separado
        const queryAliExpress = `${queryPieza} aliexpress`;
        const [piezasGoogle, aliExpressItems, equiposNuevos, equiposUsados] = await Promise.all([
            buscarConSerpAPI(queryPieza, 20),
            buscarConSerpAPI(queryAliExpress, 10),
            buscarConSerpAPI(queryNuevo, 10),
            buscarConSerpAPI(queryUsado, 10)
        ]);

        // Etiquetar resultados de AliExpress y fusionar con piezas generales
        const aliTagged = aliExpressItems.map(item => ({
            ...item,
            plataforma: 'aliexpress'
        }));
        const piezas = [...piezasGoogle, ...aliTagged];

        console.log(`✅ Piezas Google: ${piezasGoogle.length} | AliExpress: ${aliTagged.length} | Nuevos: ${equiposNuevos.length} | Usados: ${equiposUsados.length}`);

        res.json({
            success: true,
            message: 'Búsqueda completada exitosamente',
            data: {
                id_busqueda:    busqueda_id,
                piezas:         piezas,
                equipos_nuevos: equiposNuevos,
                equipos_usados: equiposUsados
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error en /api/buscar-serpapi:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

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
   POST /api/buscar-serpapi      - Búsqueda SerpAPI (Apps Script)

⚙️  Configuración de APIs:
   SerpAPI:          ${SERPAPI_KEY ? '✅' : '❌'} ${SERPAPI_KEY ? 'Configurado' : 'No configurado - Agregar SERPAPI_KEY en Railway'}
   Amazon API:       ${AMAZON_CONFIG.accessKey ? '✅' : '❌'} ${AMAZON_CONFIG.accessKey ? 'Configurado' : 'No configurado'}
   eBay API:         ${EBAY_CONFIG.appId ? '✅' : '❌'} ${EBAY_CONFIG.appId ? 'Configurado' : 'No configurado'}
   MercadoLibre API: ✅ Activo (sin autenticación)
   AliExpress API:   ${ALIEXPRESS_CONFIG.appKey ? '✅' : '❌'} ${ALIEXPRESS_CONFIG.appKey ? 'Configurado' : 'No configurado'}

💡 Consejo:
   - MercadoLibre funciona sin credenciales (búsqueda pública)
   - Para más resultados, configura credenciales en .env
   - Consulta GUIA-CONFIGURACION-APIS.md para más información

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
