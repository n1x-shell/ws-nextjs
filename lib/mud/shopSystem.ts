// lib/mud/shopSystem.ts
// TUNNELCORE MUD — Shop System
// Buy/sell items with COOL-modified prices and disposition scaling.

import type { MudCharacter, Item } from './types';
import { getDispositionLabel, getPriceModifier } from './types';
import { getItemTemplate, createItem, MARA_SHOP, COLE_SHOP, KETCH_SHOP, FEX_SHOP, OSKA_SHOP, KAI_SHOP, CACHE_SHOP, SALVAGE_SHOP, OYUNN_SHOP, RADE_SHOP, COSTA_SHOP, PEE_SHOP, SIXER_SHOP, DEVI_SHOP, MAE_SHOP, CUTTER_SHOP, ACRE_SHOP, SPIT_SHOP, PATCH_SHOP, NEEDLE_SHOP, RADE_OFFICE_SHOP } from './items';
import type { ShopItem } from './items';
import { getNPCRelation } from './persistence';

// ── Shop Registry ───────────────────────────────────────────────────────────

export function getShopInventory(npcId: string): ShopItem[] | null {
  switch (npcId) {
    case 'mara': return MARA_SHOP;
    case 'cole': return COLE_SHOP;
    case 'ketch': return KETCH_SHOP;
    case 'fex': return FEX_SHOP;
    case 'oska': return OSKA_SHOP;
    case 'kai': return KAI_SHOP;
    case 'cache': return CACHE_SHOP;
    case 'salvage_workers': return SALVAGE_SHOP;
    case 'oyunn': return OYUNN_SHOP;
    case 'rade': return RADE_SHOP;
    case 'dr_costa': return COSTA_SHOP;
    case 'pee_okoro': return PEE_SHOP;
    case 'sixer': return SIXER_SHOP;
    case 'devi': return DEVI_SHOP;
    case 'mae': return MAE_SHOP;
    case 'cutter': return CUTTER_SHOP;
    case 'acre': return ACRE_SHOP;
    case 'spit': return SPIT_SHOP;
    case 'patch': return PATCH_SHOP;
    case 'needle': return NEEDLE_SHOP;
    default: return null;
  }
}

export function getShopkeeperName(npcId: string): string {
  switch (npcId) {
    case 'mara': return 'Mara';
    case 'cole': return 'Cole';
    case 'ketch': return 'Ketch';
    case 'fex': return 'Fex';
    case 'oska': return 'Oska';
    case 'kai': return 'Kai';
    case 'cache': return 'Scavenger Cache';
    case 'salvage_workers': return 'Salvage Yard';
    case 'oyunn': return 'Oyunn';
    case 'rade': return 'Rade';
    case 'dr_costa': return 'Dr. Costa';
    case 'pee_okoro': return 'Pee Okoro';
    case 'sixer': return 'Sixer';
    case 'devi': return 'Devi';
    case 'mae': return 'Mae';
    case 'cutter': return 'Cutter';
    case 'acre': return 'Acre';
    case 'spit': return 'Spit';
    case 'patch': return 'Patch';
    case 'needle': return 'Needle';
    default: return npcId;
  }
}

// ── Price Calculation ───────────────────────────────────────────────────────
// Base price × disposition modifier × COOL discount

function coolDiscount(cool: number): number {
  // 2% discount per COOL point above 3
  return Math.max(0.7, 1 - (Math.max(0, cool - 3) * 0.02));
}

export function getBuyPrice(
  templateId: string, npcId: string, character: MudCharacter,
): number | null {
  const template = getItemTemplate(templateId);
  if (!template || !template.buyPrice) return null;

  const relation = getNPCRelation(character.handle, npcId);
  const disposition = relation?.disposition ?? 0;
  const label = getDispositionLabel(disposition);
  const dispMod = getPriceModifier(label);

  if (dispMod >= 999) return null; // Won't sell

  const price = Math.ceil(template.buyPrice * dispMod * coolDiscount(character.attributes.COOL));
  return Math.max(1, price);
}

export function getSellPrice(
  item: Item, npcId: string, character: MudCharacter,
): number {
  const base = item.sellPrice ?? Math.floor((item.buyPrice ?? 1) / 3);
  // Selling price slightly improved by COOL but not by disposition
  const mod = coolDiscount(character.attributes.COOL);
  return Math.max(1, Math.ceil(base * (2 - mod))); // Inverse — higher COOL = better sell
}

// ── Buy ─────────────────────────────────────────────────────────────────────

export function buyItem(
  character: MudCharacter, npcId: string, templateId: string,
): { success: boolean; error?: string; item?: Item; price?: number } {
  const price = getBuyPrice(templateId, npcId, character);
  if (price === null) return { success: false, error: 'that item isn\'t for sale' };

  if (character.currency.creds < price) {
    return { success: false, error: `not enough creds (need ${price}, have ${character.currency.creds})` };
  }

  const item = createItem(templateId);
  if (!item) return { success: false, error: 'item not found' };

  // Check if stackable and already in inventory
  if (item.stackable) {
    const existing = character.inventory.find(i => i.id === templateId);
    if (existing) {
      existing.quantity += 1;
      character.currency.creds -= price;
      return { success: true, item: existing, price };
    }
  }

  character.inventory.push(item);
  character.currency.creds -= price;
  return { success: true, item, price };
}

// ── Sell ─────────────────────────────────────────────────────────────────────

export function sellItem(
  character: MudCharacter, npcId: string, itemIndex: number,
): { success: boolean; error?: string; itemName?: string; price?: number } {
  const item = character.inventory[itemIndex];
  if (!item) return { success: false, error: 'no item at that index' };
  if (item.questItem) return { success: false, error: 'can\'t sell quest items' };

  const price = getSellPrice(item, npcId, character);

  if (item.stackable && item.quantity > 1) {
    item.quantity -= 1;
  } else {
    character.inventory.splice(itemIndex, 1);
  }

  character.currency.creds += price;
  return { success: true, itemName: item.name, price };
}

// ── List formatted shop inventory ───────────────────────────────────────────

export interface ShopListing {
  templateId: string;
  name: string;
  description: string;
  price: number | null;
  stock: number;
  category: string;
}

export function getFormattedShop(
  npcId: string, character: MudCharacter,
): ShopListing[] | null {
  const inventory = getShopInventory(npcId);
  if (!inventory) return null;

  return inventory.map(si => {
    const template = getItemTemplate(si.templateId);
    if (!template) return null;
    return {
      templateId: si.templateId,
      name: template.name,
      description: template.description,
      price: getBuyPrice(si.templateId, npcId, character),
      stock: si.stock,
      category: template.category,
    };
  }).filter(Boolean) as ShopListing[];
}
