import jwt from 'jsonwebtoken';

export function signJwt(payload: object, role:string) {
  const secret=getSecretByRole(role)
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyJwt(token: string,role:string) {
  const secret=getSecretByRole(role)
  return jwt.verify(token, secret);
}

function getSecretByRole(role:string):string{
  switch(role){
    case 'admin':
      return process.env.ADMIN_JWT_SECRET!
    case 'interviewer':
      return process.env.INTERVIEWER_JWT_SECRET!
    case 'user':
      return process.env.USER_JWT_SECRET!
    default:
      return process.env.USER_JWT_SECRET!     
  }
}