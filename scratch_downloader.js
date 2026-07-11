const fs = require('fs');
const path = require('path');
const https = require('https');

// Target files to parse and modify
const RETREATS_JSON_PATH = path.resolve(__dirname, 'src/content/data/retreats/retreats.json');
const ACCOMMODATION_TS_PATH = path.resolve(__dirname, 'src/data/retreatAccommodation.ts');
const CONTACT_PAGE_CLIENT_PATH = path.resolve(__dirname, 'src/app/(site)/contact/ContactPageClient.tsx');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

// Ensure directories exist
function ensureDirExists(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirExists(dirname);
  fs.mkdirSync(dirname);
}

// Download utility
function download(url, dest) {
  return new Promise((resolve, reject) => {
    ensureDirExists(dest);
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode === 404) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`404 Not Found: ${url}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Fallback high-quality Unsplash image URLs based on content categories
const FALLBACKS = {
  room: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
  food: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
  yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  general: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
};

function getFallbackCategory(url) {
  const lower = url.toLowerCase();
  if (lower.includes('room') || lower.includes('venue') || lower.includes('accommodation') || lower.includes('private') || lower.includes('shared')) {
    return 'room';
  }
  if (lower.includes('food') || lower.includes('dinning') || lower.includes('meal') || lower.includes('dining')) {
    return 'food';
  }
  if (lower.includes('yoga') || lower.includes('meditation') || lower.includes('retreat') || lower.includes('asana')) {
    return 'yoga';
  }
  return 'general';
}

async function main() {
  console.log("Analyzing file paths...");
  
  let retreatsContent = fs.readFileSync(RETREATS_JSON_PATH, 'utf8');
  let accommodationContent = fs.readFileSync(ACCOMMODATION_TS_PATH, 'utf8');
  let contactContent = fs.readFileSync(CONTACT_PAGE_CLIENT_PATH, 'utf8');
  
  // Find all remote URLs
  const urlRegex = /https:\/\/[a-zA-Z0-9.\-_/]+(?:\.webp|\.jpg|\.png)/g;
  
  const urls = new Set();
  let match;
  while ((match = urlRegex.exec(retreatsContent)) !== null) urls.add(match[0]);
  while ((match = urlRegex.exec(accommodationContent)) !== null) urls.add(match[0]);
  while ((match = urlRegex.exec(contactContent)) !== null) urls.add(match[0]);
  
  // Add manual loop elements from dynamic generator in accommodation
  for (let i = 1; i <= 10; i++) {
    urls.add(`https://www.nirvanayogaschoolindia.com/img/retreat-venue/private/${i}.webp`);
  }
  for (let i = 1; i <= 12; i++) {
    urls.add(`https://www.nirvanayogaschoolindia.com/img/retreat-venue/2-shared/${i}.webp`);
  }
  for (let i = 1; i <= 6; i++) {
    urls.add(`https://www.nirvanayogaschoolindia.com/img/gallery/webp/dinning/dinning${i}.webp`);
  }

  console.log(`Found ${urls.size} unique remote image URLs to download.`);
  
  const downloadedUrlsMap = new Map();
  let downloadCount = 0;
  let failCount = 0;
  
  for (const url of urls) {
    let localPath = "";
    
    if (url.includes('nirvanayogaschoolindia.com/img/')) {
      const relativePath = url.split('nirvanayogaschoolindia.com/img/')[1];
      localPath = path.join(PUBLIC_DIR, 'img', relativePath);
    } else if (url.includes('nirvanayogaschoolindia.com/admin/uploads/')) {
      const relativePath = url.split('nirvanayogaschoolindia.com/admin/uploads/')[1];
      localPath = path.join(PUBLIC_DIR, 'img', 'uploads', relativePath);
    } else {
      // Unsplash or other external URLs
      const hash = require('crypto').createHash('md5').update(url).digest('hex').substring(0, 8);
      localPath = path.join(PUBLIC_DIR, 'img', 'unsplash', `${hash}.jpg`);
    }
    
    // Determine target relative route path inside project
    const relativeWebPath = '/img/' + path.relative(path.join(PUBLIC_DIR, 'img'), localPath);
    
    if (fs.existsSync(localPath)) {
      console.log(`Already downloaded: ${url} -> ${relativeWebPath}`);
      downloadedUrlsMap.set(url, relativeWebPath);
      continue;
    }
    
    console.log(`Downloading: ${url}...`);
    try {
      await download(url, localPath);
      console.log(`-> Success: saved to ${relativeWebPath}`);
      downloadedUrlsMap.set(url, relativeWebPath);
      downloadCount++;
    } catch (err) {
      console.warn(`-> Failed downloading original URL: ${url}. Error: ${err.message}`);
      const category = getFallbackCategory(url);
      const fallbackUrl = FALLBACKS[category];
      console.log(`-> Attempting fallback category "${category}" from Unsplash...`);
      try {
        await download(fallbackUrl, localPath);
        console.log(`-> Success (fallback): saved to ${relativeWebPath}`);
        downloadedUrlsMap.set(url, relativeWebPath);
        downloadCount++;
      } catch (fallbackErr) {
        console.error(`-> Failed downloading fallback as well: ${fallbackUrl}`);
        failCount++;
      }
    }
  }
  
  console.log(`\nDownloads complete. ${downloadCount} images downloaded. ${failCount} failed.`);
  
  // Replace remote URLs in the files with local relative web paths
  console.log("Updating files with local image references...");
  
  // 1. Update retreats.json
  let updatedRetreats = retreatsContent;
  // 2. Update retreatAccommodation.ts
  let updatedAccommodation = accommodationContent;
  // 3. Update ContactPageClient.tsx
  let updatedContact = contactContent;

  for (const [remoteUrl, localWebPath] of downloadedUrlsMap.entries()) {
    updatedRetreats = updatedRetreats.split(remoteUrl).join(localWebPath);
    updatedAccommodation = updatedAccommodation.split(remoteUrl).join(localWebPath);
    updatedContact = updatedContact.split(remoteUrl).join(localWebPath);
  }
  
  // Perform search-and-replace base URL cleanups
  updatedRetreats = updatedRetreats.split('https://www.nirvanayogaschoolindia.com/img/').join('/img/');
  updatedAccommodation = updatedAccommodation.split('https://www.nirvanayogaschoolindia.com/img/').join('/img/');
  updatedAccommodation = updatedAccommodation.split('https://www.nirvanayogaschoolindia.com/admin/uploads/').join('/img/uploads/');

  fs.writeFileSync(RETREATS_JSON_PATH, updatedRetreats, 'utf8');
  fs.writeFileSync(ACCOMMODATION_TS_PATH, updatedAccommodation, 'utf8');
  fs.writeFileSync(CONTACT_PAGE_CLIENT_PATH, updatedContact, 'utf8');
  
  console.log("Files updated successfully!");
}

main().catch(err => {
  console.error("Critical error in downloader script:", err);
});
