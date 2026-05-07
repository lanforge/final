import { Router, Request, Response } from 'express';
import TradeIn from '../models/TradeIn';
import { protect, staffOrAdmin } from '../middleware/auth';

const router = Router();

type AnyObject = Record<string, any>;

const generateTradeCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TRADE-';

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

const generateUniqueTradeCode = async (): Promise<string> => {
  let tradeCode = generateTradeCode();
  let isUnique = false;

  while (!isUnique) {
    const existing = await TradeIn.findOne({ tradeCode });

    if (!existing) {
      isUnique = true;
    } else {
      tradeCode = generateTradeCode();
    }
  }

  return tradeCode;
};

const normalizeTradeCode = (code: unknown): string => {
  if (typeof code !== 'string') {
    return '';
  }

  return code.trim().toUpperCase();
};

const cleanString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : undefined;
};

const isPlainObject = (value: unknown): value is AnyObject => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const hasKeys = (value: unknown): boolean => {
  return isPlainObject(value) && Object.keys(value).length > 0;
};

const asArray = (value: any): any[] | undefined => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null) {
    return undefined;
  }

  return [value];
};

const normalizeMotherboard = (motherboard: any): any => {
  if (!motherboard) {
    return motherboard;
  }

  // Handle plain string like "ASUSTeK COMPUTER INC. ROG CROSSHAIR X870E HERO"
  if (typeof motherboard === 'string') {
    const parts = motherboard.trim().split(/\s+/);
    // Try to find manufacturer by taking known prefixes
    const knownManufacturers = ['ASUSTeK', 'ASUS', 'MSI', 'GIGABYTE', 'ASRock', 'BIOSTAR', 'EVGA', 'Intel', 'AMD'];
    let manufacturer = '';
    let product = motherboard;
    for (const known of knownManufacturers) {
      if (motherboard.toUpperCase().startsWith(known.toUpperCase())) {
        manufacturer = known;
        product = motherboard.substring(known.length).trim();
        break;
      }
    }
    return { manufacturer, product, version: '', serialNumber: '' };
  }

  if (
    motherboard.product &&
    typeof motherboard.product === 'object' &&
    !Array.isArray(motherboard.product)
  ) {
    return {
      manufacturer: motherboard.product.manufacturer || motherboard.manufacturer || '',
      product: motherboard.product.product || '',
      version: motherboard.product.version || motherboard.version || '',
      serialNumber: motherboard.product.serialNumber || motherboard.serialNumber || '',
    };
  }

  return motherboard;
};

const normalizeWindows = (windows: any): any => {
  if (!windows) {
    return windows;
  }

  return {
    caption: windows.caption || windows.name || '',
    version: windows.version || '',
    buildNumber: windows.buildNumber || windows.build || '',
    architecture: windows.architecture || '',
    installDate: windows.installDate || '',
    lastBootUpTime: windows.lastBootUpTime || '',
    systemDrive: windows.systemDrive || '',
  };
};

const normalizeBios = (bios: any): any => {
  if (!bios) {
    return bios;
  }

  return {
    manufacturer: bios.manufacturer || '',
    name: bios.name || '',
    version: bios.version || '',
    serialNumber: bios.serialNumber || '',
    releaseDate: bios.releaseDate || '',
  };
};

const normalizeStorage = (storage: any): any => {
  if (!storage) {
    return storage;
  }

  return {
    internalStorageTotalGB:
      storage.internalStorageTotalGB ??
      storage.internalStorageGB ??
      storage.storageGB ??
      0,
    diskCount:
      storage.diskCount ??
      (Array.isArray(storage.physicalDisks)
        ? storage.physicalDisks.length
        : Array.isArray(storage.disks)
          ? storage.disks.length
          : undefined),
    internalDiskCount: storage.internalDiskCount,
    physicalDisks: storage.physicalDisks || storage.disks || [],
  };
};

