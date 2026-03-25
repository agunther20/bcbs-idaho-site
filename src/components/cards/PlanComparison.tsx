import React, { useState } from 'react';

/**
 * PlanComparison — Interactive plan comparison with tier tabs,
 * expandable service categories, and visual cost highlights.
 *
 * Props:
 *   title?: string          — Section heading
 *   tiers: Tier[]           — Plan tier tabs (e.g. Gold, Silver, Bronze, Access)
 *   highlightBest?: boolean — Auto-highlight best values per row (default: true)
 *   defaultTier?: string    — Which tier tab to show first
 *
 * Tier:
 *   name: string            — Tab label (e.g. "Gold")
 *   color?: string          — Tab accent color
 *   plans: Plan[]           — Plans in this tier
 *
 * Plan:
 *   name: string            — Plan name (e.g. "Gold 2000")
 *   badge?: string          — Optional badge (e.g. "Most Popular", "HSA")
 *   summary: { deductible, moop, coinsurance, pcpCopay } — Quick stats
 *   categories: Category[]  — Expandable service groups
 *
 * Category:
 *   name: string            — e.g. "Doctor Visits", "Prescriptions"
 *   rows: { label, value }[]
 */

const getColor = (opacity: number) => `color-mix(in srgb, var(--theme-chart-line) ${opacity}%, transparent)`;

// ── Types ──

interface PlanRow {
    label: string;
    value: string;
}

interface Category {
    name: string;
    rows: PlanRow[];
}

interface PlanSummary {
    deductible: string;
    moop: string;
    coinsurance?: string;
    pcpCopay: string;
}

interface Plan {
    name: string;
    badge?: string;
    summary: PlanSummary;
    categories?: Category[];
}

interface Tier {
    name: string;
    color?: string;
    plans: Plan[];
}

interface PlanComparisonProps {
    title?: string;
    tiers: Tier[];
    highlightBest?: boolean;
    defaultTier?: string;
}

// ── Helpers ──

const DEFAULT_COLORS: Record<string, string> = {
    'Gold': '#D4A017',
    'Silver': '#8B95A2',
    'Bronze': '#CD7F32',
    'Catastrophic': '#6B7280',
    'Access': '#0072CE',
};

