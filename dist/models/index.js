"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable prettier/prettier */
// Tüm model sınıflarını dışa aktar
__exportStar(require("./user"), exports);
__exportStar(require("./Sport"), exports);
__exportStar(require("./Event"), exports);
__exportStar(require("./news"), exports);
__exportStar(require("./Notification"), exports);
__exportStar(require("./Announcement"), exports);
__exportStar(require("./Message"), exports);
__exportStar(require("./Friend"), exports);
// Tüm model tiplerini dışa aktar
__exportStar(require("@prisma/client"), exports);
//# sourceMappingURL=index.js.map