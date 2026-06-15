---
title: "Probability of Informed Trading"
date: 2026-06-15
topics: [economics, finance, statistics]
---

Sources: [Der Standard – Profit mit dem Krieg](https://www.derstandard.at/story/3000000324193/profit-mit-dem-krieg-die-mysterioesen-wetten-auf-polymarket) · [Easley, Kiefer, O'Hara & Paperman (1996)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7881) · [Yan & Zhang (2012)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=890486) · [Glosten & Milgrom (1985)](https://milgrom.people.stanford.edu/wp-content/uploads/1984/09/Bid-Ask-and-Transaction-Prices.pdf) · [Easley & O'Hara (1987)](https://www.edegan.com/pdfs/Easley%20OHara%20(1987)%20-%20Price%20Trade%20Size%20and%20Information%20in%20Securities%20Markets.pdf) · [Kyle (1985)](https://personal.utdallas.edu/~nina.baranchuk/Fin7310/papers/Kyle1985.pdf)

[A *Der Standard* article](https://www.derstandard.at/story/3000000324193/profit-mit-dem-krieg-die-mysterioesen-wetten-auf-polymarket) says Polymarket has insider trading because a class of military bets - at least $2,500 on outcomes with at most 35% implied probability - wins more than every second time, when statistically (under the efficient market hypothesis) they should win only at there implied probabilities. How can this be rigorously measured? I.e. how do we model deviations from efficiency via informed and insider trading?

Three examples of the curve described by success probability vs. bet size:

- **Step-function spike** (insider trading): Polymarket military bets: < 1% of wallets wins 51.8% on longshots below 35% implied probability, vs. a 14% baseline. ([ACDC 2026](https://www.coindesk.com/markets/2026/04/30/polymarket-s-military-markets-show-signs-of-insider-edge-report-suggests), [Polymarket-v1 Database](https://arxiv.org/abs/2606.04217))
- **Flat line** (efficient market): Apple, S&P 500, FX. (implied by [Malkiel 2003](https://www.princeton.edu/~ceps/workingpapers/91malkiel.pdf))
- **Concave increase** (informed trading): crude oil futures, weather derivatives. ([arxiv 0809.0822](https://arxiv.org/pdf/0809.0822))

**Modelling bet success rates depending on bet size**

![Formula for modelling bet success rates depending on bet size, with annotated graph showing the insider spike and smart money curves](/reads/images/2026-06-15-probability-of-informed-trading/bet-success-model.png)

**Modelling the rate of informed trades (PIN)**

![Formula for PIN - probability of informed trading - as informed trades over total trades](/reads/images/2026-06-15-probability-of-informed-trading/pin-formula.png)

**Modelling insider trading - three-step approach**

1. Fit $\alpha, \mu, \varepsilon_b, \varepsilon_s$ using MLE for Poisson processes on every bet size bin  
   → calculate $\text{PIN}_x$
2. $Y_x = P_x + \alpha_{sys} + \lambda \cdot \text{PIN}_x$  
   → calculate $P_x, \alpha_{sys}$
3. $\text{PIN}_x = \beta \cdot \log x + \gamma \cdot \mathbb{1}(x > \tau)$  
   → calculate $\gamma, \tau$
