import { describe, expect, it } from 'vitest';
import {
  adCampaignStatusFromVetting,
  type VettingResult,
} from '@/lib/ad-vetting';

const approved: VettingResult = { isApproved: true, requiresManualReview: false, reasoning: 'ok' };
const rejected: VettingResult = { isApproved: false, requiresManualReview: false, reasoning: 'no' };
const borderline: VettingResult = { isApproved: false, requiresManualReview: true, reasoning: 'unsure' };
// requiresManualReview always wins even if isApproved is somehow true.
const borderlineApproved: VettingResult = { isApproved: true, requiresManualReview: true, reasoning: 'unsure' };

describe('adCampaignStatusFromVetting', () => {
  it('maps vetting outcomes to the exact status strings the Ad/AdSlot pipeline writes', () => {
    expect(adCampaignStatusFromVetting(approved)).toBe('APPROVED');
    expect(adCampaignStatusFromVetting(rejected)).toBe('REJECTED');
    expect(adCampaignStatusFromVetting(borderline)).toBe('PENDING');
    expect(adCampaignStatusFromVetting(borderlineApproved)).toBe('PENDING');
  });
});
