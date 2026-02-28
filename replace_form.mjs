import fs from 'fs';

const file = 'c:/Users/JOSHUA/Downloads/secure-deal-nigeria-main/secure-deal-nigeria-main/src/components/account/PayoutAccountForm.tsx';
let content = fs.readFileSync(file, 'utf8');

const NIGERIAN_BANKS = `// ─── Nigerian Banks ──────────────────────────────────────────
const NIGERIAN_BANKS = [
    "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank",
    "First Bank of Nigeria", "First City Monument Bank (FCMB)", "Globus Bank", "Guaranty Trust Bank (GTBank)",
    "Heritage Bank", "Jaiz Bank", "Keystone Bank", "Kuda Bank", "Lotus Bank",
    "Moniepoint MFB", "Opay", "PalmPay", "Parallex Bank", "Polaris Bank",
    "Premium Trust Bank", "Providus Bank", "Stanbic IBTC Bank", "Standard Chartered Nigeria",
    "Sterling Bank", "SunTrust Bank", "TAJBank", "Titan Trust Bank",
    "Union Bank of Nigeria", "United Bank for Africa (UBA)", "Unity Bank (Nigeria)",
    "VFD Microfinance Bank", "Wema Bank", "Zenith Bank",
].sort();`;

let lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('// ─── All Banks in Africa (54 countries)'));
const endIdx = lines.findIndex(l => l.includes('].sort();'));

if (startIdx !== -1 && endIdx !== -1) {
    lines.splice(startIdx, endIdx - startIdx + 1, NIGERIAN_BANKS);
    let newContent = lines.join('\n');
    newContent = newContent.replace(/AFRICAN_BANKS/g, 'NIGERIAN_BANKS');
    fs.writeFileSync(file, newContent);
    console.log('Successfully updated PayoutAccountForm.tsx');
} else {
    console.log('Could not find indices', startIdx, endIdx);
}
