export default function customImageLoader({ src, width, quality }) {
  console.log("Image loader intercepted path:", src);

  // 1. CONVEX MATCHING & REWRITE
  if (src && src.includes('/api/storage/')) {
    const storageId = src.split('/api/storage/').pop().split('?')[0];
    return `https://bereg-go.ru{storageId}`;
  }
  
  // 2. UNSPLASH MATCHING & REWRITE
  if (src && src.includes('unsplash.com')) {
    const unsplashPath = src.split('unsplash.com').pop().split('?')[0];
    
    const w = width || 1200;
    const q = quality || 75;
    
    // Your exact corrected line:
    return `https://proxy.bereg-go.ru/unsplash${unsplashPath}?w=${w}&q=${q}`;
  }
  
  return src;
}