const normalizeRam = (ram: any): any => {
  if (!ram) {
    return ram;
  }

  const modules = Array.isArray(ram.modules) ? ram.modules : [];
  const memoryTypes = ram.memoryTypes || Array.from(
    new Set(
      modules
        .map((module: any) => module.memoryType)
        .filter((value: any) => typeof value === 'string' && value.trim().length > 0)
    )
  );

  const configuredSpeeds = modules
    .map((module: any) => Number(module.configuredMHz))
    .filter((value: number) => !Number.isNaN(value) && value > 0);

  const ratedSpeeds = modules
    .map((module: any) => Number(module.speedMHz))
    .filter((value: number) => !Number.isNaN(value) && value > 0);

  const capacities = modules
    .map((module: any) => Number(module.capacityGB))
    .filter((value: number) => !Number.isNaN(value) && value > 0);

  const dimmCount = ram.dimmCount ?? modules.length;
  const primaryCapacity = capacities.length > 0 ? capacities[0] : undefined;
  const allSameCapacity = capacities.length > 0 && capacities.every((value: number) => value === primaryCapacity);

  const moduleLayout =
    ram.moduleLayout ||
    (dimmCount > 0 && allSameCapacity && primaryCapacity
      ? `${dimmCount}x${primaryCapacity} GB`
      : capacities.length > 0
        ? capacities.map((value: number) => `${value} GB`).join(' + ')
        : '');

  return {
    totalGB: ram.totalGB ?? ram.ramGB ?? 0,
    dimmCount,
    memoryTypes,
    primaryMemoryType: ram.primaryMemoryType || memoryTypes[0] || 'Unknown',
    moduleLayout,
    ratedSpeedMHz: ram.ratedSpeedMHz ?? (ratedSpeeds.length > 0 ? Math.max(...ratedSpeeds) : undefined),
    configuredSpeedMHz:
      ram.configuredSpeedMHz ?? (configuredSpeeds.length > 0 ? Math.max(...configuredSpeeds) : undefined),
    modules,
  };
};

const buildScannerReport = (body: AnyObject, tradeCode: string): AnyObject => {
  const report: AnyObject = {};

  if (isPlainObject(body.scannerReport)) {
    Object.assign(report, body.scannerReport);
  }

  const scannerData = isPlainObject(body.scannerData) ? body.scannerData : undefined;

  if (scannerData) {
    if (scannerData.scanner) report.scanner = scannerData.scanner;
    if (scannerData.reportMetadata) report.reportMetadata = scannerData.reportMetadata;
    if (scannerData.summary) report.summary = scannerData.summary;
    if (scannerData.system) report.system = scannerData.system;
    if (scannerData.windows) report.windows = normalizeWindows(scannerData.windows);
    if (scannerData.motherboard) report.motherboard = normalizeMotherboard(scannerData.motherboard);
    if (scannerData.bios) report.bios = normalizeBios(scannerData.bios);
    if (scannerData.cpu) report.cpu = typeof scannerData.cpu === 'string' ? [{ name: scannerData.cpu }] : scannerData.cpu;
    if (scannerData.gpu) report.gpu = typeof scannerData.gpu === 'string' ? [{ name: scannerData.gpu }] : scannerData.gpu;
    if (scannerData.ram) report.ram = normalizeRam(scannerData.ram);
    if (scannerData.storage) report.storage = normalizeStorage(scannerData.storage);
    if (scannerData.network) report.network = scannerData.network;
    if (scannerData.security) report.security = scannerData.security;
    if (scannerData.warnings) report.warnings = scannerData.warnings;

    if (!report.ram && scannerData.ramGB !== undefined) {
      report.ram = normalizeRam({ 
        totalGB: scannerData.ramGB,
        modules: scannerData.ramModules || [],
        dimmCount: Array.isArray(scannerData.ramModules) ? scannerData.ramModules.length : undefined,
      });
    } else if (scannerData.ramModules && Array.isArray(scannerData.ramModules) && scannerData.ramModules.length > 0) {
      // Merge module data into existing ram object
      if (!report.ram.modules || report.ram.modules.length === 0) {
        report.ram.modules = scannerData.ramModules;
        report.ram.dimmCount = scannerData.ramModules.length;
      }
    }

    if (!report.storage && scannerData.storageGB !== undefined) {
      report.storage = normalizeStorage({ 
        internalStorageTotalGB: scannerData.storageGB,
        physicalDisks: scannerData.physicalDisks || [],
        diskCount: Array.isArray(scannerData.physicalDisks) ? scannerData.physicalDisks.length : undefined,
      });
    } else if (scannerData.physicalDisks && Array.isArray(scannerData.physicalDisks) && scannerData.physicalDisks.length > 0) {
      if (!report.storage.physicalDisks || report.storage.physicalDisks.length === 0) {
        report.storage.physicalDisks = scannerData.physicalDisks;
        report.storage.diskCount = scannerData.physicalDisks.length;
      }
    }
  }

  if (body.reportMetadata) report.reportMetadata = body.reportMetadata;
  if (body.summary) report.summary = body.summary;
  if (body.system) report.system = body.system;
  if (body.windows) report.windows = normalizeWindows(body.windows);
  if (body.motherboard) report.motherboard = normalizeMotherboard(body.motherboard);
  if (body.bios) report.bios = normalizeBios(body.bios);
  if (body.cpu) report.cpu = asArray(body.cpu);
  if (body.gpu) report.gpu = asArray(body.gpu);
  if (body.ram) report.ram = normalizeRam(body.ram);
  if (body.storage) report.storage = normalizeStorage(body.storage);
  if (body.network) report.network = body.network;
  if (body.security) report.security = body.security;
  if (body.warnings) report.warnings = body.warnings;

  if (report.ram) {
    report.ram = normalizeRam(report.ram);
  }

  if (report.storage) {
    report.storage = normalizeStorage(report.storage);
  }

  if (report.motherboard) {
    report.motherboard = normalizeMotherboard(report.motherboard);
  }

  if (report.windows) {
    report.windows = normalizeWindows(report.windows);
  }

  if (report.bios) {
    report.bios = normalizeBios(report.bios);
  }

  if (!report.reportMetadata) {
    report.reportMetadata = {};
  }

  report.reportMetadata.customerInputCode = report.reportMetadata.customerInputCode || tradeCode;
  report.reportMetadata.generatedAt = report.reportMetadata.generatedAt || new Date().toISOString();

  return report;
};