function parseDollar(val: string): number | null {
    const match = val.replace(/,/g, '').match(/\$(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
}

function parsePercent(val: string): number | null {
    const match = val.match(/(\d+)%/);
    return match ? parseFloat(match[1]) : null;
}

function findBestIndex(values: string[]): number | null {
    // For dollar amounts, lower is better
    const dollars = values.map(parseDollar);
    if (dollars.every(d => d !== null)) {
        const min = Math.min(...(dollars as number[]));
        return dollars.indexOf(min);
    }
    // For percentages (coinsurance), lower is better
    const percents = values.map(parsePercent);
    if (percents.every(p => p !== null)) {
        const min = Math.min(...(percents as number[]));
        return percents.indexOf(min);
    }
    return null;
}

// ── Sub-components ──

function SummaryCard({ plan, tierColor }: { plan: Plan; tierColor: string }) {
    return (
        <div className="flex-1 min-w-0 rounded-lg p-3 transition-all" style={{
            background: getColor(4),
            border: `1px solid ${getColor(8)}`,
        }}>
            <div className="flex items-center gap-2 mb-3">
                <h4 className="font-data text-sm font-bold truncate" style={{ color: getColor(92) }}>
                    {plan.name}
                </h4>
                {plan.badge && (
                    <span className="shrink-0 text-[10px] font-data font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: tierColor + '20', color: tierColor }}>
                        {plan.badge}
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <SummaryMetric label="Deductible" value={plan.summary.deductible} />
                <SummaryMetric label="MOOP" value={plan.summary.moop} />
                {plan.summary.coinsurance && <SummaryMetric label="Coinsurance" value={plan.summary.coinsurance} />}
                <SummaryMetric label="PCP Copay" value={plan.summary.pcpCopay} />
            </div>
        </div>
    );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="font-data text-[10px] uppercase tracking-wider mb-0.5" style={{ color: getColor(50) }}>
                {label}
            </div>
            <div className="font-data text-sm font-bold" style={{ color: getColor(90) }}>
                {value}
            </div>
        </div>
    );
}

function CategorySection({ category, plans, highlightBest, tierColor }: {
    category: Category;
    plans: Plan[];
    highlightBest: boolean;
    tierColor: string;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border-b" style={{ borderColor: getColor(6) }}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-2.5 px-1 transition-colors group"
                style={{ color: getColor(88) }}
            >
                <span className="font-data text-xs uppercase tracking-wider font-semibold">
                    {category.name}
                </span>
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-transform duration-200"
                    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', color: getColor(40) }}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {expanded && (
                <div className="pb-2 animate-card-enter" style={{ animationDuration: '0.2s' }}>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="font-data text-[10px] uppercase tracking-wider px-1 py-1 text-left" style={{ color: getColor(45), width: '30%' }}>
                                    Service
                                </th>
                                {plans.map((p, i) => (
                                    <th key={i} className="font-data text-[10px] uppercase tracking-wider px-1 py-1 text-left" style={{ color: tierColor }}>
                                        {p.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {category.rows.map((row, ri) => {
                                // Collect values for this row across all plans
                                const allValues = plans.map(p => {
                                    const cat = p.categories?.find(c => c.name === category.name);
                                    const planRow = cat?.rows.find(r => r.label === row.label);
                                    return planRow?.value ?? '—';
                                });
                                const bestIdx = highlightBest ? findBestIndex(allValues) : null;

                                return (
                                    <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? 'transparent' : getColor(2) }}>
                                        <td className="font-voice text-xs px-1 py-1.5" style={{ color: getColor(70) }}>
                                            {row.label}
                                        </td>
                                        {allValues.map((val, ci) => (
                                            <td key={ci} className="font-data text-xs px-1 py-1.5 font-semibold" style={{
                                                color: ci === bestIdx ? tierColor : getColor(85),
                                                fontWeight: ci === bestIdx ? 700 : 500,
                                            }}>
                                                {val}
                                                {ci === bestIdx && (
                                                    <span className="ml-1 inline-block" style={{ fontSize: '9px' }}>✦</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ── Main Component ──

export const PlanComparison: React.FC<PlanComparisonProps> = ({
    title,
    tiers = [],
    highlightBest = true,
    defaultTier,
}) => {
    const [activeTierIdx, setActiveTierIdx] = useState(() => {
        if (defaultTier) {
            const idx = tiers.findIndex(t => t.name === defaultTier);
            return idx >= 0 ? idx : 0;
        }
        return 0;
    });

    if (tiers.length === 0) return null;

    const activeTier = tiers[activeTierIdx];
    const tierColor = activeTier.color || DEFAULT_COLORS[activeTier.name] || '#0072CE';

    // Gather all unique categories across plans in this tier
    const allCategories: Category[] = [];
    const seenCats = new Set<string>();
    for (const plan of activeTier.plans) {
        for (const cat of plan.categories || []) {
            if (!seenCats.has(cat.name)) {
                seenCats.add(cat.name);
                allCategories.push(cat);
            }
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Title */}
            {title && (
                <h3 className="font-data text-base uppercase tracking-[0.12em] mb-3 font-bold" style={{ color: getColor(90) }}>
                    {title}
                </h3>
            )}

            {/* Tier Tabs */}
            {tiers.length > 1 && (
                <div className="flex gap-1 mb-4 flex-wrap">
                    {tiers.map((tier, i) => {
                        const tc = tier.color || DEFAULT_COLORS[tier.name] || '#0072CE';
                        const isActive = i === activeTierIdx;
                        return (
                            <button
                                key={tier.name}
                                onClick={() => setActiveTierIdx(i)}
                                className="font-data text-xs uppercase tracking-wider px-3 py-1.5 rounded-md transition-all duration-200"
                                style={{
                                    background: isActive ? tc : getColor(4),
                                    color: isActive ? '#fff' : getColor(60),
                                    border: `1px solid ${isActive ? tc : getColor(10)}`,
                                    fontWeight: isActive ? 700 : 500,
                                    boxShadow: isActive ? `0 2px 8px ${tc}30` : 'none',
                                }}
                            >
                                {tier.name}
                                <span className="ml-1.5 opacity-60">({tier.plans.length})</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto min-h-0" style={{ scrollbarWidth: 'none' }}>
                {/* Plan Summary Cards */}
                <div className="flex gap-3 mb-4">
                    {activeTier.plans.map((plan, i) => (
                        <SummaryCard key={i} plan={plan} tierColor={tierColor} />
                    ))}
                </div>

                {/* Category Drilldowns */}
                {allCategories.length > 0 && (
                    <div className="rounded-lg p-3" style={{ background: getColor(2), border: `1px solid ${getColor(6)}` }}>
                        <div className="font-data text-[10px] uppercase tracking-wider mb-2 font-semibold" style={{ color: getColor(45) }}>
                            Compare Coverage Details
                        </div>
                        {allCategories.map((cat, i) => (
                            <CategorySection
                                key={cat.name}
                                category={cat}
                                plans={activeTier.plans}
                                highlightBest={highlightBest}
                                tierColor={tierColor}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanComparison;
