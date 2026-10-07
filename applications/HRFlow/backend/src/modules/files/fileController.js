const path = require('path');
const fs = require('fs');
const { errorResponse } = require('../../utils/apiResponse');

const downloadFile = (req, res) => {
  try {
    const { tenantId, category, filename } = req.params;
    const { role, tenantId: userTenantId } = req.user;

    // Tenant Isolation Check
    if (role !== 'PLATFORM_ADMIN' && userTenantId !== tenantId) {
      return errorResponse(
        res,
        'Access Denied: You do not have permission to access files belonging to another dealer organization.',
        403
      );
    }

    // Sanitize filename against directory traversal
    const safeFilename = path.basename(filename);
    const safeCategory = path.basename(category);
    const filePath = path.join(__dirname, '../../../storage/tenants', tenantId, safeCategory, safeFilename);

    if (!fs.existsSync(filePath)) {
      return errorResponse(res, 'File not found.', 404);
    }

    return res.sendFile(filePath);
  } catch (err) {
    console.error('File retrieval error:', err);
    return errorResponse(res, 'Failed to retrieve requested file.', 500);
  }
};

module.exports = {
  downloadFile,
};
