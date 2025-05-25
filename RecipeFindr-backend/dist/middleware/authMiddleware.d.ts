import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: any;
}
declare const verifyToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export default verifyToken;
//# sourceMappingURL=authMiddleware.d.ts.map