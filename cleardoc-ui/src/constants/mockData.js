export const SAMPLE_DOCUMENT = {
  name: 'Sample Bangalore Residential Lease (2026).pdf',
  size: 2450000,
  formattedSize: '2.4 MB',
  type: 'application/pdf',
  uploadedAt: 'Today',
};

export const SAMPLE_ANALYSIS = {
  documentId: 'sample-bangalore-lease-2026',
  documentName: 'Sample Bangalore Residential Lease (2026).pdf',
  is_mock: true,
  riskLevel: 'High',
  riskScore: 78,
  summary:
    'This is a 12-month residential lease for a 2BHK apartment in Koramangala, Bangalore at ₹28,000/month. While some standard protections exist, this agreement contains several highly unfavorable clauses that expose the tenant to disproportionate financial and legal risk — particularly around maintenance liability, notice periods, and landlord entry rights. Legal review or renegotiation is strongly advised before signing.',
  redFlags: [
    {
      id: 'rf-1',
      title: 'Full Structural Maintenance on Tenant',
      text: 'Clause 4.2 places ALL maintenance liability on the tenant, including structural repairs, plumbing, electrical wiring, and waterproofing — costs that can run into lakhs.',
      severity: 'critical',
      category: 'Liability Trap',
      recommendation:
        'Negotiate to cap tenant maintenance to minor cosmetic repairs under ₹2,000. Under the Transfer of Property Act, 1882, major structural repairs are the landlord\'s legal obligation. Get this in writing.',
    },
    {
      id: 'rf-2',
      title: 'One-Sided 7-Day Eviction Clause',
      text: 'Clause 7.1 allows the landlord to terminate the lease with just 7 days\' notice and without citing any specific cause, while the tenant must provide 30 days\' notice.',
      severity: 'critical',
      category: 'Termination Risk',
      recommendation:
        'Demand symmetrical notice periods (minimum 30 days for both parties) and restrict landlord termination rights to valid breaches such as rent default or property damage.',
    },
    {
      id: 'rf-3',
      title: 'Unlimited Landlord Entry Without Notice',
      text: 'Clause 9 permits the landlord or their designated agents to enter the rented premises at any time for inspection or maintenance without prior notice.',
      severity: 'critical',
      category: 'Privacy Violation',
      recommendation:
        'Amend this clause to mandate minimum 24-hour advance written notice (SMS/email acceptable) before any non-emergency entry. Emergency entry should be limited to genuine safety threats.',
    },
    {
      id: 'rf-4',
      title: 'Excessive Late Payment Penalty',
      text: 'Clause 5.1 imposes a late fee of ₹750/day for rent paid after the 5th of each month, which compounds to ₹18,750 by month-end — potentially exceeding one month\'s rent.',
      severity: 'warning',
      category: 'Financial Risk',
      recommendation:
        'Negotiate a flat late fee (e.g. ₹500 per occurrence) and a 3-day grace period. Daily compounding penalties are exploitative and may not hold up in rental courts.',
    },
    {
      id: 'rf-5',
      title: 'Security Deposit Deduction Clause is Vague',
      text: 'Clause 3.3 permits the landlord to deduct amounts from the security deposit for "damage or excessive wear" without defining any standard or cap.',
      severity: 'warning',
      category: 'Security Deposit Risk',
      recommendation:
        'Insist on a move-in and move-out inspection report with photographs, signed by both parties. Define "excessive wear" with a specific list and monetary cap.',
    },
  ],
  greenFlags: [
    {
      id: 'gf-1',
      title: 'Security Deposit Capped at 2 Months',
      text: "Security deposit is ₹56,000 (exactly 2 months' rent), with a 14-day refund window post move-out as per Clause 3.2.",
      benefit:
        'Aligns with the Karnataka Rent Control Act guidelines. Protects you from excessive upfront capital lockup, and the 14-day window gives legal grounds for recovery if violated.',
    },
    {
      id: 'gf-2',
      title: 'Society Maintenance & Water Included',
      text: 'Monthly society maintenance charges and Cauvery water supply costs are included in the base rent under Clause 6.1.',
      benefit:
        'No surprise monthly bills from the Residents\' Welfare Association. Your total monthly housing cost is exactly ₹28,000 with no hidden add-ons.',
    },
    {
      id: 'gf-3',
      title: 'Annual Rent Hike Capped at 5%',
      text: 'Clause 2.4 limits rent escalation to a maximum of 5% annually, requiring 60 days\' advance written notice before any increase takes effect.',
      benefit:
        'Predictable long-term housing costs. A 5% cap below Bangalore\'s typical 8-10% annual market rent appreciation means you are protected from inflationary hikes.',
    },
    {
      id: 'gf-4',
      title: 'Appliances Covered Under Landlord Warranty',
      text: 'Clause 4.5 states that all white goods (AC units, geyser, refrigerator) are under a 12-month landlord warranty and will be repaired or replaced at landlord cost within 48 hours of reporting.',
      benefit:
        'Significant cost protection. Appliance repairs and replacements can cost ₹5,000–₹40,000. This clause saves you from unexpected large expenses.',
    },
  ],
};

