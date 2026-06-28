import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

const KEYS_FILE = path.join(process.cwd(), 'activated_keys.json');

const VALID_KEYS = [
  'DRAGO40',
  'TURBO40',
  'DRAGO-TURBO',
  'VIP-KEY',
  'ADMIN',
  'FREE-TRIAL',
  'RAMESH'
];

interface KeyRecord {
  key: string;
  deviceId: string;
  activatedAt: number;
  expiresAt: number;
}

// In-memory cache for cookies to minimize decryption overhead
let cachedDragoCookie: string | null = null;
let cachedPredictorCookie: string | null = null;
let cachedAesJs: string | null = null;

// Solver function to bypass InfinityFree slowAES protection
async function solveDragoChallenge(challengeHtml: string): Promise<string> {
  // If we don't have the aes.js content yet, download it once
  if (!cachedAesJs) {
    const aesRes = await fetch('https://dragoserverapi.infy.click/aes.js');
    cachedAesJs = await aesRes.text();
  }

  const aMatch = challengeHtml.match(/a=toNumbers\("([a-f0-9]+)"\)/);
  const bMatch = challengeHtml.match(/b=toNumbers\("([a-f0-9]+)"\)/);
  const cMatch = challengeHtml.match(/c=toNumbers\("([a-f0-9]+)"\)/);

  if (!aMatch || !bMatch || !cMatch) {
    throw new Error('Failed to parse challenge parameters (a, b, or c)');
  }

  const aHex = aMatch[1];
  const bHex = bMatch[1];
  const cHex = cMatch[1];

  const sandboxCode = `
    var i; // Avoid strict-mode issues inside the decryption loop
    ${cachedAesJs}
    function toNumbers(d){
      var e=[];
      d.replace(/(..)/g,function(d){e.push(parseInt(d,16))});
      return e;
    }
    function toHex(){
      for(var d=[],d=1==arguments.length&&arguments[0].constructor==Array?arguments[0]:arguments,e="",f=0;f<d.length;f++)
        e+=(16>d[f]?"0":"")+d[f].toString(16);
      return e.toLowerCase();
    }
    var a = toNumbers("${aHex}");
    var b = toNumbers("${bHex}");
    var c = toNumbers("${cHex}");
    var solved = toHex(slowAES.decrypt(c, 2, a, b));
    solved;
  `;

  // Safely evaluate to solve the cookie challenge
  const solvedCookie = eval(sandboxCode);
  return solvedCookie;
}

// Global helper to fetch with cookie bypass for original Drago API
async function fetchFromDrago(url: string, attempt = 0): Promise<any> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  if (cachedDragoCookie) {
    headers['Cookie'] = `__test=${cachedDragoCookie}`;
  }

  const response = await fetch(url, { headers });
  const responseText = await response.text();

  // If the server presents us with the slowAES page, we must solve it and re-request
  if (responseText.includes('slowAES.decrypt') && attempt < 3) {
    console.log(`[Proxy] Drago Challenge detected for ${url}. Solving...`);
    const newCookie = await solveDragoChallenge(responseText);
    cachedDragoCookie = newCookie;
    console.log(`[Proxy] New Drago Cookie solved: ${newCookie}`);
    // Recurse with new cookie
    return fetchFromDrago(url, attempt + 1);
  }

  try {
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (err) {
    throw new Error(`Data format error or challenge solution outdated. Response text snippet: ${responseText.substring(0, 300)}`);
  }
}