const deriveComponentsFromScannerReport = (scannerReport: AnyObject): AnyObject => {
  const cpuList = Array.isArray(scannerReport.cpu) ? scannerReport.cpu : [];
  const gpuList = Array.isArray(scannerReport.gpu) ? scannerReport.gpu : [];

  const primaryCpu = cpuList[0];

  const primaryGpu =
    gpuList.find((gpu: any) => gpu && gpu.isLikelyRealGpu === true) ||
    gpuList[0];

  const ram = scannerReport.ram || {};
  const storage = scannerReport.storage || {};
  const motherboard = scannerReport.motherboard || {};

  const ramParts: string[] = [];

  if (ram.totalGB !== undefined) {
    ramParts.push(`${ram.totalGB} GB`);
  }

  if (ram.primaryMemoryType) {
    ramParts.push(ram.primaryMemoryType);
  }

  if (ram.moduleLayout) {
    ramParts.push(`(${ram.moduleLayout})`);
  }

  if (ram.configuredSpeedMHz) {
    ramParts.push(`@ ${ram.configuredSpeedMHz} MHz`);
  }

  const storageParts: string[] = [];

  if (storage.internalStorageTotalGB !== undefined) {
    storageParts.push(`${storage.internalStorageTotalGB} GB internal storage`);
  }

  if (Array.isArray(storage.physicalDisks) && storage.physicalDisks.length > 0) {
    storageParts.push(
      storage.physicalDisks
        .filter((disk: any) => !disk.isUSB && !disk.isRemovable)
        .map((disk: any) => `${disk.model || 'Unknown disk'} (${disk.sizeGB || '?'} GB)`)
        .join('; ')
    );
  }

  return {
    cpu: primaryCpu?.name || scannerReport.summary?.primaryCpu || '',
    gpu:
      primaryGpu?.name
        ? `${primaryGpu.name}${primaryGpu.vramGuessGB ? ` - VRAM Guess: ${primaryGpu.vramGuessGB} GB` : ''}`
        : scannerReport.summary?.primaryGpu || '',
    ram: ramParts.join(' ').trim(),
    storage: storageParts.filter(Boolean).join(' - ').trim(),
    motherboard:
      motherboard.manufacturer || motherboard.product
        ? `${motherboard.manufacturer || ''} ${motherboard.product || ''}`.trim()
        : scannerReport.summary?.motherboard || '',
    psu: '',
    case: '',
    cooler: '',
    other:
      scannerReport.summary?.scannerId
        ? `Scanner ID: ${scannerReport.summary.scannerId}`
        : '',
  };
};

