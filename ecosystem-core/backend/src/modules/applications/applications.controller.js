import prisma from '../../config/db.js';

export async function getApplications(req, res, next) {
  try {
    const apps = await prisma.application.findMany({
      include: {
        tenantApplications: req.tenantId ? {
          where: { tenantId: req.tenantId }
        } : false
      },
      orderBy: { name: 'asc' }
    });

    const enriched = apps.map(app => ({
      id: app.id,
      appKey: app.appKey,
      name: app.name,
      description: app.description,
      icon: app.icon,
      baseUrl: app.baseUrl,
      apiUrl: app.apiUrl,
      version: app.version,
      category: app.category,
      isActive: app.isActive,
      isSubscribed: req.tenantId ? (app.tenantApplications?.length > 0 && app.tenantApplications[0].status === 'ACTIVE') : true,
      subscription: req.tenantId && app.tenantApplications?.length > 0 ? app.tenantApplications[0] : null
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
}

export async function registerApplication(req, res, next) {
  try {
    const { appKey, name, description, icon, baseUrl, apiUrl, version, category, healthEndpoint, settings } = req.body;

    if (!appKey || !name || !baseUrl || !apiUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'appKey, name, baseUrl, and apiUrl are required.' }
      });
    }

    const app = await prisma.application.create({
      data: {
        appKey: appKey.toLowerCase().trim(),
        name,
        description,
        icon: icon || 'AppWindow',
        baseUrl,
        apiUrl,
        version: version || '1.0.0',
        category: category || 'OPERATIONS',
        healthEndpoint: healthEndpoint || '/api/health',
        settings
      }
    });

    res.status(201).json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
}

export async function subscribeApplication(req, res, next) {
  try {
    const { applicationId, planName, customConfig } = req.body;
    if (!applicationId) {
      return res.status(400).json({ success: false, error: { message: 'applicationId is required.' } });
    }

    const subscription = await prisma.tenantApplication.upsert({
      where: {
        tenantId_applicationId: {
          tenantId: req.tenantId,
          applicationId
        }
      },
      update: {
        status: 'ACTIVE',
        planName: planName || 'STANDARD',
        customConfig: customConfig || undefined
      },
      create: {
        tenantId: req.tenantId,
        applicationId,
        status: 'ACTIVE',
        planName: planName || 'STANDARD',
        customConfig
      },
      include: { application: true }
    });

    res.json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
}
