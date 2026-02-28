import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Bitcoin, ArrowLeft, Search, ChevronDown, X } from "lucide-react";

// â”€â”€â”€ All Banks in Africa (54 countries) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AFRICAN_BANKS = [
    // â”€â”€ Nigeria â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Access Bank (Nigeria)", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank (Nigeria)",
    "First Bank of Nigeria", "First City Monument Bank (FCMB)", "Globus Bank", "Guaranty Trust Bank (GTBank)",
    "Heritage Bank (Nigeria)", "Jaiz Bank", "Keystone Bank", "Kuda Bank", "Lotus Bank",
    "Moniepoint MFB", "Opay (Nigeria)", "PalmPay", "Parallex Bank", "Polaris Bank",
    "Premium Trust Bank (Nigeria)", "Providus Bank", "Stanbic IBTC Bank (Nigeria)", "Standard Chartered Nigeria",
    "Sterling Bank", "SunTrust Bank", "TAJBank", "Titan Trust Bank",
    "Union Bank of Nigeria", "United Bank for Africa (UBA)", "Unity Bank (Nigeria)",
    "VFD Microfinance Bank", "Wema Bank", "Zenith Bank",

    // â”€â”€ Ghana â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Ghana", "Access Bank Ghana", "Agricultural Development Bank (ADB) Ghana",
    "CalBank", "Consolidated Bank Ghana", "Ecobank Ghana", "FBNBank Ghana",
    "Fidelity Bank Ghana", "First Atlantic Bank Ghana", "First National Bank Ghana",
    "GCB Bank", "Guaranty Trust Bank Ghana", "National Investment Bank Ghana",
    "OmniBSIC Bank Ghana", "Prudential Bank Ghana", "Republic Bank Ghana",
    "Stanbic Bank Ghana", "Standard Chartered Bank Ghana", "Universal Merchant Bank Ghana",
    "Zenith Bank Ghana",

    // â”€â”€ Kenya â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Kenya", "Bank of Africa Kenya", "Barclays Bank Kenya", "CFC Stanbic Bank Kenya",
    "Chase Bank Kenya", "Citibank Kenya", "Co-operative Bank of Kenya",
    "Commercial Bank of Africa (CBA)", "Consolidated Bank Kenya", "Credit Bank Kenya",
    "Diamond Trust Bank Kenya", "DIB Bank Kenya", "Ecobank Kenya",
    "Equity Bank Kenya", "Family Bank Kenya", "First Community Bank Kenya",
    "Guaranty Trust Bank Kenya", "Gulf African Bank", "Housing Finance Bank Kenya",
    "I&M Bank Kenya", "KCB Bank Kenya", "Mayfair CIB Bank Kenya",
    "M-Pesa (Safaricom)", "Middle East Bank Kenya", "National Bank of Kenya",
    "NIC Bank Kenya", "Oriental Commercial Bank Kenya", "Paramount Bank Kenya",
    "Prime Bank Kenya", "Sidian Bank", "Spire Bank Kenya", "Standard Chartered Kenya",
    "Trans National Bank Kenya", "UBA Kenya", "Victoria Commercial Bank Kenya",

    // â”€â”€ South Africa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank South Africa", "African Bank", "Bidvest Bank", "Capitec Bank",
    "Discovery Bank", "FNB (First National Bank) South Africa", "Grindrod Bank",
    "Investec Bank South Africa", "Mercantile Bank", "Nedbank", "Sasfin Bank",
    "Standard Bank South Africa", "TymeBank", "Ubank",

    // â”€â”€ Ethiopia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Abyssinia Bank", "Addis International Bank", "Awash International Bank",
    "Bank of Abyssinia", "Berhan Bank", "Commercial Bank of Ethiopia",
    "Cooperative Bank of Oromia", "Dashen Bank", "Development Bank of Ethiopia",
    "Enat Bank", "Global Bank Ethiopia", "Hibret Bank", "Lion International Bank",
    "Nib International Bank", "Oromia Bank", "Shabelle Bank", "Tsedey Bank",
    "United Bank Ethiopia", "Wegagen Bank", "Zemen Bank",

    // â”€â”€ Tanzania â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Tanzania", "Access Bank Tanzania", "Akiba Commercial Bank Tanzania",
    "Azania Bank", "Bancabc Tanzania", "Bank of Africa Tanzania", "Bank of Baroda Tanzania",
    "CRDB Bank", "DCB Commercial Bank", "Ecobank Tanzania", "Equity Bank Tanzania",
    "Exim Bank Tanzania", "I&M Bank Tanzania", "KCB Bank Tanzania",
    "Maendeleo Bank Tanzania", "NBC Bank Tanzania", "NMB Bank Tanzania",
    "Stanbic Bank Tanzania", "Standard Chartered Tanzania", "TIB Development Bank",
    "UBA Tanzania", "Uchumi Commercial Bank", "M-Pesa Tanzania",

    // â”€â”€ Uganda â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Uganda", "Bank of Africa Uganda", "Bank of Baroda Uganda",
    "Cairo Bank Uganda", "DFCU Bank", "Diamond Trust Bank Uganda", "Ecobank Uganda",
    "Equity Bank Uganda", "Finance Trust Bank Uganda", "Guaranty Trust Bank Uganda",
    "Housing Finance Bank Uganda", "I&M Bank Uganda", "KCB Bank Uganda",
    "NC Bank Uganda", "PostBank Uganda", "Pride Microfinance Uganda",
    "Solar Bank Uganda", "Stanbic Bank Uganda", "Standard Chartered Uganda",
    "Tropical Bank Uganda", "UBA Uganda",

    // â”€â”€ Rwanda â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Access Bank Rwanda", "Abyssinia Bank Rwanda", "Bank of Africa Rwanda",
    "Bank of Kigali", "BPR Atlas Mara Rwanda", "COGEBANQUE", "Ecobank Rwanda",
    "Equity Bank Rwanda", "Guaranty Trust Bank Rwanda", "I&M Bank Rwanda",
    "KCB Bank Rwanda", "Millennium Business Bank Rwanda", "Ncba Bank Rwanda",
    "SFB Rwanda", "UBA Rwanda", "Urwego Bank Rwanda",

    // â”€â”€ Cameroon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Afriland First Bank Cameroon", "BGFI Bank Cameroon", "BICEC Cameroon",
    "Commercial Bank of Cameroon (CBC)", "Ecobank Cameroon", "NFC Bank Cameroon",
    "SCB Cameroon", "SociÃ©tÃ© GÃ©nÃ©rale Cameroon", "Standard Chartered Cameroon",
    "UBA Cameroon", "Union Bank of Cameroon",

    // â”€â”€ Senegal / West Africa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Banque de l'Habitat du SÃ©nÃ©gal", "BICIS Senegal", "BIS Banque",
    "BNDE Senegal", "Caisse d'Epargne SÃ©nÃ©gal", "Coris Bank Senegal",
    "Ecobank Senegal", "Orabank Senegal", "SociÃ©tÃ© GÃ©nÃ©rale Senegal", "UBA Senegal",

    // â”€â”€ CÃ´te d'Ivoire â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Banque Atlantique CÃ´te d'Ivoire", "BIAO-CI", "BICICI CÃ´te d'Ivoire",
    "Bridge Bank CÃ´te d'Ivoire", "Coris Bank CÃ´te d'Ivoire", "Ecobank CÃ´te d'Ivoire",
    "Nsia Banque", "Orabank CÃ´te d'Ivoire", "SociÃ©tÃ© GÃ©nÃ©rale CÃ´te d'Ivoire",
    "Standard Chartered CÃ´te d'Ivoire", "UBA CÃ´te d'Ivoire",

    // â”€â”€ Zambia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Zambia", "Access Bank Zambia", "Atlas Mara Bank Zambia",
    "Bank of China Zambia", "Citibank Zambia", "Direct Pay Online Zambia",
    "Ecobank Zambia", "FNB Zambia", "Indo Zambia Bank", "Investrust Bank",
    "Izwe Savings & Loans", "Standard Chartered Zambia", "Stanbic Bank Zambia",
    "UBA Zambia", "Zanaco Bank",

    // â”€â”€ Zimbabwe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Agribank Zimbabwe", "BancABC Zimbabwe", "CBZ Bank", "Ecobank Zimbabwe",
    "FBC Bank Zimbabwe", "First Capital Bank Zimbabwe", "Metbank Zimbabwe",
    "POSB Zimbabwe", "Stanbic Bank Zimbabwe", "Standard Chartered Zimbabwe",
    "Steward Bank Zimbabwe", "ZB Bank",

    // â”€â”€ Mozambique â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Mozambique", "Access Bank Mozambique", "BCI Mozambique",
    "BIM Mozambique", "Ecobank Mozambique", "FNB Mozambique",
    "Moza Banco", "Standard Bank Mozambique", "Standard Chartered Mozambique",
    "Socremo Banco", "UBA Mozambique",

    // â”€â”€ Angola â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "BAI (Banco Angolano de Investimentos)", "Banco BIC Angola", "Banco de Fomento Angola",
    "Banco EconÃ³mico Angola", "Banco Sol Angola", "BDA Angola", "BFA Angola",
    "Millennium AtlÃ¢ntico Angola", "Standard Bank Angola",

    // â”€â”€ DR Congo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Advans Bank DRC", "Bank of Africa DRC", "BCDC Congo", "Equity BCDC",
    "Ecobank DRC", "FBNBank DRC", "Rawbank", "TMB Congo", "Trust Merchant Bank",
    "UBA Congo",

    // â”€â”€ Egypt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Arab African International Bank Egypt", "Arab Bank Egypt",
    "Banque du Caire", "Banque Misr", "Bank of Alexandria",
    "BLOM Bank Egypt", "CIB Egypt (Commercial International Bank)",
    "CrÃ©dit Agricole Egypt", "Egyptian Arab Land Bank", "Faisal Islamic Bank Egypt",
    "HSBC Egypt", "Mashreq Bank Egypt", "National Bank of Egypt",
    "QNB Al Ahli", "SociÃ©tÃ© Arabie Saoudite de Banque (SABB) Egypt",

    // â”€â”€ Morocco â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Al Barid Bank Morocco", "Arab Bank Morocco", "BMCE Bank of Africa",
    "BMCI Morocco", "Banque Centrale Populaire (BCP)", "Banque Marocaine du Commerce ExtÃ©rieur",
    "CFG Bank Morocco", "CIH Bank Morocco", "CrÃ©dit Agricole du Maroc",
    "CrÃ©dit du Maroc", "SociÃ©tÃ© GÃ©nÃ©rale Morocco", "Wafabank",

    // â”€â”€ Tunisia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Amen Bank", "Arab Tunisian Bank", "Attijari Bank Tunisia",
    "BIAT Tunisia", "Banque de l'Habitat Tunisia", "BNA Tunisia",
    "BT Tunisia", "Ooredoo Tunisia Mobile Money", "STB Bank Tunisia", "UIB Tunisia",

    // â”€â”€ Botswana â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Botswana", "African Banking Corporation Botswana",
    "Bank Gaborone", "Bank of Baroda Botswana", "First National Bank Botswana",
    "Stanbic Bank Botswana", "Standard Chartered Botswana", "State Bank India Botswana",

    // â”€â”€ Namibia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Namibia", "Bank Windhoek", "FNB Namibia",
    "Nedbank Namibia", "Standard Bank Namibia",

    // â”€â”€ Malawi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "CDH Investment Bank", "FDH Bank Malawi", "First Capital Bank Malawi",
    "Malawi Savings Bank", "National Bank of Malawi", "NBS Bank Malawi",
    "Opportunity International Bank Malawi", "Standard Bank Malawi",

    // â”€â”€ Mauritius â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Mauritius", "Bank One Mauritius", "BCP Bank Mauritius",
    "Investec Bank Mauritius", "MCB Group Mauritius", "MauBank",
    "SBI Mauritius", "Standard Bank Mauritius", "Standard Chartered Mauritius",

    // â”€â”€ Madagascar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "AccÃ¨sBanque Madagascar", "Bank of Africa Madagascar", "BFV-SociÃ©tÃ© GÃ©nÃ©rale Madagascar",
    "BNI Madagascar", "BOA Madagascar", "BM Madagascar", "MCB Madagascar",

    // â”€â”€ Sudan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Agricultural Bank of Sudan", "Bank of Khartoum", "Blue Nile Mashriq Bank",
    "El Nilein Bank", "Faisal Islamic Bank Sudan", "Omdurman National Bank",
    "Sudan Commercial Bank",

    // â”€â”€ Somalia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Dahabshiil Bank", "Hormuud Telecom (EVC Plus)", "Premier Bank Somalia",
    "Salaam Somali Bank",

    // â”€â”€ Eswatini â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Eswatini Bank", "FNB Eswatini", "Nedbank Eswatini", "Standard Bank Eswatini",

    // â”€â”€ Lesotho â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Absa Bank Lesotho", "FNB Lesotho", "Lesotho PostBank", "Nedbank Lesotho",
    "Standard Lesotho Bank",

    // â”€â”€ Other / Pan-African â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    "Ecobank Pan-Africa", "UBA Pan-Africa", "Access Bank Pan-Africa",
    "Stanbic / Standard Bank Pan-Africa", "SociÃ©tÃ© GÃ©nÃ©rale Pan-Africa",
    "Guaranty Trust Bank Pan-Africa",
].sort();


