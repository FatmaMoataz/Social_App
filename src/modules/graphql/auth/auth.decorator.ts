import { AuthGuard } from "./auth.guard";
import { IGraphQLContext } from "../context";

export const Authenticated = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const context = args[2] as IGraphQLContext;
    AuthGuard.isAuthenticated(context);
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
};

export const Authorized = (role: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const context = args[2] as IGraphQLContext;
      AuthGuard.hasRole(context, role);
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
};

export const OwnerOnly = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const context = args[2] as IGraphQLContext;
    const id = args[1].id || args[1].userId; 
    AuthGuard.isOwner(context, id);
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
};