const mergeComponents = (existingComponents: any, incomingComponents: any): any => {
  const existing = existingComponents ? JSON.parse(JSON.stringify(existingComponents)) : {};
  const incoming = incomingComponents || {};

  return {
    cpu: cleanString(incoming.cpu) || existing.cpu || '',
    gpu: cleanString(incoming.gpu) || existing.gpu || '',
    ram: cleanString(incoming.ram) || existing.ram || '',
    storage: cleanString(incoming.storage) || existing.storage || '',
    motherboard: cleanString(incoming.motherboard) || existing.motherboard || '',
    psu: cleanString(incoming.psu) || existing.psu || '',
    case: cleanString(incoming.case) || existing.case || '',
    cooler: cleanString(incoming.cooler) || existing.cooler || '',
    other: cleanString(incoming.other) || existing.other || '',
  };
};

const updateTradeInWithPayload = async (
  tradeIn: any,
  body: AnyObject,
  scannerReport: AnyObject
): Promise<any> => {
  const derivedComponents = deriveComponentsFromScannerReport(scannerReport);
  const componentsToSave = body.components || derivedComponents;

  tradeIn.set('components', mergeComponents(tradeIn.components, componentsToSave));

  const incomingName = cleanString(body.customerName);
  const incomingEmail = cleanString(body.customerEmail);
  const incomingPhone = cleanString(body.customerPhone);

  if (incomingName) tradeIn.customerName = incomingName;
  if (incomingEmail) tradeIn.customerEmail = incomingEmail.toLowerCase();
  if (incomingPhone) tradeIn.customerPhone = incomingPhone;

  if (cleanString(body.notes)) {
    tradeIn.notes = body.notes;
  }

  if (hasKeys(scannerReport)) {
    tradeIn.scannerReport = scannerReport;
  }

  await tradeIn.save();

  return tradeIn;
};

// POST /api/trade-ins/:code/scan
// Dedicated endpoint for scanner EXE.
// This updates an EXISTING website-created trade-in and preserves customer name/email.
router.post('/:code/scan', async (req: Request, res: Response): Promise<void> => {
  try {
    const codeFromParam = normalizeTradeCode(req.params.code);
    const codeFromBody = normalizeTradeCode(req.body.tradeCode);

    if (!codeFromParam) {
      res.status(400).json({ error: 'Trade code is required' });
      return;
    }

    if (codeFromBody && codeFromBody !== codeFromParam) {
      res.status(400).json({
        error: 'Trade code mismatch',
        paramCode: codeFromParam,
        bodyCode: codeFromBody,
      });
      return;
    }

    const tradeIn = await TradeIn.findOne({ tradeCode: codeFromParam });

    if (!tradeIn) {
      res.status(404).json({
        error: 'Trade-in code not found. Please create the trade-in on the website first.',
        tradeCode: codeFromParam,
      });
      return;
    }

    const scannerReport = buildScannerReport(req.body, codeFromParam);
    const updatedTradeIn = await updateTradeInWithPayload(tradeIn, req.body, scannerReport);

    try {
      const { sendNotification } = await import('../services/notificationService');
      await sendNotification(
        `Trade-In Scanner Report Submitted\nCode: ${codeFromParam}\nCPU: ${updatedTradeIn.components?.cpu || 'N/A'}\nGPU: ${updatedTradeIn.components?.gpu || 'N/A'}\nRAM: ${updatedTradeIn.components?.ram || 'N/A'}`
      );
    } catch (notifErr) {
      console.error('Failed to send scanner notification:', notifErr);
    }

    res.json({
      message: 'Scanner report saved successfully',
      tradeCode: updatedTradeIn.tradeCode,
      tradeIn: updatedTradeIn,
    });
  } catch (error) {
    console.error('Error saving scanner report:', error);
    res.status(500).json({ error: 'Server error saving scanner report' });
  }
});