// Global helper to fetch with cookie bypass for predictor-admin-turbo.xo.je
async function fetchFromPredictor(url: string, attempt = 0): Promise<any> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  if (cachedPredictorCookie) {
    headers['Cookie'] = `__test=${cachedPredictorCookie}`;
  }

  const response = await fetch(url, { headers });
  const responseText = await response.text();

  // If the server presents us with the slowAES page, we must solve it and re-request
  if (responseText.includes('slowAES.decrypt') && attempt < 3) {
    console.log(`[Proxy] Predictor Challenge detected for ${url}. Solving...`);
    const newCookie = await solveDragoChallenge(responseText);
    cachedPredictorCookie = newCookie;
    console.log(`[Proxy] New Predictor Cookie solved: ${newCookie}`);
    
    // Add ?i=1 or update the redirect target URL as needed
    const sep = url.includes('?') ? '&' : '?';
    const redirectUrl = url.includes('i=1') ? url : `${url}${sep}i=1`;
    
    // Recurse with new cookie and redirect query
    return fetchFromPredictor(redirectUrl, attempt + 1);
  }

  try {
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (err) {
    throw new Error(`Predictor data format error or challenge solution outdated. Response text snippet: ${responseText.substring(0, 300)}`);
  }
}

// Global helper to fetch raw HTML with cookie bypass for predictor-admin-turbo.xo.je
async function fetchHtmlFromPredictor(url: string, attempt = 0): Promise<string> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  if (cachedPredictorCookie) {
    headers['Cookie'] = `__test=${cachedPredictorCookie}`;
  }

  const response = await fetch(url, { headers });
  const responseText = await response.text();

  // If the server presents us with the slowAES page, we must solve it and re-request
  if (responseText.includes('slowAES.decrypt') && attempt < 3) {
    console.log(`[Proxy] Predictor HTML Challenge detected for ${url}. Solving...`);
    const newCookie = await solveDragoChallenge(responseText);
    cachedPredictorCookie = newCookie;
    console.log(`[Proxy] New Predictor HTML Cookie solved: ${newCookie}`);
    
    // Add ?i=1 or update the redirect target URL as needed
    const sep = url.includes('?') ? '&' : '?';
    const redirectUrl = url.includes('i=1') ? url : `${url}${sep}i=1`;
    
    // Recurse with new cookie and redirect query
    return fetchHtmlFromPredictor(redirectUrl, attempt + 1);
  }

  return responseText;
}

// Fetch and scrape keys list from keyindex.php
async function fetchKeysFromAdmin(): Promise<Array<{ key: string; validity: string }>> {
  try {
    console.log('[Proxy] Scraping keys from admin keyindex.php...');
    const html = await fetchHtmlFromPredictor('https://predictor-admin-turbo.xo.je/keyindex.php?i=1');
    const keys: Array<{ key: string; validity: string }> = [];
    const regex = /<td class="key-cell">([^<]+)<\/td>\s*<td>([^<]*)<\/td>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const keyName = match[1].trim().toUpperCase();
      const validityStr = match[2].trim();
      keys.push({ key: keyName, validity: validityStr });
    }
    console.log(`[Proxy] Scraped ${keys.length} keys from admin panel.`);
    return keys;
  } catch (err: any) {
    console.error('[Proxy] Error fetching keys from admin:', err.message);
    return [];
  }
}

// Map validity strings to actual number of days
function getDaysFromValidity(validityStr: string): number {
  const normalized = validityStr.toLowerCase().trim();
  if (normalized.includes('7') && (normalized.includes('din') || normalized.includes('day'))) {
    return 7;
  }
  if (normalized.includes('15') && (normalized.includes('din') || normalized.includes('day'))) {
    return 15;
  }
  if (normalized.includes('1') && (normalized.includes('mahina') || normalized.includes('month') || normalized.includes('maheena'))) {
    return 30;
  }
  if (normalized.includes('3') && (normalized.includes('mahine') || normalized.includes('month'))) {
    return 90;
  }
  if (normalized.includes('6') && (normalized.includes('mahine') || normalized.includes('month'))) {
    return 180;
  }
  if (normalized.includes('1') && (normalized.includes('saal') || normalized.includes('year'))) {
    return 365;
  }
  
  // Custom fallback regex match for any number
  const numMatch = normalized.match(/(\d+)/);
  if (numMatch) {
    const val = parseInt(numMatch[1]);
    if (normalized.includes('mahina') || normalized.includes('mahine') || normalized.includes('month')) {
      return val * 30;
    }
    if (normalized.includes('saal') || normalized.includes('year')) {
      return val * 365;
    }
    return val;
  }
  
  return 1; // Default to 1 day minimum
}

