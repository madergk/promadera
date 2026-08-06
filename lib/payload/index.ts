import configPromise from '@payload-config'
import { getPayload } from 'payload'

/** Cliente Payload (Local API) cacheado por proceso. */
export const getPayloadClient = async () => getPayload({ config: configPromise })
