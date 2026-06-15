---
title: "Probability of Informed Trading"
date: 2026-06-15
topics: [economics, finance, statistics]
---

Source: Probability of Informed Trading (PDF)

**Modelling bet success rates depending on bet size**

![Formula for modelling bet success rates depending on bet size, with annotated graph showing the insider spike and smart money curves](/reads/images/2026-06-15-probability-of-informed-trading/bet-success-model.png)

**Modelling the rate of informed trades (PIN)**

![Formula for PIN — probability of informed trading — as informed trades over total trades](/reads/images/2026-06-15-probability-of-informed-trading/pin-formula.png)

**Modelling insider trading — three-step approach**

1. Fit $\alpha, \mu, \varepsilon_b, \varepsilon_s$ using MLE for Poisson processes on every bet size bin  
   → calculate $\text{PIN}_x$
2. $Y_x = P_x + \alpha_{sys} + \lambda \cdot \text{PIN}_x$  
   → calculate $P_x, \alpha_{sys}$
3. $\text{PIN}_x = \beta \cdot \log x + \gamma \cdot \mathbb{1}(x > \tau)$  
   → calculate $\gamma, \tau$
