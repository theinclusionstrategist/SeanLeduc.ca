'use client';

import React, { useState } from 'react';

export default function CorporateRiskMatrix() {
  const [execCount, setExecCount] = useState<number>(3);
  const [annualRevenue, setAnnualRevenue] = useState<number>(2500000);
  const [hasBuySellAgreement, setHasBuySellAgreement] = useState<boolean>(false);
  const [hasKeypersonIns, setHasKeypersonIns] = useState<boolean>(false);

  const calculateCorporateExposure = () => {
    let riskScore = 30; // Base baseline
    let unfundedLiability = annualRevenue * 0.4; // Estimated transition valuation gap

    if (!hasBuySellAgreement) riskScore += 35;
    if (!hasKeypersonIns) riskScore += 25;
    if (execCount <= 2) riskScore += 10; // High single-point-of-failure risk

    // Corporate tax savings estimate via exempt corporate life insurance
    const estimatedTaxShield = Math.round(annualRevenue * 0.12);

    return {
      riskScore: Math.min(riskScore, 100),
      unfundedLiability: Math.round(unfundedLiability),
      estimatedTaxShield,
    };
  };

  const metrics = calculateCorporateExposure();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 font-sans">
      <div className="border-b border-slate-800 pb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <div className="inline-block bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-mono px-3 py-1 rounded-full mb-2">
            Ontario Corporate Diagnostic Tool
          </div>
          <h3 className="text-2xl font-bold text-white">
            Executive Key Person & Shareholder Risk Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Quantify corporate liability, buy-sell funding gaps, and corporate tax shields.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
            Calculated Risk Level
          </span>
          <span
            className={`text-2xl font-black ${
              metrics.riskScore > 65
                ? 'text-rose-400'
                : metrics.riskScore > 40
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {metrics.riskScore}% {metrics.riskScore > 65 ? 'CRITICAL EXPOSURE' : 'MODERATE'}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Active Key Executives / Shareholder Partners</span>
              <span className="text-indigo-400 font-mono">{execCount} Executives</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={execCount}
              onChange={(e) => setExecCount(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Estimated Annual Corporate Revenue</span>
              <span className="text-indigo-400 font-mono">${(annualRevenue / 1000000).toFixed(2)}M CAD</span>
            </div>
            <input
              type="range"
              min="500000"
              max="10000000"
              step="250000"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setHasBuySellAgreement(!hasBuySellAgreement)}
              className={`p-3 text-xs font-semibold rounded-xl border text-left transition ${
                hasBuySellAgreement
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {hasBuySellAgreement ? '✓ Funded Buy-Sell In Place' : '✕ No Buy-Sell Funding'}
            </button>

            <button
              type="button"
              onClick={() => setHasKeypersonIns(!hasKeypersonIns)}
              className={`p-3 text-xs font-semibold rounded-xl border text-left transition ${
                hasKeypersonIns
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {hasKeypersonIns ? '✓ Key Person Policy Active' : '✕ No Key Person Policy'}
            </button>
          </div>
        </div>

        {/* Real-time Exposure Dashboard */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                Estimated Unfunded Shareholder Liability
              </span>
              <div className="text-3xl font-black text-rose-400 mt-0.5">
                ${metrics.unfundedLiability.toLocaleString()} CAD
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                Potential Corporate Tax Shield Opportunity
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                +${metrics.estimatedTaxShield.toLocaleString()}/yr
              </div>
            </div>
          </div>

          <a
            href="#consultation"
            className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20"
          >
            Request Executive Risk Audit with Sean Leduc
          </a>
        </div>
      </div>
    </div>
  );
}
