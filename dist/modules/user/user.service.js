"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class userService {
    constructor() { }
    profile = async (req, res) => {
        return res.json({ message: "Done", data: {
                user: req.user?._id,
                decoded: req.decoded?.iat
            } });
    };
}
exports.default = new userService();
