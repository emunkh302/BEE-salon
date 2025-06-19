// src/types/express/index.d.ts

// This file uses declaration merging to add a custom 'user' property 
// to the global Express Request interface.

// Import the full User interface from your model to ensure type safety.
// import { IUser } from '../../models/User.model';

// declare global {
//   namespace Express {
//     export interface Request {
//       // The user property will be optional and of type IUser.
//       // It will be populated by our 'protect' middleware upon successful authentication.
//       user?: IUser;
//     }
//   }
// }
// src/types/express/index.d.ts
import { IUser } from '../../models/User.model';
import { Server as SocketIOServer } from 'socket.io';

// Use declaration merging to add custom properties to the Express Request interface
declare global {
  namespace Express {
    export interface Request {
      user?: IUser; // For authentication middleware
      io?: SocketIOServer; // For accessing the Socket.IO server instance
    }
  }
}
