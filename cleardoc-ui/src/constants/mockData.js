export const SAMPLE_DOCUMENT = {
  name: 'Sample Bangalore Residential Lease (2026).pdf',
  size: 2450000,
  formattedSize: '2.4 MB',
  type: 'application/pdf',
  uploadedAt: 'Today',
};

export const SAMPLE_ANALYSES = {
  'sample-bangalore-lease-2026': {
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
  },
  'sample-employment-contract': {
    documentId: 'sample-employment-contract',
    documentName: 'Tech Startup Employment Agreement.pdf',
    is_mock: true,
    riskLevel: 'Moderate',
    riskScore: 65,
    summary:
      'This is a full-time employment agreement for a Software Engineer at a private tech startup. It offers a competitive base salary and stock options, but includes broad non-compete restrictions and aggressive IP assignment clauses that could impact your future career mobility and side projects.',
    redFlags: [
      {
        id: 'rf-1',
        title: '24-Month Non-Compete Clause',
        text: 'Clause 11.2 prohibits you from working for any "competitor in the technology sector globally" for 24 months after termination of employment.',
        severity: 'critical',
        category: 'Career Restriction',
        recommendation:
          'Under Section 27 of the Indian Contract Act, post-employment non-competes are generally void. However, to avoid litigation, negotiate to limit this to 6 months and restrict it to direct competitors in a specific geographic area.',
      },
      {
        id: 'rf-2',
        title: 'Overly Broad IP Assignment',
        text: 'Clause 7 states that ANY intellectual property created by you during the employment period, even on your own time using your own equipment, belongs to the company.',
        severity: 'critical',
        category: 'Intellectual Property',
        recommendation:
          'Amend to exclude IP developed entirely on your own time, without using company resources, and unrelated to the company\'s current or anticipated business.',
      },
      {
        id: 'rf-3',
        title: 'Unilateral Relocation Rights',
        text: 'Clause 3.4 grants the company the right to transfer you to any office globally without your consent and without guaranteed relocation assistance.',
        severity: 'warning',
        category: 'Work Conditions',
        recommendation:
          'Request a mutual consent requirement for relocation, or at least a clause guaranteeing full coverage of relocation expenses and cost-of-living adjustments.',
      }
    ],
    greenFlags: [
      {
        id: 'gf-1',
        title: 'Standard 30-Day Notice Period',
        text: 'Clause 14.1 requires either party to provide 30 days written notice for termination without cause.',
        benefit: 'Provides reasonable job security and transition time. It is symmetric, applying equally to you and the employer.',
      },
      {
        id: 'gf-2',
        title: 'Accelerated Vesting on Acquisition',
        text: 'Clause 5.3 stipulates that 100% of your unvested ESOPs will immediately vest in the event of a change of control (acquisition or merger).',
        benefit: 'Protects your equity upside if the startup gets acquired before your standard 4-year vesting schedule completes.',
      }
    ]
  },
  'sample-freelance-nda': {
    documentId: 'sample-freelance-nda',
    documentName: 'Freelance Non-Disclosure Agreement (NDA).pdf',
    is_mock: true,
    riskLevel: 'High',
    riskScore: 82,
    summary:
      'This is a mutual NDA intended for early-stage discussions with a prospective client. However, it functions more like a one-way NDA and includes predatory clauses such as a non-solicitation of clients and a highly disproportionate liquidated damages penalty for any suspected breach.',
    redFlags: [
      {
        id: 'rf-1',
        title: 'Asymmetric Confidentiality Obligations',
        text: 'While titled "Mutual NDA", Section 2 only defines the Client\'s information as Confidential. Your information shared during discussions is not protected.',
        severity: 'critical',
        category: 'Unfair Terms',
        recommendation: 'Redraft Section 2 to explicitly cover proprietary methodologies, pricing, and code samples you share with the Client.',
      },
      {
        id: 'rf-2',
        title: 'Liquidated Damages of $50,000',
        text: 'Section 8 imposes a flat $50,000 penalty for any breach of confidentiality, regardless of actual damages proven.',
        severity: 'critical',
        category: 'Financial Trap',
        recommendation: 'Remove this completely. Liability for breach should be limited to "proven actual damages" in a court of law, not a punitive upfront sum.',
      },
      {
        id: 'rf-3',
        title: 'Perpetual Term of Confidentiality',
        text: 'Section 5 states that the obligations to keep information secret survive indefinitely, forever.',
        severity: 'warning',
        category: 'Perpetual Liability',
        recommendation: 'Standard NDAs cap the confidentiality period (usually 2 to 5 years after the agreement ends) except for actual trade secrets.',
      }
    ],
    greenFlags: [
      {
        id: 'gf-1',
        title: 'Standard Exclusions Apply',
        text: 'Section 3 excludes information that is already public, known to you previously, or independently developed without using their information.',
        benefit: 'Provides a safe harbor so you aren\'t liable if their "secret" is actually common industry knowledge.',
      }
    ]
  },
  'sample-vendor-agreement': {
    documentId: 'sample-vendor-agreement',
    documentName: 'Enterprise SaaS Vendor Agreement.pdf',
    is_mock: true,
    riskLevel: 'Low',
    riskScore: 35,
    summary:
      'This is a standard B2B SaaS agreement for providing software services to an enterprise client. It is generally well-balanced, clearly defining the service levels, payment terms, and intellectual property boundaries. There are only minor issues regarding payment delays and limitation of liability.',
    redFlags: [
      {
        id: 'rf-1',
        title: 'Extended Payment Terms (Net 90)',
        text: 'Section 4 dictates that invoices will be paid Net 90 days after receipt, which can severely impact vendor cash flow.',
        severity: 'warning',
        category: 'Cash Flow Risk',
        recommendation: 'Negotiate for Net 30 or Net 45 terms. If Net 90 is non-negotiable, request a 2% discount for early payment (2/10 Net 90).',
      },
      {
        id: 'rf-2',
        title: 'Unlimited Liability for Data Breaches',
        text: 'Section 12 carves out data breaches from the limitation of liability cap, making the vendor theoretically liable for unlimited damages.',
        severity: 'warning',
        category: 'Liability Exposure',
        recommendation: 'Cap liability for data breaches at a specific multiple of the contract value (e.g., 3x annual fees) or the limit of your cyber liability insurance policy.',
      }
    ],
    greenFlags: [
      {
        id: 'gf-1',
        title: 'Client Data Ownership Clearly Defined',
        text: 'Section 8.1 explicitly states that the Client owns their data, and the Vendor owns the SaaS platform IP.',
        benefit: 'Prevents IP disputes by establishing a clear boundary between the underlying platform mechanics and the customer\'s proprietary inputs.',
      },
      {
        id: 'gf-2',
        title: 'Reasonable SLA Uptime (99.5%)',
        text: 'Section 2 guarantees 99.5% uptime with defined maintenance windows excluded from the calculation.',
        benefit: '99.5% is a commercially reasonable target that gives your engineering team breathing room, unlike punishing 99.99% SLAs.',
      }
    ]
  },
  'sample-gym-membership': {
    documentId: 'sample-gym-membership',
    documentName: 'Annual Gym Membership Contract.pdf',
    is_mock: true,
    riskLevel: 'Moderate',
    riskScore: 60,
    summary:
      'This is a standard 12-month consumer gym membership agreement. It locks the consumer into a one-year commitment with strict cancellation policies and broad injury waivers that heavily protect the facility at the expense of consumer rights.',
    redFlags: [
      {
        id: 'rf-1',
        title: 'Impossible Cancellation Terms',
        text: 'Section 3 requires cancellation to be submitted via certified mail 60 days before the billing cycle, or imposes a cancellation fee equal to 50% of the remaining contract value.',
        severity: 'critical',
        category: 'Consumer Trap',
        recommendation: 'Ask for a month-to-month option instead. If locked into annual, request a waiver of the 50% penalty if you move more than 25 miles away or provide a doctor\'s note.',
      },
      {
        id: 'rf-2',
        title: 'Total Liability Waiver for Gross Negligence',
        text: 'Section 7 states the gym is not liable for any injuries, even those caused by broken equipment or staff negligence.',
        severity: 'critical',
        category: 'Liability Trap',
        recommendation: 'While standard in fitness contracts, courts often invalidate waivers for gross negligence. Ensure your personal health insurance covers sports injuries.',
      },
      {
        id: 'rf-3',
        title: 'Auto-Renewal with Rate Hike',
        text: 'Section 2.1 automatically renews the contract annually at the "current market rate," which could be substantially higher than your promotional sign-up rate.',
        severity: 'warning',
        category: 'Financial Risk',
        recommendation: 'Cross out the auto-renew clause before signing, or set a calendar reminder 65 days before expiration to manually cancel or renegotiate.',
      }
    ],
    greenFlags: [
      {
        id: 'gf-1',
        title: '3-Day Cooling Off Period',
        text: 'Section 1.2 allows you to cancel the contract without penalty within 3 business days of signing.',
        benefit: 'Provides a legally mandated window to back out if you experience buyer\'s remorse or discover the facility does not meet your expectations.',
      }
    ]
  }
};

export const SAMPLE_ANALYSIS = SAMPLE_ANALYSES['sample-bangalore-lease-2026'];

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
