import mongoose, { Document, Schema } from 'mongoose';

export type TradeInStatus = 'pending' | 'evaluated' | 'accepted' | 'declined' | 'completed';

export interface ITradeIn extends Document {
  tradeCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  components: {
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
    motherboard?: string;
    psu?: string;
    case?: string;
    cooler?: string;
    other?: string;
  };

  tradeInValue?: number;
  status: TradeInStatus;
  notes?: string;

  scannerReport?: {
    reportMetadata?: {
      companyName?: string;
      toolName?: string;
      version?: string;
      reportId?: string;
      generatedAt?: string;
      generatedByUser?: string;
      computerName?: string;
      customerInputCode?: string;
      note?: string;
    };

    summary?: {
      tradeCode?: string;
      scannerId?: string;
      primaryCpu?: string;
      primaryGpu?: string;
      totalRamGB?: number;
      ramType?: string;
      dimmCount?: number;
      ramLayout?: string;
      ramConfiguredSpeedMHz?: number | string;
      ramRatedSpeedMHz?: number | string;
      internalStorageGB?: number;
      motherboard?: string;
      warningCount?: number;
      scannedAt?: string;
    };

    system?: {
      manufacturer?: string;
      model?: string;
      computerName?: string;
      systemType?: string;
      totalRamGB?: number;
      isAdmin?: boolean;
    };

    windows?: {
      caption?: string;
      version?: string;
      buildNumber?: string;
      architecture?: string;
      installDate?: string;
      lastBootUpTime?: string;
      systemDrive?: string;
    };

    motherboard?: {
      manufacturer?: string;
      product?: string;
      version?: string;
      serialNumber?: string;
    };

    bios?: {
      manufacturer?: string;
      name?: string;
      version?: string;
      serialNumber?: string;
      releaseDate?: string;
    };

    cpu?: Array<{
      name?: string;
      manufacturer?: string;
      description?: string;
      cores?: number;
      logicalProcessors?: number;
      maxClockMHz?: number;
      currentClockMHz?: number;
      socket?: string;
      processorId?: string;
      virtualizationEnabled?: boolean;
      l2CacheKB?: number;
      l3CacheKB?: number;
    }>;

    gpu?: Array<{
      name?: string;
      isLikelyRealGpu?: boolean;
      isMicrosoftBasicAdapter?: boolean;
      status?: string;
      driverVersion?: string;
      driverDate?: string;
      rawAdapterRAMGB?: string | number;
      vramGuessGB?: string | number;
      vramNote?: string;
      videoProcessor?: string;
      resolution?: string;
      refreshRate?: number;
      pnpDeviceId?: string;
    }>;

    ram?: {
      totalGB?: number;
      dimmCount?: number;
      memoryTypes?: string[];
      primaryMemoryType?: string;
      moduleLayout?: string;
      ratedSpeedMHz?: number | string;
      configuredSpeedMHz?: number | string;
      modules?: Array<{
        manufacturer?: string;
        partNumber?: string;
        serialNumber?: string;
        capacityGB?: number;
        speedMHz?: number;
        configuredMHz?: number;
        memoryType?: string;
        smbiosMemoryType?: number;
        formFactor?: number;
        slot?: string;
        bank?: string;
      }>;
    };

    storage?: {
      internalStorageTotalGB?: number;
      diskCount?: number;
      internalDiskCount?: number;
      physicalDisks?: Array<{
        model?: string;
        manufacturer?: string;
        serialNumber?: string;
        interfaceType?: string;
        mediaType?: string;
        sizeGB?: number;
        sizeTB?: number;
        status?: string;
        firmware?: string;
        isUSB?: boolean;
        isRemovable?: boolean;
        pnpDeviceId?: string;
      }>;
    };

    network?: Array<{
      name?: string;
      manufacturer?: string;
      macAddress?: string;
      adapterType?: string;
      netConnection?: string;
    }>;

    security?: {
      secureBoot?: boolean | string;
      tpmPresent?: boolean;
      tpmEnabled?: boolean;
      tpmVersion?: string;
    };

    warnings?: string[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const TradeInSchema = new Schema<ITradeIn>(
  {
    tradeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    customerName: {
      type: String,
      trim: true,
      default: '',
    },

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },

    customerPhone: {
      type: String,
      trim: true,
    },

    components: {
      cpu: { type: String, trim: true },
      gpu: { type: String, trim: true },
      ram: { type: String, trim: true },
      storage: { type: String, trim: true },
      motherboard: { type: String, trim: true },
      psu: { type: String, trim: true },
      case: { type: String, trim: true },
      cooler: { type: String, trim: true },
      other: { type: String, trim: true },
    },

    tradeInValue: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: ['pending', 'evaluated', 'accepted', 'declined', 'completed'],
      default: 'pending',
    },

    notes: {
      type: String,
      default: '',
    },

    scannerReport: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

TradeInSchema.index({ tradeCode: 1 });
TradeInSchema.index({ customerEmail: 1 });
TradeInSchema.index({ status: 1, createdAt: -1 });
TradeInSchema.index({ 'scannerReport.reportMetadata.reportId': 1 });
TradeInSchema.index({ 'scannerReport.summary.scannerId': 1 });
TradeInSchema.index({ 'scannerReport.summary.primaryGpu': 1 });
TradeInSchema.index({ 'scannerReport.summary.primaryCpu': 1 });

export default mongoose.model<ITradeIn>('TradeIn', TradeInSchema);