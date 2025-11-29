"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = exports.UserResolver = exports.AuthResolver = void 0;
var auth_resolver_1 = require("./auth.resolver");
Object.defineProperty(exports, "AuthResolver", { enumerable: true, get: function () { return auth_resolver_1.AuthResolver; } });
var user_resolver_1 = require("./user.resolver");
Object.defineProperty(exports, "UserResolver", { enumerable: true, get: function () { return user_resolver_1.UserResolver; } });
var post_resolver_1 = require("./post.resolver");
Object.defineProperty(exports, "PostResolver", { enumerable: true, get: function () { return post_resolver_1.PostResolver; } });
