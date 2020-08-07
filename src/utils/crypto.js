import CryptoJS from 'crypto-js'

const key = CryptoJS.enc.Utf8.parse('1234123412ABCDEF') // 十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412') // 十六位十六进制数作为密钥偏移量

// AES加密方法
function aesEncrypt(word) {
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  return encrypted.ciphertext.toString().toUpperCase()
}

// AES解密方法
function aesDecrypt(word) {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(word)
  const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
  const decrypt = CryptoJS.AES.decrypt(srcs, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}

// DES3加密方法
function desEncrypt(message, key) {
  key = CryptoJS.enc.Utf8.parse(key) // 将key转换成 wordArray
  const encrypted = CryptoJS.TripleDES.encrypt(message, key, {
    // iv: des3iv,
    // mode: CryptoJS.mode.CBC,
    mode: CryptoJS.mode.ECB, // ecb模式不需要偏移量
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

// DES3解密方法
function desDecrypt(ciphertext, key) {
  key = CryptoJS.enc.Utf8.parse(key)
  if (ciphertext === '' || ciphertext === null || ciphertext === undefined) {
    return ''
  }
  if (typeof (ciphertext) !== 'string') {
    ciphertext = ciphertext.toString()
  }
  const decrypted = CryptoJS.TripleDES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(ciphertext) },
    key,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  )
  return decrypted.toString(CryptoJS.enc.Utf8)
}

function desEncryptPlainObject(obj, key) {
  const data = {}
  Object.keys(obj).forEach((prop) => {
    if (obj[prop]) {
      if (typeof obj[prop] === 'number') {
        data[prop] = obj[prop]
      } else {
        data[prop] = desEncrypt(obj[prop], key)
      }
    }
  })
  return data
}

export {
  aesEncrypt,
  aesDecrypt,
  desEncrypt,
  desDecrypt,
  desEncryptPlainObject
}
