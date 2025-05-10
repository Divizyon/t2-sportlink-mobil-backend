"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixDuplicateApiPrefix = exports.formatApiPath = exports.formatApiUrl = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
/**
 * API için doğru formatta URL oluşturur
 * Tekrarlanan API prefix'lerini önler
 * @param path - API endpoint'i (örn: "/news/5" veya "news/5")
 * @returns Tam URL
 */
const formatApiUrl = (path) => {
    // Path'in başında '/' olup olmadığını kontrol et
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    // API prefix'ini path'ten çıkar (eğer varsa)
    const apiPrefixWithoutSlashes = API_PREFIX.replace(/^\/|\/$/g, ''); // Başındaki ve sonundaki '/' karakterlerini kaldır
    const pathWithoutPrefix = normalizedPath.startsWith(apiPrefixWithoutSlashes)
        ? normalizedPath.substring(apiPrefixWithoutSlashes.length)
        : normalizedPath;
    // Path'in başında '/' olup olmadığını tekrar kontrol et
    const finalPath = pathWithoutPrefix.startsWith('/') ? pathWithoutPrefix : `/${pathWithoutPrefix}`;
    // BASE_URL'in sonunda '/' olup olmadığını kontrol et
    const baseUrlWithoutTrailingSlash = BASE_URL.endsWith('/')
        ? BASE_URL.slice(0, -1)
        : BASE_URL;
    // API prefix'inin başında '/' olduğundan emin ol
    const apiPrefixWithLeadingSlash = API_PREFIX.startsWith('/')
        ? API_PREFIX
        : `/${API_PREFIX}`;
    // Tam URL'yi oluştur
    return `${baseUrlWithoutTrailingSlash}${apiPrefixWithLeadingSlash}${finalPath}`;
};
exports.formatApiUrl = formatApiUrl;
/**
 * Aynı originden API istekleri için doğru formatta URL oluşturur
 * @param path - API endpoint'i (örn: "/news/5" veya "news/5")
 * @returns Originsiz URL
 */
const formatApiPath = (path) => {
    // Path'in başında '/' olup olmadığını kontrol et
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    // API prefix'ini path'ten çıkar (eğer varsa)
    const apiPrefixWithoutSlashes = API_PREFIX.replace(/^\/|\/$/g, ''); // Başındaki ve sonundaki '/' karakterlerini kaldır
    const pathWithoutPrefix = normalizedPath.startsWith(apiPrefixWithoutSlashes)
        ? normalizedPath.substring(apiPrefixWithoutSlashes.length)
        : normalizedPath;
    // Path'in başında '/' olup olmadığını tekrar kontrol et
    const finalPath = pathWithoutPrefix.startsWith('/') ? pathWithoutPrefix : `/${pathWithoutPrefix}`;
    // API prefix'inin başında '/' olduğundan emin ol
    const apiPrefixWithLeadingSlash = API_PREFIX.startsWith('/')
        ? API_PREFIX
        : `/${API_PREFIX}`;
    // URL path'ini oluştur
    return `${apiPrefixWithLeadingSlash}${finalPath}`;
};
exports.formatApiPath = formatApiPath;
/**
 * Verilen URL'de API prefix'inin tekrarlanıp tekrarlanmadığını kontrol eder ve düzeltir
 * @param url - Kontrol edilecek URL
 * @returns Düzeltilmiş URL
 */
const fixDuplicateApiPrefix = (url) => {
    const apiPrefix = API_PREFIX.replace(/^\/|\/$/g, ''); // Başındaki ve sonundaki '/' karakterlerini kaldır
    const pattern = new RegExp(`/${apiPrefix}/${apiPrefix}/`, 'i');
    if (pattern.test(url)) {
        return url.replace(pattern, `/${apiPrefix}/`);
    }
    return url;
};
exports.fixDuplicateApiPrefix = fixDuplicateApiPrefix;
//# sourceMappingURL=url.util.js.map