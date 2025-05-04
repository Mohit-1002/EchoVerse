// This is a simplified encryption implementation
// In a production app, you would use a more robust encryption library

export async function encryptAudio(audioBlob: Blob): Promise<{ encryptedData: Blob; encryptionKey: string }> {
  // Generate a random encryption key
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  )

  // Export the key to a format we can store
  const exportedKey = await window.crypto.subtle.exportKey("raw", key)
  const keyString = Array.from(new Uint8Array(exportedKey))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  // Generate a random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  // Convert audio blob to ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer()

  // Encrypt the audio data
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    arrayBuffer,
  )

  // Prepend the IV to the encrypted data
  const encryptedWithIV = new Uint8Array(iv.length + encryptedData.byteLength)
  encryptedWithIV.set(iv, 0)
  encryptedWithIV.set(new Uint8Array(encryptedData), iv.length)

  // Create a new blob with the encrypted data
  const encryptedBlob = new Blob([encryptedWithIV], { type: "application/octet-stream" })

  return {
    encryptedData: encryptedBlob,
    encryptionKey: keyString,
  }
}

export async function decryptAudio(encryptedBlob: Blob, encryptionKeyString: string): Promise<Blob> {
  // Convert the encrypted blob to ArrayBuffer
  const arrayBuffer = await encryptedBlob.arrayBuffer()
  const encryptedData = new Uint8Array(arrayBuffer)

  // Extract the IV from the beginning of the data
  const iv = encryptedData.slice(0, 12)
  const data = encryptedData.slice(12)

  // Convert the key string back to a key
  const keyData = new Uint8Array(encryptionKeyString.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16)))

  // Import the key
  const key = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["decrypt"],
  )

  // Decrypt the data
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    data,
  )

  // Create a new blob with the decrypted data
  return new Blob([decryptedData], { type: "audio/webm" })
}
