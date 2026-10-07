import { Router } from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  scanAssetQR
} from './asset.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole, requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/', getAssets);
router.get('/qr/:code', scanAssetQR);
router.get('/:id', getAssetById);
router.post('/', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER'), createAsset);
router.put('/:id', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER'), updateAsset);

export default router;
