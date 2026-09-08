import type { Request, Response } from 'express'

export function testController(req: Request, res: Response) {
  return res.status(200).json('cambio')
}