// POST /api/trade-ins
// Website creation endpoint, and fallback for direct submissions.
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const requestedCode = normalizeTradeCode(req.body.tradeCode);
    const codeToUse = requestedCode || await generateUniqueTradeCode();

    let existingTradeIn = await TradeIn.findOne({ tradeCode: codeToUse });

    const scannerReport = buildScannerReport(req.body, codeToUse);

    if (existingTradeIn) {
      const updatedTradeIn = await updateTradeInWithPayload(existingTradeIn, req.body, scannerReport);

      res.json({
        message: 'Trade-in updated successfully',
        tradeCode: updatedTradeIn.tradeCode,
        tradeIn: updatedTradeIn,
      });
      return;
    }

    const derivedComponents = deriveComponentsFromScannerReport(scannerReport);
    const components = req.body.components || derivedComponents;

    const newTradeIn = new TradeIn({
      tradeCode: codeToUse,
      customerName: cleanString(req.body.customerName) || '',
      customerEmail: cleanString(req.body.customerEmail)?.toLowerCase() || '',
      customerPhone: cleanString(req.body.customerPhone),
      components,
      notes: cleanString(req.body.notes) || '',
      scannerReport: hasKeys(scannerReport) ? scannerReport : {},
    });

    await newTradeIn.save();

    try {
      const { sendNotification } = await import('../services/notificationService');
      await sendNotification(
        `New Trade-In Request\nCode: ${codeToUse}\nCustomer: ${newTradeIn.customerName || 'N/A'} (${newTradeIn.customerEmail || 'N/A'})\nComponents: ${JSON.stringify(newTradeIn.components, null, 2)}`
      );
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr);
    }

    res.status(201).json({
      message: 'Trade-in submitted successfully',
      tradeCode: codeToUse,
      tradeIn: newTradeIn,
    });
  } catch (error: any) {
    console.error('Error creating trade-in:', error);

    if (error.code === 11000) {
      res.status(400).json({ error: 'Trade code already exists. Please try again.' });
    } else {
      res.status(500).json({ error: 'Server error creating trade-in' });
    }
  }
});

// GET /api/trade-ins/:code
router.get('/:code', async (req: Request, res: Response): Promise<void> => {
  try {
    const code = normalizeTradeCode(req.params.code);
    const tradeIn = await TradeIn.findOne({ tradeCode: code });

    if (!tradeIn) {
      res.status(404).json({ error: 'Trade-in not found' });
      return;
    }

    res.json(tradeIn);
  } catch (error) {
    console.error('Error fetching trade-in:', error);
    res.status(500).json({ error: 'Server error fetching trade-in' });
  }
});

// GET /api/trade-ins
router.get('/', protect, staffOrAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    const tradeIns = await TradeIn.find(query).sort({ createdAt: -1 });
    res.json(tradeIns);
  } catch (error) {
    console.error('Error fetching trade-ins:', error);
    res.status(500).json({ error: 'Server error fetching trade-ins' });
  }
});

// PUT /api/trade-ins/:code
router.put('/:code', protect, staffOrAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const code = normalizeTradeCode(req.params.code);
    const { status, tradeInValue, notes } = req.body;

    const updateData: any = {};

    if (status) updateData.status = status;
    if (tradeInValue !== undefined) updateData.tradeInValue = tradeInValue;
    if (notes !== undefined) updateData.notes = notes;

    const tradeIn = await TradeIn.findOneAndUpdate(
      { tradeCode: code },
      updateData,
      { new: true }
    );

    if (!tradeIn) {
      res.status(404).json({ error: 'Trade-in not found' });
      return;
    }

    res.json(tradeIn);
  } catch (error) {
    console.error('Error updating trade-in:', error);
    res.status(500).json({ error: 'Server error updating trade-in' });
  }
});

// DELETE /api/trade-ins/:code
router.delete('/:code', protect, staffOrAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const code = normalizeTradeCode(req.params.code);
    const tradeIn = await TradeIn.findOneAndDelete({ tradeCode: code });

    if (!tradeIn) {
      res.status(404).json({ error: 'Trade-in not found' });
      return;
    }

    res.json({ message: 'Trade-in deleted' });
  } catch (error) {
    console.error('Error deleting trade-in:', error);
    res.status(500).json({ error: 'Server error deleting trade-in' });
  }
});

export default router;