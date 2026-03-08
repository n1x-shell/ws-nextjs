// lib/mud/sellModal.tsx
// TUNNELCORE MUD — Batch Sell Modal
// Modal with quantity selectors for all sellable inventory.
// Triggered by /sell when multiple sellable items exist.
// After confirm: single transient message summarizing the sale.

import React, { useState, useMemo, useCallback } from 'react';
import type { Item } from './types';
import SubstrateBackground from './substrateBackground';
import { eventBus } from '@/lib/eventBus';

// ── Types ──────────────────────────────────────────────────────────────────

export interface SellModalData {
  inventory: Item[];
  shopkeeperId: string;
  shopkeeperName: string;
  currentCreds: number;
}

export interface SellModalResult {
  items: Array<{ item: Item; qty: number }>;
  totalValue: number;
}

// ── Style constants ────────────────────────────────────────────────────────

const C = {
  accent:  'var(--phosphor-accent)',
  dim:     'rgba(var(--phosphor-rgb),0.55)',
  dimmer:  'rgba(var(--phosphor-rgb),0.35)',
  faint:   'rgba(var(--phosphor-rgb),0.2)',
  shop:    '#fcd34d',
  heal:    '#4ade80',
};

const TIER_COLORS: Record<string, string> = {
  SCRAP: 'rgba(var(--phosphor-rgb),0.45)',
  COMMON: '#d4d4d4',
  MIL_SPEC: '#60a5fa',
  HELIXION: '#a78bfa',
  PROTOTYPE: '#fbbf24',
};

// ── Component ──────────────────────────────────────────────────────────────

