import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './Pricing.css';

const freeFeatures = [
  '10 analyses per month',
  'Text misinformation detection',
  'AI-generated image detection',
  'Basic video and deepfake detection',
  'Confidence score',
  'Basic analysis results',
  'Limited analysis history',
];

const premiumFeatures = [
  '500 analyses per month',
  'Advanced text analysis',
  'AI-generated image detection',
  'Advanced video and deepfake analysis',
  'Detailed analysis reports',
  'Confidence and evidence insights',
  'Full analysis history',
  'PDF and CSV report export',
  'Faster processing',
  'Priority support',
];

const enterpriseFeatures = [
  'Unlimited or high-volume analyses',
  'Bulk content analysis',
  'API access',
  'Organization dashboard',
  'Multiple team members',
  'Usage analytics',
  'Custom integrations',
  'Dedicated support',
  'Custom usage limits',
  'Enterprise security controls',
];

const IncludedFeature = ({ children, excluded = false }) => {
  const Icon = excluded ? X : Check;

  return (
    <li className={excluded ? 'pricing-feature pricing-feature-excluded' : 'pricing-feature'}>
      <span className="pricing-feature-icon" aria-hidden="true">
        <Icon size={15} strokeWidth={2.5} />
      </span>
      <span>{children}</span>
    </li>
  );
};

export const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const [notice, setNotice] = useState(null);

  return (
    <main className="pricing-page">
      <div className="pricing-container">
        <header className="pricing-header">
          <span className="pricing-eyebrow">TRUTHLENS PLANS</span>
          <h1>Choose the plan that fits your needs</h1>
          <p>
            From checking a suspicious post to verifying content at
            organizational scale, find the right tools for your work.
          </p>
        </header>

        <section className="pricing-grid" aria-label="TruthLens subscription plans">
          <article className="pricing-card">
            <div className="pricing-plan-heading">
              <span className="pricing-plan-kicker">For individuals</span>
              <h2>Free</h2>
              <p>For occasional checks and everyday peace of mind.</p>
            </div>

            <div className="pricing-price">
              <strong>$0</strong>
              <span>/ month</span>
            </div>

            <Link
              className="pricing-button pricing-button-secondary"
              to={isAuthenticated ? '/home' : '/signup'}
            >
              {isAuthenticated ? 'Go to dashboard' : 'Get Started Free'}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <p className="pricing-button-note">No credit card required.</p>

            <div className="pricing-features">
              <h3>Included</h3>
              <ul>
                {freeFeatures.map((feature) => (
                  <IncludedFeature key={feature}>{feature}</IncludedFeature>
                ))}
                <IncludedFeature excluded>Detailed reports</IncludedFeature>
                <IncludedFeature excluded>Bulk analysis</IncludedFeature>
                <IncludedFeature excluded>API access</IncludedFeature>
                <IncludedFeature excluded>Priority support</IncludedFeature>
              </ul>
            </div>
          </article>

          <article className="pricing-card pricing-card-featured">
            <div className="pricing-popular-badge">Most popular</div>
            <div className="pricing-plan-heading">
              <span className="pricing-plan-kicker">For frequent verification</span>
              <h2>Premium</h2>
              <p>For deeper insights and more room to verify.</p>
            </div>

            <div className="pricing-price">
              <strong>$9.99</strong>
              <span>/ month</span>
            </div>

            <button
              className="pricing-button pricing-button-primary"
              type="button"
              onClick={() => setNotice('premium')}
            >
              Upgrade to Premium
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <p className="pricing-button-note">Cancel anytime.</p>
            {notice === 'premium' && (
              <p className="pricing-notice" role="status">
                Premium upgrades are coming soon. No payment has been taken.
              </p>
            )}

            <div className="pricing-features">
              <h3>Everything in Free, plus</h3>
              <ul>
                {premiumFeatures.map((feature) => (
                  <IncludedFeature key={feature}>{feature}</IncludedFeature>
                ))}
              </ul>
            </div>
          </article>

          <article className="pricing-card">
            <div className="pricing-plan-heading">
              <span className="pricing-plan-kicker">For organizations</span>
              <h2>Enterprise</h2>
              <p>For teams that verify content at scale.</p>
            </div>

            <div className="pricing-price pricing-price-custom">
              <strong>Custom</strong>
              <span>tailored to your needs</span>
            </div>

            <button
              className="pricing-button pricing-button-secondary"
              type="button"
              onClick={() => setNotice('enterprise')}
            >
              Upgrade to Enterprise
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <p className="pricing-button-note">Tailored to your organization's needs.</p>
            {notice === 'enterprise' && (
              <p className="pricing-notice" role="status">
                Enterprise upgrades are coming soon. No payment has been taken.
              </p>
            )}

            <div className="pricing-features">
              <h3>Everything in Premium, plus</h3>
              <ul>
                {enterpriseFeatures.map((feature) => (
                  <IncludedFeature key={feature}>{feature}</IncludedFeature>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <p className="pricing-footnote">
          Plans are presented for the TruthLens prototype. Premium and Enterprise
          features are not currently activated.
        </p>
      </div>
    </main>
  );
};
