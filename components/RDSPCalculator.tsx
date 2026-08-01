'use client';

import React, { useState } from 'react';

export default function RDSPCalculator() {
  const [annualContribution, setAnnualContribution] = useState<number>(1500);
  const [familyIncome, setFamilyIncome] = useState<'low' | 'high'>('low');
  const [years, setYears] = useState<number>(20);

  // Canadian RDSP Grant & Bond Calculations
  const calculateEstimate = () => {
    let annualGrant = 0;
    let annualBond = 0;

    if (familyIncome === 'low') {
      // 300% on first $500, 200% on next $1,000 + $1,000 Bond
      annualGrant = Math.min(annualContribution, 500) * 3 + Math.max(0, Math.min(annualContribution - 500, 1000)) * 2;
      annualBond = 1000;
    } else {
      // 100% on first $1,000
      annualGrant = Math.min(annualContribution, 1000) * 1;
      annualBond = 0;
    }

    // Caps: Grant cap $70k lifetime, Bond cap $20k lifetime
    const totalGrants = Math.min(annualGrant * years, 70000);
    const totalBonds = Math.min(annualBond * years, 20000);
    const totalContributions = annualContribution * years;

    // Projected portfolio value assuming 5.5% average return
    let projectedTotal = 0;
    const rate = 0.055;
    for (let i = 0; i < years; i++) {
      const yearlyAddition = annualContribution + Math.min(annualGrant, 3500) + Math.min(annualBond, 1000);
      projectedTotal = (projectedTotal + yearlyAddition) * (1 + rate);
    }

    return {
      totalContributions,
      totalGrants,
      totalBonds,
      projectedTotal: Math.round(projectedTotal),
    };
  };

  const results = calculateEstimate();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-block bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono px-3 py-1 rounded-full mb-3">
          Interactive Wealth Estimator
        </div>
        <h3 className="text-2xl font-bold text-white">
          Ontario RDSP Government Matching & Growth Calculator
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Estimate government Canada Disability Savings Grants (CDSG) & Bonds (CDSB).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Sliders and Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Annual Out-of-Pocket Contribution</span>
              <span className="text-blue-400 font-mono">${annualContribution.toLocaleString()}/yr</span>
            </div>
            <input
              type="range"
              min="0"
              max="4000"
              step="100"
              value={annualContribution}
              onChange={(e) => setAnnualContribution(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Net Family Income Threshold
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFamilyIncome('low')}
                className={`py-3 text-xs font-semibold rounded-xl border transition ${
                  familyIncome === 'low'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Under Threshold (~$100k)
              </button>
              <button
                type="button"
                onClick={() => setFamilyIncome('high')}
                className={`py-3 text-xs font-semibold rounded-xl border transition ${
                  familyIncome === 'high'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Above Threshold
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Accumulation Horizon</span>
              <span className="text-blue-400 font-mono">{years} Years</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>
        </div>

        {/* Results Visualizer */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">
              Projected Total Asset Value
            </span>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 mt-1">
              ${results.projectedTotal.toLocaleString()}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-900 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Your Contributions:</span>
              <span className="font-mono text-white">${results.totalContributions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Est. Gov Grants (CDSG):</span>
              <span className="font-mono text-emerald-400">+${results.totalGrants.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Est. Gov Bonds (CDSB):</span>
              <span className="font-mono text-emerald-400">+${results.totalBonds.toLocaleString()}</span>
            </div>
          </div>

          <a
            href="#consultation"
            className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
          >
            Lock In This Strategy With Sean
          </a>
        </div>
      </div>
    </div>
  );
}
