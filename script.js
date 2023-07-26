/*

Encryption and decryption using AES-GCM

*/

async function encrypt() {
    const inputText = document.getElementById("inputText").value;
    const password = prompt("Enter a password to encrypt:");
  
    if (!password) return; // Abort if no password is provided
  
    const encoder = new TextEncoder();
    const data = encoder.encode(inputText);
    const iv = getRandomIV(); // Generate a random IV
  
    try {
      const key = await getKey(password);
      const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data);
  
      // Concatenate IV and encrypted data into a single Uint8Array
      const ivAndData = new Uint8Array(iv.byteLength + encryptedData.byteLength);
      ivAndData.set(new Uint8Array(iv), 0);
      ivAndData.set(new Uint8Array(encryptedData), iv.byteLength);
  
      const encryptedText = toBase64(ivAndData);
      document.getElementById("outputText").value = encryptedText;
    } catch (error) {
      alert("Encryption failed.");
      console.error(error);
    }
  }
  
  async function decrypt() {
    const encryptedText = document.getElementById("outputText").value;
    const password = prompt("Enter the password to decrypt:");
  
    if (!password) return; // Abort if no password is provided
  
    try {
      const key = await getKey(password);
      const ivAndData = fromBase64(encryptedText);
      const iv = ivAndData.slice(0, 12); // Extract the first 12 bytes as IV
      const encryptedData = ivAndData.slice(12); // Rest is the encrypted data
  
      const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encryptedData
      );
  
      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decryptedData);
      document.getElementById("inputText").value = decryptedText;
    } catch (error) {
      alert("Incorrect password or decryption failed.");
      console.error(error);
    }
  }

  async function getKey(password) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const passwordHash = await crypto.subtle.digest("SHA-256", passwordData);
    return crypto.subtle.importKey(
      "raw",
      passwordHash,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  
  function getRandomIV() {
    return crypto.getRandomValues(new Uint8Array(12));
  }
  
  function toBase64(buffer) {
    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
    return btoa(binary);
  }
  
  function fromBase64(base64) {
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
  }
  