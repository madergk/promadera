/** Convierte un File de un <input> a la forma que pide el `file` de la Local API de Payload. */
export async function toPayloadFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())
  return {
    data: buffer,
    mimetype: file.type,
    name: file.name,
    size: file.size,
  }
}
