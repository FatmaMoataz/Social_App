"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketHandlers = void 0;
class SocketHandlers {
    io;
    connectedUsers = new Map();
    constructor(io) {
        this.io = io;
        this.setupHandlers();
    }
    setupHandlers() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);
            // Handle user authentication
            socket.on('authenticate', (user) => {
                this.connectedUsers.set(user.userId, socket.id);
                socket.join(`user_${user.userId}`);
                console.log(`User ${user.userId} authenticated with socket ${socket.id}`);
            });
            socket.on('postLiked', (data) => {
                // Notify post owner and followers about the like
                this.io.emit(`post_${data.postId}_liked`, data);
            });
            socket.on('commentAdded', (data) => {
                // Notify post owner and commenters
                this.io.emit(`post_${data.postId}_comment_added`, data);
            });
            socket.on('userFollowed', (data) => {
                // Notify the followed user
                this.io.to(`user_${data.followedId}`).emit('newFollower', data);
            });
            socket.on('disconnect', () => {
                for (const [userId, socketId] of this.connectedUsers.entries()) {
                    if (socketId === socket.id) {
                        this.connectedUsers.delete(userId);
                        break;
                    }
                }
                console.log('User disconnected:', socket.id);
            });
        });
    }
    emitPostLiked(postId, userId, likesCount) {
        this.io.emit(`post_${postId}_liked`, { postId, userId, likesCount });
    }
    emitCommentAdded(postId, comment) {
        this.io.emit(`post_${postId}_comment_added`, { postId, comment });
    }
    emitNewFollower(followerId, followedId) {
        this.io.to(`user_${followedId}`).emit('newFollower', { followerId, followedId });
    }
    getUserSocket(userId) {
        return this.connectedUsers.get(userId);
    }
}
exports.SocketHandlers = SocketHandlers;
