export const PRODUCT_TYPES = {
  physical_product: { label: "Physical Product", icon: "Package", description: "Goods that require shipping" },
  digital_product: { label: "Digital Product", icon: "Download", description: "Software, files, or digital assets" },
  service: { label: "Service", icon: "Briefcase", description: "Work or tasks performed" },
} as const;

export const TRANSACTION_STATUSES = {
  pending_payment: { label: "Pending Payment", color: "warning", description: "Awaiting buyer payment" },
  seller_joined: { label: "Seller Joined", color: "primary", description: "Seller has joined via invite link" },
  held: { label: "Funds Held", color: "primary", description: "Payment received and secured" },
  pending_delivery: { label: "Pending Delivery", color: "secondary", description: "Seller to deliver product/service" },
  pending_confirmation: { label: "Pending Confirmation", color: "accent", description: "Buyer to confirm receipt" },
  pending_release: { label: "Pending Release", color: "success", description: "Admin to release funds" },
  released: { label: "Released", color: "success", description: "Funds released to seller" },
  disputed: { label: "Disputed", color: "destructive", description: "Under dispute resolution" },
  refund_requested: { label: "Refund Requested", color: "destructive", description: "Buyer has requested a refund" },
  cancelled: { label: "Cancelled", color: "muted", description: "Transaction cancelled" },
  expired: { label: "Expired", color: "muted", description: "Invite link expired" },
} as const;

export type ProductType = keyof typeof PRODUCT_TYPES;
export type TransactionStatus = keyof typeof TRANSACTION_STATUSES;

export const ADMIN_EMAIL = "ogwujude872@gmail.com";

export const CRYPTO_WALLETS = {
  usdt_trc20: {
    label: "USDT (TRC20)",
    network: "Tron Network",
    address: "jhkkugfgkjugfrsrgwwoiomjuyxjjm",
    icon: "💲",
  },
  usdt_erc20: {
    label: "USDT (ERC20)",
    network: "Ethereum Network",
    address: "gjhkhgfghjqougywtrfgnxpxnbnw,qkyh",
    icon: "💲",
  },
  btc: {
    label: "Bitcoin (BTC)",
    network: "Bitcoin Network",
    address: "thgkjjkmlsjmbvwywooeidmdpphje",
    icon: "₿",
  },
  eth: {
    label: "Ethereum (ETH)",
    network: "Ethereum Network",
    address: "jhkygtdtrderfghjmoiutuyteyrwqsxcbj",
    icon: "⟠",
  },
} as const;

export type CryptoWalletKey = keyof typeof CRYPTO_WALLETS;
