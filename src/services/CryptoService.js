class CryptoService {
  static SECRET_KEY = 'orsheep-mp3-secret-key'

  static encrypt(text) {
    if (!text) return ''
    
    try {
      // Cria um array de bytes a partir do texto
      const textBytes = new TextEncoder().encode(text)
      
      // Cria um array de bytes a partir da chave secreta
      const keyBytes = new TextEncoder().encode(this.SECRET_KEY)
      
      // XOR entre os bytes do texto e da chave
      const encryptedBytes = new Uint8Array(textBytes.length)
      for (let i = 0; i < textBytes.length; i++) {
        encryptedBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length]
      }
      
      // Converte para base64
      return btoa(String.fromCharCode.apply(null, encryptedBytes))
    } catch (error) {
      console.error('Erro ao criptografar:', error)
      return ''
    }
  }

  static decrypt(encryptedText) {
    if (!encryptedText) return ''
    
    try {
      // Converte de base64 para array de bytes
      const encryptedBytes = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      )
      
      // Cria um array de bytes a partir da chave secreta
      const keyBytes = new TextEncoder().encode(this.SECRET_KEY)
      
      // XOR entre os bytes criptografados e da chave
      const decryptedBytes = new Uint8Array(encryptedBytes.length)
      for (let i = 0; i < encryptedBytes.length; i++) {
        decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length]
      }
      
      // Converte de volta para texto
      return new TextDecoder().decode(decryptedBytes)
    } catch (error) {
      console.error('Erro ao descriptografar:', error)
      return ''
    }
  }
}

export default CryptoService; 