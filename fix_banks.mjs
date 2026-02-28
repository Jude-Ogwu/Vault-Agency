import fs from 'fs';
import path from 'path';

const file = 'c:/Users/JOSHUA/Downloads/secure-deal-nigeria-main/secure-deal-nigeria-main/src/components/account/PayoutAccountForm.tsx';
let content = fs.readFileSync(file, 'utf-8');

const replacement = `// â”€â”€â”€ All Commercial Banks in Nigeria â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NIGERIAN_BANKS = [
    "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank",
    "First Bank of Nigeria", "First City Monument Bank (FCMB)", "Globus Bank", "Guaranty Trust Bank (GTBank)",
    "Heritage Bank", "Jaiz Bank", "Keystone Bank", "Kuda Bank", "Lotus Bank",
    "Moniepoint MFB", "Opay", "PalmPay", "Parallex Bank", "Polaris Bank",
    "Premium Trust Bank", "Providus Bank", "Stanbic IBTC Bank", "Standard Chartered",
    "Sterling Bank", "SunTrust Bank", "TAJBank", "Titan Trust Bank",
    "Union Bank of Nigeria", "United Bank for Africa (UBA)", "Unity Bank",
    "VFD Microfinance Bank", "Wema Bank", "Zenith Bank",
].sort();`;

// Replace everything from the comment before AFRICAN_BANKS down to ].sort();
// Regex to match from "// â”€â”€â”€ All Banks in Africa" up to "].sort();"
const regex = /\/\/\s*â”€â”€â”€ All Banks in Africa[\s\S]*?\]\.sort\(\);/;
content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('Fixed PayoutAccountForm banks!');