export function SellModal({ data, onClose, onConfirm }: {
  data: SellModalData;
  onClose: () => void;
  onConfirm: (result: SellModalResult) => void;
}) {
  const sellable = useMemo(() =>
    data.inventory.filter(i => !i.questItem && !i.loreItem && (i.sellPrice ?? 0) > 0),
    [data.inventory]
  );

  // qty state: item id → qty to sell
  const [qtys, setQtys] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    sellable.forEach(i => { init[i.id] = 0; });
    return init;
  });

  const setQty = useCallback((id: string, qty: number) => {
    setQtys(prev => ({ ...prev, [id]: qty }));
  }, []);

  const totalItems = useMemo(() =>
    Object.values(qtys).reduce((s, q) => s + q, 0),
    [qtys]
  );

  const totalValue = useMemo(() =>
    sellable.reduce((s, item) => s + (qtys[item.id] ?? 0) * (item.sellPrice ?? 0), 0),
    [sellable, qtys]
  );

  const handleSellAll = () => {
    const next: Record<string, number> = {};
    sellable.forEach(i => { next[i.id] = i.quantity; });
    setQtys(next);
  };

  const handleClear = () => {
    const next: Record<string, number> = {};
    sellable.forEach(i => { next[i.id] = 0; });
    setQtys(next);
  };

  const handleConfirm = () => {
    const items = sellable
      .filter(i => (qtys[i.id] ?? 0) > 0)
      .map(i => ({ item: i, qty: qtys[i.id] }));
    if (items.length === 0) return;
    onConfirm({ items, totalValue });
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(2,3,8,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0.5rem',
        animation: 'mud-fade-in 0.3s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 440, maxHeight: '85vh',
        background: 'rgba(10,10,10,0.75)',
        border: `1px solid rgba(252,211,77,0.2)`,
        borderRadius: 4, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 30px rgba(252,211,77,0.06)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          padding: '0.5rem 0.8rem',
          borderBottom: '1px solid rgba(252,211,77,0.15)',
          background: 'rgba(252,211,77,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: C.shop, letterSpacing: '0.06em',
            textShadow: '0 0 8px rgba(252,211,77,0.3)',
          }}>SELL TO {data.shopkeeperName.toUpperCase()}</span>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: C.shop,
          }}>{data.currentCreds}{'\u00a2'}</span>
        </div>

        {/* Item list */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '0.3rem 0.5rem',
          overscrollBehavior: 'contain',
        }}>
          {sellable.length === 0 ? (
            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: C.dimmer, textAlign: 'center', padding: '2rem 0',
              fontStyle: 'italic',
            }}>nothing to sell</div>
          ) : (
            sellable.map(item => {
              const qty = qtys[item.id] ?? 0;
              const price = item.sellPrice ?? 0;
              const tierColor = TIER_COLORS[item.tier] ?? C.dim;
              const lineTotal = qty * price;

              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.35rem 0.3rem',
                  borderBottom: '1px solid rgba(var(--phosphor-rgb),0.06)',
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                }}>
                  {/* Item name + tier */}
                  <div style={{
                    flex: 1, minWidth: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    <span style={{ color: tierColor }}>{item.name}</span>
                    {item.quantity > 1 && (
                      <span style={{ color: C.dimmer, marginLeft: '0.4ch' }}>
                        ({item.quantity})
                      </span>
                    )}
                  </div>

                  {/* Price per unit */}
                  <span style={{
                    color: C.dimmer, flexShrink: 0, width: '4ch', textAlign: 'right',
                  }}>
                    {price}{'\u00a2'}
                  </span>

                  {/* Quantity selector */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 0,
                    flexShrink: 0,
                  }}>
                    <button
                      className="mud-btn"
                      disabled={qty <= 0}
                      onClick={() => setQty(item.id, Math.max(0, qty - 1))}
                      style={{
                        fontFamily: 'monospace', fontSize: 'var(--text-base)',
                        width: 24, height: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent',
                        border: `1px solid ${qty > 0 ? 'rgba(252,211,77,0.3)' : 'rgba(var(--phosphor-rgb),0.1)'}`,
                        color: qty > 0 ? C.shop : C.faint,
                        cursor: qty > 0 ? 'pointer' : 'default',
                        borderRadius: '2px 0 0 2px',
                        padding: 0, touchAction: 'manipulation',
                      }}
                    >{'\u2212'}</button>
                    <div style={{
                      width: 28, height: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: qty > 0 ? 'rgba(252,211,77,0.08)' : 'transparent',
                      borderTop: `1px solid ${qty > 0 ? 'rgba(252,211,77,0.3)' : 'rgba(var(--phosphor-rgb),0.1)'}`,
                      borderBottom: `1px solid ${qty > 0 ? 'rgba(252,211,77,0.3)' : 'rgba(var(--phosphor-rgb),0.1)'}`,
                      color: qty > 0 ? C.shop : C.dimmer,
                      fontFamily: 'monospace', fontSize: 'var(--text-base)',
                      fontWeight: qty > 0 ? 'bold' : 'normal',
                    }}>
                      {qty}
                    </div>
                    <button
                      className="mud-btn"
                      disabled={qty >= item.quantity}
                      onClick={() => setQty(item.id, Math.min(item.quantity, qty + 1))}
                      style={{
                        fontFamily: 'monospace', fontSize: 'var(--text-base)',
                        width: 24, height: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent',
                        border: `1px solid ${qty < item.quantity ? 'rgba(252,211,77,0.3)' : 'rgba(var(--phosphor-rgb),0.1)'}`,
                        color: qty < item.quantity ? C.shop : C.faint,
                        cursor: qty < item.quantity ? 'pointer' : 'default',
                        borderRadius: '0 2px 2px 0',
                        padding: 0, touchAction: 'manipulation',
                      }}
                    >+</button>
                  </div>

                  {/* Line total */}
                  <span style={{
                    color: lineTotal > 0 ? C.heal : C.faint,
                    flexShrink: 0, width: '4.5ch', textAlign: 'right',
                    fontWeight: lineTotal > 0 ? 'bold' : 'normal',
                  }}>
                    {lineTotal > 0 ? `${lineTotal}\u00a2` : '\u2014'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer — totals + actions */}
        <div style={{
          padding: '0.5rem 0.8rem',
          borderTop: '1px solid rgba(252,211,77,0.15)',
          background: 'rgba(252,211,77,0.03)',
          flexShrink: 0,
        }}>
          {/* Total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            marginBottom: '0.5rem',
          }}>
            <span style={{ color: C.dim }}>
              {totalItems} item{totalItems !== 1 ? 's' : ''} selected
            </span>
            <span style={{
              color: totalValue > 0 ? C.heal : C.dimmer,
              fontWeight: 'bold', fontSize: totalValue > 0 ? '1.1em' : 'var(--text-base)',
              textShadow: totalValue > 0 ? '0 0 8px rgba(74,222,128,0.3)' : 'none',
            }}>
              {totalValue > 0 ? `+${totalValue}\u00a2` : '0\u00a2'}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: '0.4rem', justifyContent: 'center',
          }}>
            <button
              className="mud-btn"
              onClick={handleSellAll}
              style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: C.shop, background: 'transparent',
                border: '1px solid rgba(252,211,77,0.3)',
                padding: '0.3rem 0.8rem',
                cursor: 'pointer', borderRadius: 2,
                touchAction: 'manipulation',
              }}
            >SELL ALL</button>
            {totalItems > 0 && (
              <button
                className="mud-btn"
                onClick={handleClear}
                style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  color: C.dimmer, background: 'transparent',
                  border: '1px solid rgba(var(--phosphor-rgb),0.15)',
                  padding: '0.3rem 0.6rem',
                  cursor: 'pointer', borderRadius: 2,
                  touchAction: 'manipulation',
                }}
              >CLEAR</button>
            )}
            <button
              className="mud-btn"
              disabled={totalItems === 0}
              onClick={handleConfirm}
              style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                fontWeight: 'bold',
                color: totalItems > 0 ? '#0a0a0a' : C.faint,
                background: totalItems > 0 ? C.heal : 'transparent',
                border: `1px solid ${totalItems > 0 ? C.heal : 'rgba(var(--phosphor-rgb),0.1)'}`,
                padding: '0.3rem 1rem',
                cursor: totalItems > 0 ? 'pointer' : 'default',
                borderRadius: 2, touchAction: 'manipulation',
                boxShadow: totalItems > 0 ? '0 0 8px rgba(74,222,128,0.2)' : 'none',
              }}
            >SELL {totalItems > 0 ? `(${totalValue}\u00a2)` : ''}</button>
            <button
              className="mud-btn"
              onClick={onClose}
              style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: C.dim, background: 'transparent',
                border: '1px solid rgba(var(--phosphor-rgb),0.2)',
                padding: '0.3rem 0.8rem',
                cursor: 'pointer', borderRadius: 2,
                touchAction: 'manipulation',
              }}
            >CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  );
}
