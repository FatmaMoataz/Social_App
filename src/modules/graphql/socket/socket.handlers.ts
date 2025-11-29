import { Server as SocketIOServer } from 'socket.io';
import { IAuthUser } from '../context';

export class SocketHandlers {
  private io: SocketIOServer;
  private connectedUsers: Map<number, string> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', (user: IAuthUser) => {
        this.connectedUsers.set(user.userId, socket.id);
        socket.join(`user_${user.userId}`);
        console.log(`User ${user.userId} authenticated with socket ${socket.id}`);
      });

  
      socket.on('postLiked', (data: { postId: number, userId: number }) => {
        // Notify post owner and followers about the like
        this.io.emit(`post_${data.postId}_liked`, data);
      });

    
      socket.on('commentAdded', (data: { postId: number, comment: any }) => {
        // Notify post owner and commenters
        this.io.emit(`post_${data.postId}_comment_added`, data);
      });

  
      socket.on('userFollowed', (data: { followerId: number, followedId: number }) => {
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

  public emitPostLiked(postId: number, userId: number, likesCount: number) {
    this.io.emit(`post_${postId}_liked`, { postId, userId, likesCount });
  }

  public emitCommentAdded(postId: number, comment: any) {
    this.io.emit(`post_${postId}_comment_added`, { postId, comment });
  }

  public emitNewFollower(followerId: number, followedId: number) {
    this.io.to(`user_${followedId}`).emit('newFollower', { followerId, followedId });
  }

  public getUserSocket(userId: number): string | undefined {
    return this.connectedUsers.get(userId);
  }
}