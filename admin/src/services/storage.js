import { EncryptStorage } from 'encrypt-storage'

const encryptStorage = new EncryptStorage(process.env.REACT_APP_TOKEN_SECRET_KEY, { prefix: 'auth' })
export default encryptStorage