const CRYPTO_OPTIONS = [
    { value: "USDT_TRC20", label: "USDT (TRC20 â€” Tron)", network: "Tron Network" },
    { value: "USDT_ERC20", label: "USDT (ERC20 â€” Ethereum)", network: "Ethereum Network" },
    { value: "BTC", label: "Bitcoin (BTC)", network: "Bitcoin Network" },
    { value: "ETH", label: "Ethereum (ETH)", network: "Ethereum Network" },
    { value: "BNB", label: "BNB (BEP20)", network: "BSC Network" },
    { value: "USDC_ERC20", label: "USDC (ERC20)", network: "Ethereum Network" },
];

interface PayoutAccountFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    editAccount?: any;
}

// â”€â”€â”€ Searchable Bank Selector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function BankSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = NIGERIAN_BANKS.filter(b =>
        b.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className={value ? "text-foreground" : "text-muted-foreground"}>
                    {value || "Select your bank"}
                </span>
                <div className="flex items-center gap-1">
                    {value && (
                        <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); onChange(""); setSearch(""); }}
                            className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                        >
                            <X className="h-3.5 w-3.5" />
                        </span>
                    )}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                    {/* Search */}
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                            autoFocus
                            placeholder="Search banks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    {/* List */}
                    <div className="max-h-60 overflow-y-auto overscroll-contain">
                        {filtered.length === 0 ? (
                            <p className="px-3 py-4 text-center text-sm text-muted-foreground">No banks found</p>
                        ) : (
                            filtered.map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => { onChange(b); setOpen(false); setSearch(""); }}
                                    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${value === b ? "bg-accent text-accent-foreground font-medium" : ""}`}
                                >
                                    {b}
                                </button>
                            ))
                        )}
                    </div>
                    <div className="border-t px-3 py-1.5 text-[10px] text-muted-foreground text-center">
                        {filtered.length} of {NIGERIAN_BANKS.length} banks
                    </div>
                </div>
            )}
        </div>
    );
}

export function PayoutAccountForm({ onSuccess, onCancel, editAccount }: PayoutAccountFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<"bank" | "crypto">(editAccount?.payout_type || "bank");

    const [bank, setBank] = useState({
        bank_name: editAccount?.bank_name || "",
        account_number: editAccount?.account_number || "",
        account_name: editAccount?.account_name || "",
    });
    const [crypto, setCrypto] = useState({
        crypto_currency: editAccount?.crypto_currency || "",
        wallet_address: editAccount?.wallet_address || "",
        network: editAccount?.network || "",
    });

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        const basePayload = {
            user_id: user.id,
            payout_type: tab,
            updated_at: new Date().toISOString(),
        };

        if (tab === "bank") {
            if (!bank.bank_name || !bank.account_number || !bank.account_name) {
                toast({ title: "Please fill all bank fields", variant: "destructive" });
                setLoading(false);
                return;
            }
            Object.assign(basePayload, bank);
        } else {
            if (!crypto.crypto_currency || !crypto.wallet_address) {
                toast({ title: "Please fill all crypto fields", variant: "destructive" });
                setLoading(false);
                return;
            }
            const selected = CRYPTO_OPTIONS.find(c => c.value === crypto.crypto_currency);
            Object.assign(basePayload, { ...crypto, network: selected?.network || "" });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = basePayload as any;

        let error;
        if (editAccount) {
            ({ error } = await supabase.from("payout_accounts").update(payload).eq("id", editAccount.id));
        } else {
            ({ error } = await supabase.from("payout_accounts").insert(payload));
        }

        if (error) {
            toast({ title: "Failed to save", description: error.message, variant: "destructive" });
        } else {
            toast({ title: editAccount ? "Account updated!" : "Account added!" });
            onSuccess();
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle>{editAccount ? "Edit Payout Account" : "Add Payout Account"}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Tab switcher */}
                <div className="flex gap-2 rounded-lg border p-1 bg-muted/30">
                    <button
                        type="button"
                        onClick={() => setTab("bank")}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${tab === "bank" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Building2 className="h-4 w-4" /> Bank Account
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("crypto")}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${tab === "crypto" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Bitcoin className="h-4 w-4" /> Crypto Wallet
                    </button>
                </div>

                {tab === "bank" ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <BankSelector
                                value={bank.bank_name}
                                onChange={(v) => setBank({ ...bank, bank_name: v })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input
                                placeholder="0123456789"
                                value={bank.account_number}
                                onChange={(e) => setBank({ ...bank, account_number: e.target.value.replace(/\D/g, "") })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Name</Label>
                            <Input
                                placeholder="JOHN DOE"
                                value={bank.account_name}
                                onChange={(e) => setBank({ ...bank, account_name: e.target.value.toUpperCase() })}
                            />
                            <p className="text-xs text-muted-foreground">As it appears on your bank statement</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cryptocurrency</Label>
                            <Select value={crypto.crypto_currency} onValueChange={(v) => setCrypto({ ...crypto, crypto_currency: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select cryptocurrency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CRYPTO_OPTIONS.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Wallet Address</Label>
                            <Input
                                placeholder="Your wallet address..."
                                value={crypto.wallet_address}
                                onChange={(e) => setCrypto({ ...crypto, wallet_address: e.target.value })}
                                className="font-mono text-sm"
                            />
                        </div>
                        {crypto.crypto_currency && (
                            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                Network: <strong>{CRYPTO_OPTIONS.find(c => c.value === crypto.crypto_currency)?.network}</strong>
                                <br />Make sure you send only {crypto.crypto_currency} on this network to avoid loss of funds.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
                    <Button className="flex-1 gradient-hero border-0" onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editAccount ? "Update Account" : "Save Account"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
