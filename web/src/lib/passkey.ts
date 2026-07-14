// Standalone WebAuthn (passkey) proof-of-concept — isolated from the live escrow/Freighter flow.
//
// Registers a real platform passkey, then produces a real browser-signed assertion over a
// challenge derived from an actual escrow transaction (transaction-bound, not a generic login),
// and verifies that signature client-side with the Web Crypto API. This does not touch the
// escrow contract, the AssembledTransaction/signAndSend path, or Freighter — it's a side-by-side
// demo of the crypto primitive, not a replacement auth path.

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (const b of arr) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// TS's lib.dom types BufferSource as views over ArrayBuffer specifically, but Uint8Array's
// buffer type is the wider ArrayBufferLike — copy into a fresh ArrayBuffer to satisfy it.
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// --- Minimal CBOR decoder: just enough to read an attestationObject map and a COSE_Key map. ---

function decodeCbor(buf: Uint8Array, offset: number): [unknown, number] {
  const initial = buf[offset]
  const majorType = initial >> 5
  const infoBits = initial & 0x1f
  let value: number
  let pos = offset + 1

  if (infoBits < 24) {
    value = infoBits
  } else if (infoBits === 24) {
    value = buf[pos]
    pos += 1
  } else if (infoBits === 25) {
    value = (buf[pos] << 8) | buf[pos + 1]
    pos += 2
  } else if (infoBits === 26) {
    value = (buf[pos] << 24) | (buf[pos + 1] << 16) | (buf[pos + 2] << 8) | buf[pos + 3]
    pos += 4
  } else {
    throw new Error('Unsupported CBOR length encoding')
  }

  switch (majorType) {
    case 0:
      return [value, pos]
    case 1:
      return [-1 - value, pos]
    case 2: {
      const bytes = buf.slice(pos, pos + value)
      return [bytes, pos + value]
    }
    case 3: {
      const bytes = buf.slice(pos, pos + value)
      return [new TextDecoder().decode(bytes), pos + value]
    }
    case 4: {
      const arr: unknown[] = []
      for (let i = 0; i < value; i++) {
        const [item, next] = decodeCbor(buf, pos)
        arr.push(item)
        pos = next
      }
      return [arr, pos]
    }
    case 5: {
      const map = new Map<unknown, unknown>()
      for (let i = 0; i < value; i++) {
        const [key, afterKey] = decodeCbor(buf, pos)
        const [val, afterVal] = decodeCbor(buf, afterKey)
        map.set(key, val)
        pos = afterVal
      }
      return [map, pos]
    }
    default:
      throw new Error(`Unsupported CBOR major type: ${majorType}`)
  }
}

interface ParsedAuthData {
  credentialId: Uint8Array
  cosePublicKey: Map<unknown, unknown>
}

function parseAuthData(authData: Uint8Array): ParsedAuthData {
  const flags = authData[32]
  const attestedCredentialDataIncluded = (flags & 0x40) !== 0
  if (!attestedCredentialDataIncluded) {
    throw new Error('No attested credential data in authenticator response')
  }
  let pos = 37 // rpIdHash(32) + flags(1) + counter(4)
  pos += 16 // AAGUID
  const credIdLen = (authData[pos] << 8) | authData[pos + 1]
  pos += 2
  const credentialId = authData.slice(pos, pos + credIdLen)
  pos += credIdLen
  const [cosePublicKey] = decodeCbor(authData, pos)
  return { credentialId, cosePublicKey: cosePublicKey as Map<unknown, unknown> }
}

function coseKeyToJwk(cose: Map<unknown, unknown>): JsonWebKey {
  const kty = cose.get(1)
  const crv = cose.get(-1)
  const x = cose.get(-2) as Uint8Array
  const y = cose.get(-3) as Uint8Array
  if (kty !== 2 || crv !== 1) {
    throw new Error('Only EC2/P-256 passkeys are supported by this demo')
  }
  return { kty: 'EC', crv: 'P-256', x: toBase64Url(x), y: toBase64Url(y), ext: true }
}

// WebAuthn assertion signatures are DER-encoded ECDSA; Web Crypto's verify() wants raw r||s.
function derSignatureToRaw(der: Uint8Array, componentLength = 32): Uint8Array {
  let offset = 2 // skip SEQUENCE tag + length
  function readInt(): Uint8Array {
    if (der[offset] !== 0x02) throw new Error('Expected INTEGER in DER signature')
    offset += 1
    const len = der[offset]
    offset += 1
    let bytes = der.slice(offset, offset + len)
    offset += len
    if (bytes.length > componentLength) bytes = bytes.slice(bytes.length - componentLength)
    if (bytes.length < componentLength) {
      const padded = new Uint8Array(componentLength)
      padded.set(bytes, componentLength - bytes.length)
      bytes = padded
    }
    return bytes
  }
  const r = readInt()
  const s = readInt()
  const raw = new Uint8Array(componentLength * 2)
  raw.set(r, 0)
  raw.set(s, componentLength)
  return raw
}

export interface PasskeyRegistration {
  credentialId: string // base64url
  publicKeyJwk: JsonWebKey
}

export async function createPasskey(username: string): Promise<PasskeyRegistration> {
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = crypto.getRandomValues(new Uint8Array(16))

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'SplitRails (demo)' },
      user: { id: userId, name: username, displayName: username },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256 / P-256
      authenticatorSelection: { userVerification: 'preferred' },
      timeout: 60_000,
      attestation: 'none',
    },
  })) as PublicKeyCredential | null

  if (!credential) throw new Error('Passkey creation was cancelled or unsupported')

  const response = credential.response as AuthenticatorAttestationResponse
  const attestationBytes = new Uint8Array(response.attestationObject)
  const [attestationObject] = decodeCbor(attestationBytes, 0)
  const authData = (attestationObject as Map<unknown, unknown>).get('authData') as Uint8Array
  const { credentialId, cosePublicKey } = parseAuthData(authData)

  return {
    credentialId: toBase64Url(credentialId),
    publicKeyJwk: coseKeyToJwk(cosePublicKey),
  }
}

export interface PasskeyAssertion {
  authenticatorData: Uint8Array
  clientDataJSON: Uint8Array
  signature: Uint8Array
}

export async function signWithPasskey(credentialId: string, challenge: Uint8Array): Promise<PasskeyAssertion> {
  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge: toArrayBuffer(challenge),
      allowCredentials: [{ type: 'public-key', id: toArrayBuffer(fromBase64Url(credentialId)) }],
      userVerification: 'preferred',
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null

  if (!credential) throw new Error('Passkey signing was cancelled')

  const response = credential.response as AuthenticatorAssertionResponse
  return {
    authenticatorData: new Uint8Array(response.authenticatorData),
    clientDataJSON: new Uint8Array(response.clientDataJSON),
    signature: new Uint8Array(response.signature),
  }
}

export async function verifyAssertion(assertion: PasskeyAssertion, publicKeyJwk: JsonWebKey): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'jwk',
    publicKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  )

  const clientDataHash = new Uint8Array(
    await crypto.subtle.digest('SHA-256', toArrayBuffer(assertion.clientDataJSON)),
  )
  const signedData = new Uint8Array(assertion.authenticatorData.length + clientDataHash.length)
  signedData.set(assertion.authenticatorData, 0)
  signedData.set(clientDataHash, assertion.authenticatorData.length)

  const rawSignature = derSignatureToRaw(assertion.signature)

  return crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    toArrayBuffer(rawSignature),
    toArrayBuffer(signedData),
  )
}

export function isPasskeySupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential && !!navigator.credentials
}
