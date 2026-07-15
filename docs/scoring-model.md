# Green Lens Scoring Model Draft

This document captures the first implementation direction for the weighted ESG score. It is a product and engineering draft, not final scoring policy.

## Target Formula

```text
totalScore = baseScore * 0.4 + trendScore * 0.4 + communityScore * 0.2
```

Each layer should return both a numeric score and evidence:

- `score`: 0-100
- `confidence`: 0-1
- `evidence`: source links, matched calibration records, or vote summaries
- `notes`: short explanation for the UI and debugging

## Layer 1: Base Score

Base score represents the brand's ESG foundation.

Preferred sources:

- Maintained internal rating table for major brands
- Public ESG ratings when available
- Latest annual ESG/sustainability report as weaker supporting evidence

Suggested mapping for rating-like inputs:

| Rating | Score |
| --- | ---: |
| AAA | 95 |
| AA | 88 |
| A | 78 |
| BBB | 68 |
| BB | 55 |
| B | 42 |
| CCC | 28 |

Fallback strategy:

- If a verified rating exists in the local table, use it.
- If no rating exists but the brand has recent ESG reports and credible third-party coverage, ask AI to extract a cautious base score with low confidence.
- If neither rating nor credible ESG source exists, default to 50 with low confidence and label it as "insufficient verified baseline data".

Implementation note:

- Do not rely on live scraping for proprietary ratings as the default path.
- Start with a manually maintained JSON table for top brands. This is more stable, cheaper, and easier to audit.

## Layer 2: Trend Score

Trend score represents recent ESG momentum.

Source:

- Current Tavily search flow, focused on recent ESG news and controversies.

Prompt direction:

- Ask the model to classify each news item by ESG dimension, sentiment, severity, freshness, and credibility.
- Calculate score from structured events instead of asking the model to invent one final score.

Draft event scoring:

| Severity | Positive Impact | Negative Impact |
| --- | ---: | ---: |
| minor | +3 | -5 |
| moderate | +8 | -12 |
| major | +15 | -25 |
| critical | +20 | -40 |

Draft freshness multiplier:

| Age | Multiplier |
| --- | ---: |
| 0-30 days | 1.0 |
| 31-90 days | 0.8 |
| 91-180 days | 0.5 |
| 181-365 days | 0.25 |

Suggested calculation:

```text
trendScore = clamp(50 + sum(eventImpact * freshnessMultiplier * credibilityMultiplier), 0, 100)
```

## Layer 3: Community Score

Community score represents user feedback and lived perception.

Initial version:

- 1-5 star vote
- optional comment
- support / avoid intent

Suggested conversion:

```text
communityScore = ((averageStars - 1) / 4) * 100
```

Confidence should depend on sample size:

```text
confidence = min(1, log10(voteCount + 1) / 2)
```

Until there are enough votes, blend toward neutral:

```text
adjustedCommunityScore = communityScore * confidence + 50 * (1 - confidence)
```

## ESG Dimension Scores

Institutional ratings and community votes are often overall scores, while Green Lens still wants E/S/G dimensions.

Recommended approach:

- Base score applies to the overall score only unless the local rating table has dimension data.
- Trend events must be classified into `environment`, `social`, and `governance`.
- Community voting can start as an overall score, then later add optional dimension tags.

Dimension display should therefore show:

- E/S/G scores derived mostly from recent classified events and calibration facts
- a confidence indicator or short caveat when dimension data is thin
- the overall weighted score as the primary score

This keeps the UI honest: the product can still show three dimensions, but it should not pretend all three are equally well-supported by every data source.
