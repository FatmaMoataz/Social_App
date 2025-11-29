"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerOnly = exports.Authorized = exports.Authenticated = void 0;
const auth_guard_1 = require("./auth.guard");
const Authenticated = (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        const context = args[2];
        auth_guard_1.AuthGuard.isAuthenticated(context);
        return originalMethod.apply(this, args);
    };
    return descriptor;
};
exports.Authenticated = Authenticated;
const Authorized = (role) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const context = args[2];
            auth_guard_1.AuthGuard.hasRole(context, role);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
};
exports.Authorized = Authorized;
const OwnerOnly = (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        const context = args[2];
        const id = args[1].id || args[1].userId;
        auth_guard_1.AuthGuard.isOwner(context, id);
        return originalMethod.apply(this, args);
    };
    return descriptor;
};
exports.OwnerOnly = OwnerOnly;
