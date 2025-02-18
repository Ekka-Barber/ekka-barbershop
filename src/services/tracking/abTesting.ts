
import { supabase } from "@/integrations/supabase/client";
import { ABTest, ABTestResult, ABTestVariant } from "@/components/admin/tracking/types";
import { getSessionId } from "./sessionManager";

export const getActiveTest = async (): Promise<ABTest | null> => {
  const { data, error } = await supabase
    .from('ab_tests')
    .select('*')
    .eq('status', 'running')
    .single();

  if (error || !data) {
    console.error('Error fetching active A/B test:', error);
    return null;
  }

  return data;
};

export const assignVariant = async (testId: string): Promise<ABTestVariant | null> => {
  const sessionId = getSessionId();
  if (!sessionId) return null;

  // Check if user already has a variant assigned
  const { data: existingAssignment } = await supabase
    .from('ab_test_assignments')
    .select('variant_id')
    .eq('session_id', sessionId)
    .eq('test_id', testId)
    .single();

  if (existingAssignment?.variant_id) {
    const { data: variant } = await supabase
      .from('ab_test_variants')
      .select('*')
      .eq('id', existingAssignment.variant_id)
      .single();

    return variant;
  }

  // Get variants for this test
  const { data: variants } = await supabase
    .from('ab_test_variants')
    .select('*')
    .eq('test_id', testId);

  if (!variants?.length) return null;

  // Randomly assign variant
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];

  // Store assignment
  await supabase.from('ab_test_assignments').insert({
    session_id: sessionId,
    test_id: testId,
    variant_id: randomVariant.id,
    assigned_at: new Date().toISOString()
  });

  return randomVariant;
};

export const trackTestConversion = async (
  testId: string, 
  variantId: string,
  conversionType: string,
  conversionValue?: number
): Promise<void> => {
  const sessionId = getSessionId();
  if (!sessionId) return;

  await supabase.from('ab_test_conversions').insert({
    test_id: testId,
    variant_id: variantId,
    session_id: sessionId,
    conversion_type: conversionType,
    conversion_value: conversionValue,
    converted_at: new Date().toISOString()
  });
};

export const calculateTestResults = async (testId: string): Promise<ABTestResult[]> => {
  const { data: variants } = await supabase
    .from('ab_test_variants')
    .select('*')
    .eq('test_id', testId);

  if (!variants) return [];

  const results: ABTestResult[] = [];

  for (const variant of variants) {
    const { data: conversions } = await supabase
      .from('ab_test_conversions')
      .select('*')
      .eq('variant_id', variant.id);

    const { data: sessions } = await supabase
      .from('ab_test_assignments')
      .select('*')
      .eq('variant_id', variant.id);

    if (!conversions || !sessions) continue;

    const totalUsers = sessions.length;
    const conversionCount = conversions.length;
    const conversionRate = totalUsers > 0 ? (conversionCount / totalUsers) * 100 : 0;

    // Calculate confidence interval using Wilson score interval
    const z = 1.96; // 95% confidence level
    const p = conversionRate / 100;
    const n = totalUsers;

    const confidenceInterval = {
      lower: Math.max(0, ((p + z * z / (2 * n) - z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / (1 + z * z / n)) * 100,
      upper: Math.min(100, ((p + z * z / (2 * n) + z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / (1 + z * z / n)) * 100
    };

    results.push({
      variantId: variant.id,
      totalUsers,
      conversions: conversionCount,
      conversionRate,
      averageTimeToConversion: conversions.reduce((acc, conv) => {
        const time = new Date(conv.converted_at).getTime() - new Date(conv.assigned_at).getTime();
        return acc + time;
      }, 0) / conversionCount,
      bounceRate: sessions.filter(s => !s.page_views || s.page_views === 1).length / totalUsers * 100,
      deviceDistribution: {
        mobile: sessions.filter(s => s.device_type === 'mobile').length / totalUsers * 100,
        tablet: sessions.filter(s => s.device_type === 'tablet').length / totalUsers * 100,
        desktop: sessions.filter(s => s.device_type === 'desktop').length / totalUsers * 100
      },
      confidenceInterval,
      statisticalSignificance: calculateSignificance(results[0], results[results.length - 1])
    });
  }

  return results;
};

function calculateSignificance(control: ABTestResult, variant: ABTestResult): number {
  if (!control || !variant) return 0;

  const p1 = control.conversionRate / 100;
  const p2 = variant.conversionRate / 100;
  const n1 = control.totalUsers;
  const n2 = variant.totalUsers;

  const se = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
  const z = Math.abs(p1 - p2) / se;

  // Convert z-score to p-value using normal distribution
  const p = (1 - Math.erf(z / Math.sqrt(2))) / 2;
  
  return (1 - p) * 100;
}