export const SUGGESTED_QUESTIONS = [
  'What is the notice period for vacating?',
  'Who pays for structural maintenance?',
  'Are pets or subleasing allowed?',
  'Is the security deposit refundable?',
  'Are there hidden penalties or fees?',
];

export const MOCK_CHAT_RESPONSES = [
  {
    keywords: ['notice', 'vacat', 'evict', 'terminat', 'leave'],
    answer:
      'According to Clause 7.1, this lease has an asymmetric notice clause — the landlord can evict you with just 7 days\' notice without cause, while you must give 30 days. This is a Critical Red Flag. Before signing, demand a reciprocal 30-day notice period for both parties. The Karnataka Rent Control Act may offer you additional protections.',
  },
  {
    keywords: ['repair', 'structur', 'mainten', 'plumb', 'fix', 'electric'],
    answer:
      'Clause 4.2 currently places ALL maintenance obligations — including structural, plumbing, and electrical — on you as the tenant. This is a Critical Red Flag and unusual. Standard leases in Karnataka limit tenant responsibility to minor repairs under ₹2,000. The Transfer of Property Act, 1882 (Section 108) actually places major structural maintenance on the landlord by default — this clause attempts to override that.',
  },
  {
    keywords: ['pet', 'animal', 'sublet', 'guest', 'roommate'],
    answer:
      'Pets are allowed with prior written landlord approval and a ₹5,000 refundable pet sanitation deposit per Clause 8.1. Subletting the flat or even a single room to any third party is strictly prohibited without written consent (Clause 8.3). Violation could trigger immediate termination.',
  },
  {
    keywords: ['deposit', 'refund', 'money', 'deduct', 'return'],
    answer:
      'Your security deposit is ₹56,000 (2 months\' rent). Per Clause 3.2, it must be refunded within 14 business days after move-out, minus documented damages. We flagged Clause 3.3 as a Warning because deductions can be made for "excessive wear" without a clear standard — insist on a move-in/out inspection report with photos to protect yourself.',
  },
  {
    keywords: ['penalt', 'fine', 'late', 'hidden', 'fee', 'charge'],
    answer:
      'Clause 5.1 imposes ₹750/day for late rent (after the 5th), which could exceed ₹18,000 in a single month. We rated this a Warning Red Flag. Society maintenance and water are covered in rent (no hidden charges there), but the daily late fee is unusually punitive — negotiate for a flat ₹500 fee with a 3-day grace period instead.',
  },
  {
    keywords: ['entry', 'visit', 'inspect', 'landlord come', 'access'],
    answer:
      'Clause 9 currently gives the landlord unlimited right to enter without any notice — a Critical Red Flag for your privacy. Under standard tenancy principles, landlords must provide at least 24 hours notice. Amend this clause before signing.',
  },
];

/**
 * Provides a fallback mock answer based on prompt keywords.
 * @param {string} question
 * @returns {string}
 */
export function getMockChatAnswer(question) {
  const normalized = question.toLowerCase();
  for (const item of MOCK_CHAT_RESPONSES) {
    if (item.keywords.some((k) => normalized.includes(k))) {
      return item.answer;
    }
  }
  return `Based on ClearDoc's analysis of this Bangalore residential lease: The contract carries a High Risk Score (78/100) primarily due to the maintenance liability and eviction clauses. Regarding "${question}" — check the Red Flags section for specific clause references and our recommended negotiation language.`;
}
