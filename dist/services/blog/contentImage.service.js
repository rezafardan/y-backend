"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractContentImageIds = void 0;
const extractContentImageIds = (content) => {
    if (!content || !content.content)
        return [];
    return content.content
        .filter((item) => { var _a; return item.type === "image" && ((_a = item.attrs) === null || _a === void 0 ? void 0 : _a.id); })
        .map((item) => item.attrs.id);
};
exports.extractContentImageIds = extractContentImageIds;
