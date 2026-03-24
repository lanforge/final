import { Shippo } from 'shippo';

const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_TOKEN || '' });

export const createShipment = async (addressFrom: any, addressTo: any, parcels: any[]) => {
  try {
    return await shippo.shipments.create({
      addressFrom: addressFrom,
      addressTo: addressTo,
      parcels: parcels,
      async: false,
    });
  } catch (error: any) {
    throw new Error(`Failed to create shipment: ${error.message}`);
  }
};

export const purchaseLabel = async (rateObjectId: string) => {
  try {
    return await shippo.transactions.create({
      rate: rateObjectId,
      labelFileType: 'PDF',
      async: false,
    });
  } catch (error: any) {
    throw new Error(`Failed to purchase label: ${error.message}`);
  }
};

export const trackShipment = async (carrier: string, trackingNumber: string) => {
  try {
    return await shippo.trackingStatus.get(carrier, trackingNumber);
  } catch (error: any) {
    throw new Error(`Failed to track shipment: ${error.message}`);
  }
};

export const getRates = async (shipmentObjectId: string) => {
  try {
    // Newer shippo SDK doesn't expose rates through shipments.rates directly, 
    // but typically get() on a shipment returns rates.
    return await shippo.shipments.get(shipmentObjectId);
  } catch (error: any) {
    throw new Error(`Failed to get rates: ${error.message}`);
  }
};
