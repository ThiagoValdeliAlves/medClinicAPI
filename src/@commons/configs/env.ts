const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL não definida')
}

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('JWT_SECRET não definida')
}

const dummyHash = process.env.DUMMY_HASH
if (!dummyHash) {
  throw new Error('DUMMY_HASH não definida')
}

export const configs = {
  jwtSecret,
  databaseUrl,
  dummyHash
}