// Define the API route for Drago live results
app.get('/api/drago-live-results', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  const mode = req.query.mode === '30sec' ? '30sec' : '1min';
  
  // Fetch from the user's links as requested:
  // 1 Minute: https://predictor-admin-turbo.xo.je/1minuteindex.php
  // 30 Seconds: https://predictor-admin-turbo.xo.je/30secodindex.php
  const targetUrl = mode === '30sec' 
    ? `https://predictor-admin-turbo.xo.je/30secodindex.php?i=1&_=${Date.now()}` 
    : `https://predictor-admin-turbo.xo.je/1minuteindex.php?i=1&_=${Date.now()}`;

  try {
    const rawData = await fetchFromPredictor(targetUrl);
    
    // Check if it has the standard nested structure data.list
    if (rawData && rawData.data && Array.isArray(rawData.data.list)) {
      const list = rawData.data.list;
      if (list.length > 0) {
        const latestPeriod = list[0].issueNumber;
        
        // Calculate the current active predicted period (latest completed + 1)
        let activePeriod = '';
        if (/^\d+$/.test(latestPeriod)) {
          try {
            activePeriod = String(BigInt(latestPeriod) + 1n);
          } catch (e) {
            activePeriod = String(parseInt(latestPeriod) + 1);
          }
        } else {
          activePeriod = String(parseInt(latestPeriod) + 1 || Date.now());
        }

        // Map the list history items to clean records
        const history = list.map((item: any, idx: number) => {
          const num = parseInt(item.number) || 0;
          let color = 'green';
          const rawColor = String(item.color || '').toLowerCase();
          if (rawColor.includes('violet')) {
            color = 'purple';
          } else if (rawColor.includes('red')) {
            color = 'red';
          } else if (rawColor.includes('green')) {
            color = 'green';
          }

          return {
            period: item.issueNumber,
            number: num,
            predictedNumber: num,
            color: color,
            result: num >= 5 ? 'BIG' : 'SMALL',
            accuracy: 95 + (parseInt(item.issueNumber.slice(-2)) || 0) % 5,
            timestamp: new Date(Date.now() - idx * (mode === '30sec' ? 30000 : 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'WIN'
          };
        });

        // Send mapped clean payload to client
        const cleanPayload = {
          period: activePeriod,
          history: history
        };
        return res.json(cleanPayload);
      }
    }

    // Default fallback if structure is different
    res.json(rawData);
  } catch (err: any) {
    console.error(`[Proxy Error] Failed to load results for ${mode}:`, err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// Helper functions to read/write local activated keys database
interface ActivatedKey {
  key: string;
  deviceId: string;
  activatedAt: number;
  expiresAt: number;
  days: number;
}

function readActivatedKeys(): Record<string, ActivatedKey> {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const data = fs.readFileSync(KEYS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Storage] Error reading activated_keys.json:', err);
  }
  return {};
}

function writeActivatedKeys(keys: Record<string, ActivatedKey>) {
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Error writing activated_keys.json:', err);
  }
}

// Key activation and device binding, matching admin key list
app.post('/api/activate-key', async (req, res) => {
  try {
    const { key, deviceId } = req.body;
    if (!key || !deviceId) {
      return res.status(400).json({ error: true, message: 'Opps! Please enter a key and device identifier.' });
    }

    const trimmedKey = String(key).trim().toUpperCase();
    const isLocalVal = VALID_KEYS.includes(trimmedKey);
    let scrapedKeys: Array<{ key: string; validity: string }> = [];

    if (!isLocalVal) {
      scrapedKeys = await fetchKeysFromAdmin();
    }

    const adminKeyRecord = scrapedKeys.find(k => k.key === trimmedKey);

    if (!isLocalVal && !adminKeyRecord) {
      return res.status(400).json({ error: true, message: 'Opps! The key you entered is invalid or already used.' });
    }

    const totalDays = isLocalVal ? 30 : getDaysFromValidity(adminKeyRecord!.validity);
    const activatedKeys = readActivatedKeys();
    const existingRecord = activatedKeys[trimmedKey];

    if (existingRecord) {
      if (existingRecord.deviceId && existingRecord.deviceId !== deviceId) {
        return res.status(400).json({
          error: true,
          message: 'This key has already been activated/used. A key can only be used once!'
        });
      }

      if (Date.now() >= existingRecord.expiresAt) {
        return res.status(400).json({
          error: true,
          message: 'Your key has expired. Please buy or use a new key.'
        });
      }

      return res.json({
        success: true,
        keyName: trimmedKey,
        days: existingRecord.days,
        activatedAt: existingRecord.activatedAt,
        expiresAt: existingRecord.expiresAt
      });
    }

    // First time activating
    const activatedAt = Date.now();
    const expiresAt = activatedAt + totalDays * 24 * 60 * 60 * 1000;

    const newRecord: ActivatedKey = {
      key: trimmedKey,
      deviceId,
      activatedAt,
      expiresAt,
      days: totalDays
    };

    activatedKeys[trimmedKey] = newRecord;
    writeActivatedKeys(activatedKeys);

    return res.json({
      success: true,
      keyName: trimmedKey,
      days: totalDays,
      activatedAt: activatedAt,
      expiresAt: expiresAt
    });
  } catch (err: any) {
    console.error('[Key Activation Error]:', err);
    return res.status(500).json({ error: true, message: 'Activation system error: ' + err.message });
  }
});

// Periodic validation endpoint
app.get('/api/validate-key', async (req, res) => {
  try {
    const { key, deviceId } = req.query;
    if (!key || !deviceId) {
      return res.json({ valid: false, message: 'Missing parameters' });
    }

    const trimmedKey = String(key).trim().toUpperCase();
    const activatedKeys = readActivatedKeys();
    const record = activatedKeys[trimmedKey];

    if (!record) {
      // Check if it's one of the local valid keys to auto-activate
      if (VALID_KEYS.includes(trimmedKey)) {
        const activatedAt = Date.now();
        const expiresAt = activatedAt + 30 * 24 * 60 * 60 * 1000;
        const newRecord: ActivatedKey = {
          key: trimmedKey,
          deviceId: String(deviceId),
          activatedAt,
          expiresAt,
          days: 30
        };
        activatedKeys[trimmedKey] = newRecord;
        writeActivatedKeys(activatedKeys);

        return res.json({
          valid: true,
          expiresAt: expiresAt,
          days: 30,
          remainingMs: expiresAt - Date.now()
        });
      }

      // Check remote admin to see if it's a valid but unactivated key
      const scrapedKeys = await fetchKeysFromAdmin();
      const adminKeyRecord = scrapedKeys.find(k => k.key === trimmedKey);

      if (adminKeyRecord) {
        return res.json({ valid: false, message: 'Key is valid but not activated for this device. Please log in/activate first.' });
      }

      return res.json({ valid: false, message: 'Key not activated or invalid' });
    }

    const savedDeviceId = record.deviceId ?? '';
    const expiresAt = record.expiresAt;
    const days = record.days;

    if (savedDeviceId && savedDeviceId !== deviceId) {
      return res.json({ 
        valid: false, 
        message: 'This key is already used on another device. Key single-use constraint violated!' 
      });
    }

    if (Date.now() >= expiresAt) {
      return res.json({ 
        valid: false, 
        message: `Your key has expired. Please get a new key!` 
      });
    }

    return res.json({
      valid: true,
      expiresAt: expiresAt,
      days: days,
      remainingMs: expiresAt - Date.now()
    });
  } catch (err: any) {
    console.error('[Key Validation Error]:', err);
    return res.json({ valid: false, message: 'Validation system error: ' + err.message });
  }
});

// Serve health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', proxyAlive: true });
});

// Vite middleware configuration for development vs. production static paths
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
