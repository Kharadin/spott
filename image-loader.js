export default function convexImageLoader({ src }) {
  // Debug line: This will print inside your terminal when a component renders an image
  console.log("Image loader intercepted path:", src);

  if (src && src.includes('/api/storage/')) {
    const storageId = src.split('/api/storage/').pop();
    return `https://proxy.bereg-go.ru/event-images/${storageId}`;
  }
  
  return src;
}
