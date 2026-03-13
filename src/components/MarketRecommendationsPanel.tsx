import { type MarketOpportunityRecommendation } from '@/lib/market-recommendations';

type MarketRecommendationsPanelProps = {
  roleLabel: string;
  recommendations: MarketOpportunityRecommendation[];
};

export function MarketRecommendationsPanel({
  roleLabel,
  recommendations
}: MarketRecommendationsPanelProps) {
  return (
    <section className="section market-recommendations-section">
      <div className="panel market-recommendations-panel">
        <div className="market-recommendations-header">
          <div>
            <div className="badge">Recommendations engine</div>
            <h2>Advertising opportunities</h2>
          </div>
          <p className="meta">
            Trend data across local, regional, national, and global markets is turning into campaign ideas for this{' '}
            {roleLabel}.
          </p>
        </div>

        <div className="market-recommendations-grid">
          {recommendations.map((recommendation) => (
            <article className="market-recommendation-card" key={recommendation.key}>
              <div className="market-recommendation-topline">
                <span className="market-recommendation-scope">{recommendation.label}</span>
                <span className="market-recommendation-trend">{recommendation.trendLabel}</span>
              </div>
              <h3>{recommendation.footprint}</h3>
              <p className="market-recommendation-emphasis">{recommendation.emphasis}</p>
              <p>{recommendation.adFocus}</p>
              <p className="market-recommendation-signal">{recommendation.signal}</p>
              <p className="market-recommendation-activation">{recommendation.activation}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
