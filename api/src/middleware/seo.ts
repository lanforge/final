import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import CustomBuild from '../models/CustomBuild';
import PageContent from '../models/PageContent';

// Utility to inject meta tags into HTML string
const injectMetaTags = (html: string, tags: { title: string; description: string; image?: string; url?: string }) => {
  let modifiedHtml = html;
  
  // Replace Title
  modifiedHtml = modifiedHtml.replace(
    /<title>.*?<\/title>/i, 
    `<title>${tags.title}</title>`
  );

  // Replace Description
  modifiedHtml = modifiedHtml.replace(
    /<meta name="description" content=".*?"\s*\/?>/i, 
    `<meta name="description" content="${tags.description}" />`
  );

  // Add OpenGraph Tags
  const ogTags = `
    <meta property="og:title" content="${tags.title}" />
    <meta property="og:description" content="${tags.description}" />
    ${tags.image ? `<meta property="og:image" content="${tags.image}" />` : ''}
    ${tags.url ? `<meta property="og:url" content="${tags.url}" />` : ''}
    <meta property="og:type" content="website" />
  `;

  modifiedHtml = modifiedHtml.replace('</head>', `${ogTags}</head>`);
  
  return modifiedHtml;
};

// Default Meta
const DEFAULT_META = {
  title: 'LANForge | Custom Gaming PC Builder',
  description: 'Premium custom gaming PC builder. Design your ultimate gaming rig with cutting-edge components.',
  image: 'https://lanforge.co/logo512.png',
  url: 'https://lanforge.co'
};

export const seoMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // If it's an API request or static asset, skip
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }

  const indexPath = path.resolve(__dirname, '../../../ui/build/index.html');
  
  fs.readFile(indexPath, 'utf8', async (err, htmlData) => {
    if (err) {
      console.error('Error reading index.html', err);
      return next(); // fallback to static serving if error
    }

    let meta = { ...DEFAULT_META, url: `https://lanforge.co${req.path}` };

    try {
      // Dynamic routing checks
      if (req.path.startsWith('/products/')) {
        const productId = req.path.split('/')[2];
        const product = await Product.findById(productId);
        if (product) {
          meta.title = `${product.name} | LANForge`;
          meta.description = product.description.substring(0, 160) + '...';
          if (product.images && product.images.length > 0) {
            meta.image = product.images[0];
          }
        }
      } else if (req.path.startsWith('/build/')) {
        const buildId = req.path.split('/')[2];
        const build = await CustomBuild.findById(buildId);
        if (build) {
          meta.title = `Custom Build: ${build.name} | LANForge`;
          // Map properties safely from the PC builder model
          // @ts-ignore - Document shape may vary
          const parts: any[] = (build as any).parts || (build as any).items || (build as any).components || [];
          const cpu = parts.find((c: any) => c.partType === 'cpu' || c.category === 'CPU')?.name || parts.find((c: any) => c.partType === 'cpu' || c.category === 'CPU')?.partName || 'High-end Processor';
          const gpu = parts.find((c: any) => c.partType === 'gpu' || c.category === 'GPU')?.name || parts.find((c: any) => c.partType === 'gpu' || c.category === 'GPU')?.partName || 'Premium Graphics';
          meta.description = `Check out this custom PC build on LANForge featuring ${cpu} and ${gpu}.`;
        }
      } else if (req.path === '/pcs') {
        meta.title = 'Pre-Built Gaming PCs | LANForge';
        meta.description = 'Browse our selection of high-performance pre-built gaming PCs engineered for max framerates.';
      } else if (req.path === '/configurator') {
        meta.title = 'PC Configurator | Build Your Own | LANForge';
        meta.description = 'Use our advanced PC configurator to build your dream gaming rig part by part.';
      } else if (req.path === '/accessories') {
        meta.title = 'Gaming Accessories | LANForge';
        meta.description = 'Level up your setup with premium gaming accessories, monitors, and peripherals.';
      } else {
        // Attempt to fetch from PageContent if it's a CMS page
        const slug = req.path.split('/')[1];
        if (slug) {
          const page = await PageContent.findOne({ slug });
          if (page) {
            meta.title = `${page.title} | LANForge`;
            // Strip markdown for description
            meta.description = page.content.replace(/[#*`_]/g, '').substring(0, 160).trim() + '...';
          }
        }
      }
    } catch (e) {
      console.error('Error fetching dynamic meta', e);
    }

    const finalHtml = injectMetaTags(htmlData, meta);
    res.send(finalHtml);
  });
};
