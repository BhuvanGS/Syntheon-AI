# Syntheon Hub — Unit Economics & Cost Analysis

> Last updated: July 5, 2026  
> Status: Pre-public beta (launching Jul 7, 2026)

---

## 1. Pricing Model

### Plans

| Plan           | Annual (billed yearly)   | Monthly (no commitment) | Seat cap               | Target              |
| -------------- | ------------------------ | ----------------------- | ---------------------- | ------------------- |
| **Free**       | $0                       | $0                      | 3 (org) / 1 (personal) | Solo, trying it out |
| **Pro**        | $8.50/user/mo ($102/yr)  | $9.50/user/mo           | 15                     | Small teams         |
| **Max**        | $14.50/user/mo ($174/yr) | $15.50/user/mo          | 50                     | Growing teams       |
| **Enterprise** | Custom (~$25/user/mo)    | Custom                  | Unlimited              | Large orgs, SSO     |

### Features Per Plan

| Feature           | Free | Pro       | Max       | Enterprise |
| ----------------- | ---- | --------- | --------- | ---------- |
| Meetings/mo       | 2    | Unlimited | Unlimited | Unlimited  |
| Tickets           | 25   | 500       | Unlimited | Unlimited  |
| Projects          | 1    | 10        | Unlimited | Unlimited  |
| Dependencies      | ❌   | ✅        | ✅        | ✅         |
| API access        | ❌   | ✅        | ✅        | ✅         |
| Analytics         | ❌   | ❌        | ✅        | ✅         |
| Sprint-stones     | ❌   | ❌        | ✅        | ✅         |
| Roadmap           | ❌   | ❌        | ✅        | ✅         |
| SSO               | ❌   | ❌        | ❌        | ✅         |
| Audit logs        | ❌   | ❌        | ❌        | ✅         |
| Priority support  | ❌   | ❌        | ✅        | ✅         |
| Dedicated support | ❌   | ❌        | ❌        | ✅         |

### Trial Period

- **15 days** (changed from 30 on Jul 5, 2026)
- No payment required during trial
- Full access to Pro features during trial

---

## 2. Infrastructure Costs

### Per-Unit Costs (Variable)

| Service                     | Unit             | Rate         | Notes                                   |
| --------------------------- | ---------------- | ------------ | --------------------------------------- |
| **Skribby** (bot)           | Per meeting hour | $0.35/hr     | Base bot fee                            |
| **Skribby** (transcription) | Per meeting hour | $0.04/hr     | Groq Whisper via Skribby                |
| **Skribby** (total)         | Per meeting hour | **$0.39/hr** | Bot + transcription                     |
| **Groq** (LLM)              | Per meeting      | ~$0.0145     | Ticket extraction + summary + due dates |
| **Groq** (AI features)      | Per request      | ~$0.0027     | Sprint health, grouping, dependencies   |
| **Deepgram** (if BYOK)      | Per audio minute | $0.0043/min  | Nova-2 batch (NOT currently used)       |
| **DynamoDB** (writes)       | Per million WRU  | $1.25        | On-demand mode                          |
| **DynamoDB** (reads)        | Per million RRU  | $0.125       | Eventually consistent                   |
| **DynamoDB** (storage)      | Per GB/mo        | $0.25        | First 25GB free                         |
| **S3** (storage)            | Per GB/mo        | $0.023       | Standard storage                        |
| **S3** (PUT)                | Per 1K requests  | $0.005       | Uploads                                 |
| **S3** (GET)                | Per 1K requests  | $0.0004      | Downloads                               |
| **CloudFront** (transfer)   | Per GB           | $0.085       | First 10TB tier                         |
| **CloudFront** (requests)   | Per 10K          | $0.0075      | All request types                       |
| **Clerk**                   | Per MAU          | $0           | Free up to 10K MAU                      |
| **Route53**                 | Per zone/mo      | $0.50        | 1 zone                                  |
| **ACM** (SSL cert)          | Per cert         | $0           | Free                                    |

### Fixed Costs (Monthly)

| Service         | Cost         | Notes    |
| --------------- | ------------ | -------- |
| Route53         | $0.50        | DNS zone |
| ACM certificate | $0           | SSL      |
| **Total fixed** | **$0.50/mo** |          |

### Groq Batch API Discount

- Async operations (ticket extraction, dependency inference) can use Batch API
- **50% discount** on token costs
- Ticket extraction: $0.0145 → $0.0073 per meeting
- Applicable to ~80% of Groq calls (meeting processing is async)

---

## 3. Usage Assumptions

### User Distribution (Expected)

| Plan       | % of users | Notes            |
| ---------- | ---------- | ---------------- |
| Free       | 60%        | Loss leader, CAC |
| Pro        | 30%        | Core revenue     |
| Max        | 8%         | Power users      |
| Enterprise | 2%         | Custom deals     |

### Meeting Activity Per Plan

| Plan       | Meetings/user/mo | Avg meeting length | Hours/user/mo |
| ---------- | ---------------- | ------------------ | ------------- |
| Free       | 2                | 45 min             | 1.5           |
| Pro        | 15               | 45 min             | 11.25         |
| Max        | 30               | 45 min             | 22.5          |
| Enterprise | 30               | 45 min             | 22.5          |

### User Activity Breakdown (Within an Org)

Not every seat uses meetings equally:

| Role                         | % of org | Meetings/mo | Skribby cost/mo |
| ---------------------------- | -------- | ----------- | --------------- |
| Active (hosts meetings)      | 40%      | 15          | $4.39           |
| Occasional (joins sometimes) | 30%      | 5           | $1.46           |
| View-only (board only)       | 30%      | 0           | $0              |

**Effective Skribby cost per seat in a paid org:** ~$2.18/mo (weighted average)

### DynamoDB Usage Estimates Per User

| Operation | Per user/mo | Notes                                   |
| --------- | ----------- | --------------------------------------- |
| Writes    | ~3,000      | Ticket updates, activity logs, comments |
| Reads     | ~15,000     | Board loads, ticket views, queries      |
| Storage   | ~50KB       | User data, tickets, metadata            |

---

## 4. Per-User Cost Breakdown

### By Plan (Monthly)

| Cost Component              | Free      | Pro       | Max       | Enterprise |
| --------------------------- | --------- | --------- | --------- | ---------- |
| Skribby (bot+transcription) | $0.59     | $4.39     | $8.78     | $8.78      |
| Groq (LLM)                  | $0.03     | $0.22     | $0.43     | $0.43      |
| DynamoDB                    | $0.02     | $0.02     | $0.02     | $0.02      |
| S3                          | $0.01     | $0.01     | $0.01     | $0.01      |
| CloudFront                  | $0.02     | $0.02     | $0.02     | $0.02      |
| Clerk                       | $0        | $0        | $0        | $0         |
| Hosting (Lambda)            | $0.02     | $0.02     | $0.02     | $0.02      |
| **Total cost/user/mo**      | **$0.69** | **$4.68** | **$9.28** | **$9.28**  |

### By Plan (Annual)

| Cost Component         | Free      | Pro        | Max         | Enterprise  |
| ---------------------- | --------- | ---------- | ----------- | ----------- |
| **Total cost/user/yr** | **$8.28** | **$56.16** | **$111.36** | **$111.36** |

---

## 5. Revenue Per User

| Plan          | Annual revenue/user | Annual cost/user | **Annual margin/user** | **Margin %**      |
| ------------- | ------------------- | ---------------- | ---------------------- | ----------------- |
| Free          | $0                  | $8.28            | **-$8.28**             | N/A (loss leader) |
| Pro (annual)  | $102                | $56.16           | **$45.84**             | **45%**           |
| Pro (monthly) | $114                | $56.16           | **$57.84**             | **51%**           |
| Max (annual)  | $174                | $111.36          | **$62.64**             | **36%**           |
| Max (monthly) | $186                | $111.36          | **$74.64**             | **40%**           |
| Enterprise    | $300                | $111.36          | **$188.64**            | **63%**           |

### With Groq Batch API (50% off LLM)

| Plan         | Annual revenue/user | Annual cost/user (batch) | **Annual margin/user** | **Margin %** |
| ------------ | ------------------- | ------------------------ | ---------------------- | ------------ |
| Pro (annual) | $102                | $53.52                   | **$48.48**             | **48%**      |
| Max (annual) | $174                | $108.72                  | **$65.28**             | **38%**      |

---

## 6. Scenario Analysis

### Scenario 1: 1,000 Users

**User Distribution:**

| Plan       | Users | %   |
| ---------- | ----- | --- |
| Free       | 600   | 60% |
| Pro        | 300   | 30% |
| Max        | 80    | 8%  |
| Enterprise | 20    | 2%  |

**Monthly Costs:**

| Service                | Calculation                        | Monthly Cost |
| ---------------------- | ---------------------------------- | ------------ |
| Skribby (Free)         | 600 × 1.5 hrs × $0.39              | $351         |
| Skribby (Pro)          | 300 × 11.25 hrs × $0.39            | $1,316       |
| Skribby (Max)          | 80 × 22.5 hrs × $0.39              | $702         |
| Skribby (Enterprise)   | 20 × 22.5 hrs × $0.39              | $176         |
| **Skribby subtotal**   |                                    | **$2,545**   |
| Groq (all users)       | 9,300 mtgs × $0.0145 + AI features | $143         |
| DynamoDB               | 3M writes + 15M reads + 50GB       | $19          |
| S3                     | 500GB storage + requests           | $12          |
| CloudFront             | 200GB transfer + 2M requests       | $19          |
| Clerk                  | 1,000 MAU (free tier)              | $0           |
| Hosting                | Lambda + Route53                   | $17          |
| **Total monthly cost** |                                    | **$2,755**   |
| **Total annual cost**  |                                    | **$33,060**  |

**Monthly Revenue:**

| Plan                      | Users | Price/mo | Revenue     |
| ------------------------- | ----- | -------- | ----------- |
| Free                      | 600   | $0       | $0          |
| Pro (annual)              | 300   | $8.50    | $2,550      |
| Max (annual)              | 80    | $14.50   | $1,160      |
| Enterprise                | 20    | $25.00   | $500        |
| **Total monthly revenue** |       |          | **$4,210**  |
| **Total annual revenue**  |       |          | **$50,520** |

**Profit & Loss:**

| Metric                          | Monthly             | Annual            |
| ------------------------------- | ------------------- | ----------------- |
| Revenue                         | $4,210              | $50,520           |
| Costs                           | $2,755              | $33,060           |
| **Gross profit**                | **$1,455**          | **$17,460**       |
| **Gross margin**                | **35%**             | **35%**           |
| Free tier cost (CAC)            | $351 + $4 = $355/mo | $4,260/yr         |
| **Net margin (excl. free CAC)** | **$1,810 (43%)**    | **$21,720 (43%)** |

---

### Scenario 2: 5,000 Users

**User Distribution:**

| Plan       | Users | %   |
| ---------- | ----- | --- |
| Free       | 3,000 | 60% |
| Pro        | 1,500 | 30% |
| Max        | 400   | 8%  |
| Enterprise | 100   | 2%  |

**Monthly Costs:**

| Service                    | Calculation                 | Monthly Cost |
| -------------------------- | --------------------------- | ------------ |
| Skribby (Free)             | 3,000 × 1.5 hrs × $0.39     | $1,755       |
| Skribby (Pro)              | 1,500 × 11.25 hrs × $0.39   | $6,581       |
| Skribby (Max)              | 400 × 22.5 hrs × $0.39      | $3,510       |
| Skribby (Enterprise)       | 100 × 22.5 hrs × $0.39      | $878         |
| **Skribby subtotal**       |                             | **$12,724**  |
| Groq (with Batch API)      | 46,500 mtgs × $0.0073 + AI  | $367         |
| DynamoDB (provisioned)     | Switched from on-demand     | $30          |
| S3 (with 30-day lifecycle) | Auto-delete old audio       | $10          |
| CloudFront                 | 1TB transfer + 10M requests | $80          |
| Clerk                      | 5,000 MAU (free tier)       | $0           |
| Hosting                    | Scaled Lambda               | $60          |
| **Total monthly cost**     |                             | **$13,271**  |
| **Total annual cost**      |                             | **$159,252** |

**Monthly Revenue:**

| Plan                      | Users | Price/mo | Revenue      |
| ------------------------- | ----- | -------- | ------------ |
| Free                      | 3,000 | $0       | $0           |
| Pro (annual)              | 1,500 | $8.50    | $12,750      |
| Max (annual)              | 400   | $14.50   | $5,800       |
| Enterprise                | 100   | $25.00   | $2,500       |
| **Total monthly revenue** |       |          | **$21,050**  |
| **Total annual revenue**  |       |          | **$252,600** |

**Profit & Loss:**

| Metric                          | Monthly          | Annual             |
| ------------------------------- | ---------------- | ------------------ |
| Revenue                         | $21,050          | $252,600           |
| Costs                           | $13,271          | $159,252           |
| **Gross profit**                | **$7,779**       | **$93,348**        |
| **Gross margin**                | **37%**          | **37%**            |
| Free tier cost (CAC)            | $1,759/mo        | $21,108/yr         |
| **Net margin (excl. free CAC)** | **$9,538 (45%)** | **$114,456 (45%)** |

**Note:** At 5K users, negotiate Skribby volume pricing (Pay As You Go+). A 20% discount on Skribby saves ~$2,545/mo, boosting margin to 49%.

---

### Scenario 3: 10,000 Users

**User Distribution:**

| Plan       | Users | %   |
| ---------- | ----- | --- |
| Free       | 6,000 | 60% |
| Pro        | 3,000 | 30% |
| Max        | 800   | 8%  |
| Enterprise | 200   | 2%  |

**Monthly Costs:**

| Service                           | Calculation                  | Monthly Cost |
| --------------------------------- | ---------------------------- | ------------ |
| Skribby (Free)                    | 6,000 × 1.5 hrs × $0.39      | $3,510       |
| Skribby (Pro)                     | 3,000 × 11.25 hrs × $0.39    | $13,163      |
| Skribby (Max)                     | 800 × 22.5 hrs × $0.39       | $7,020       |
| Skribby (Enterprise)              | 200 × 22.5 hrs × $0.39       | $1,755       |
| **Skribby subtotal**              |                              | **$25,448**  |
| Groq (with Batch API)             | 93,000 mtgs × $0.0073 + AI   | $734         |
| DynamoDB (provisioned + reserved) | 3yr reserved capacity        | $80          |
| S3 (with lifecycle)               | 2TB → lifecycle to 200GB     | $30          |
| CloudFront                        | 2TB transfer + 20M requests  | $160         |
| Clerk                             | 10,000 MAU (still free tier) | $0           |
| Hosting                           | Scaled Lambda + multi-region | $120         |
| **Total monthly cost**            |                              | **$26,572**  |
| **Total annual cost**             |                              | **$318,864** |

**Monthly Revenue:**

| Plan                      | Users | Price/mo | Revenue      |
| ------------------------- | ----- | -------- | ------------ |
| Free                      | 6,000 | $0       | $0           |
| Pro (annual)              | 3,000 | $8.50    | $25,500      |
| Max (annual)              | 800   | $14.50   | $11,600      |
| Enterprise                | 200   | $25.00   | $5,000       |
| **Total monthly revenue** |       |          | **$42,100**  |
| **Total annual revenue**  |       |          | **$505,200** |

**Profit & Loss:**

| Metric                          | Monthly           | Annual             |
| ------------------------------- | ----------------- | ------------------ |
| Revenue                         | $42,100           | $505,200           |
| Costs                           | $26,572           | $318,864           |
| **Gross profit**                | **$15,528**       | **$186,336**       |
| **Gross margin**                | **37%**           | **37%**            |
| Free tier cost (CAC)            | $3,514/mo         | $42,168/yr         |
| **Net margin (excl. free CAC)** | **$19,042 (45%)** | **$228,504 (45%)** |

---

## 7. Scenario Comparison

### Side-by-Side

| Metric                      | 1K users  | 5K users  | 10K users |
| --------------------------- | --------- | --------- | --------- |
| **Monthly revenue**         | $4,210    | $21,050   | $42,100   |
| **Monthly costs**           | $2,755    | $13,271   | $26,572   |
| **Monthly profit**          | $1,455    | $7,779    | $15,528   |
| **Gross margin**            | 35%       | 37%       | 37%       |
| **Annual revenue**          | $50,520   | $252,600  | $505,200  |
| **Annual costs**            | $33,060   | $159,252  | $318,864  |
| **Annual profit**           | $17,460   | $93,348   | $186,336  |
| **Skribby % of costs**      | 92%       | 96%       | 96%       |
| **Cost per paying user**    | $6.89     | $6.64     | $6.64     |
| **Revenue per paying user** | $10.53    | $10.53    | $10.53    |
| **Break-even users**        | ~720 paid | ~720 paid | ~720 paid |

### Cost Composition (All Scenarios)

| Service            | 1K           | 5K            | 10K           |
| ------------------ | ------------ | ------------- | ------------- |
| Skribby            | $2,545 (92%) | $12,724 (96%) | $25,448 (96%) |
| Groq               | $143 (5%)    | $367 (3%)     | $734 (3%)     |
| AWS (Dynamo+S3+CF) | $50 (2%)     | $120 (1%)     | $270 (1%)     |
| Hosting            | $17 (1%)     | $60 (0.5%)    | $120 (0.5%)   |
| Clerk              | $0           | $0            | $0            |

---

## 8. Break-Even Analysis

### Break-Even Point

| Scenario                  | Break-even paid users | Break-even total users (60% free) |
| ------------------------- | --------------------- | --------------------------------- |
| Current costs             | 720                   | 1,800                             |
| With Skribby 20% discount | 610                   | 1,525                             |
| With own bot (no Skribby) | 110                   | 275                               |
| With own bot + Groq Batch | 95                    | 238                               |

### Impact of Building Own Bot

| Metric                | With Skribby (1K) | Own Bot (1K)                | Savings   |
| --------------------- | ----------------- | --------------------------- | --------- |
| Skribby/Bot cost      | $2,545/mo         | $279/mo (Groq Whisper only) | $2,266/mo |
| Total monthly cost    | $2,755/mo         | $489/mo                     | $2,266/mo |
| Gross margin          | 35%               | **89%**                     | +54pp     |
| Break-even paid users | 720               | 110                         | -610      |

**Building own bot is the single highest-impact cost reduction.**

---

## 9. Cost Optimization Roadmap

### Phase 1: Immediate (0-150 users)

- Use Skribby as-is (low volume, manageable cost)
- Use Groq on-demand pricing
- DynamoDB on-demand mode
- S3 standard storage

### Phase 2: Near-term (150-500 users)

- **Build own meeting bot** → saves ~90% of Skribby cost
- Enable **Groq Batch API** for async calls → 50% off LLM
- Implement **S3 lifecycle policy** (auto-delete audio after 30 days)
- Switch DynamoDB to **provisioned capacity** with auto-scaling

### Phase 3: Mid-term (500-2,000 users)

- Negotiate **Skribby Pay As You Go+** custom pricing (if still using)
- **DynamoDB Reserved Capacity** (1-year or 3-year) → 53-77% savings
- CloudFront **price tier optimization** (use lower-cost edge locations)
- Implement **audio compression** before S3 upload

### Phase 4: Long-term (2,000+ users)

- Multi-region deployment for lower latency
- Custom Whisper deployment on own GPU instances
- Enterprise contracts with custom infrastructure
- Consider **Deepgram direct** for transcription (cheaper at high volume)

---

## 10. Risk Analysis

### Cost Risks

| Risk                                                | Impact                          | Mitigation                                          |
| --------------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| Skribby raises prices                               | +10-30% on biggest cost line    | Build own bot before 150 users                      |
| Free tier abuse (users creating multiple free orgs) | $0.69/mo per fake user          | Rate limit by IP/device, require verification       |
| Meeting length increases (60+ min avg)              | +33% Skribby cost per meeting   | Cap meeting recording duration on free tier         |
| Groq raises prices                                  | +$0.02-0.05 per meeting         | Switch to self-hosted Llama or alternative provider |
| AWS price changes                                   | Minimal (AWS prices trend down) | Monitor, use reserved capacity                      |

### Revenue Risks

| Risk                                | Impact                      | Mitigation                               |
| ----------------------------------- | --------------------------- | ---------------------------------------- |
| Lower conversion rate (free → paid) | <30% paid = thinner margins | Improve onboarding, trial-to-paid funnel |
| Users downgrade from Pro to Free    | Revenue drop                | Annual billing locks in commitment       |
| Competitor price cuts               | Pressure to lower prices    | Differentiate on AI features, not price  |
| High churn rate                     | CAC wasted                  | Improve retention, engagement features   |

---

## 11. Key Metrics to Track

### Monthly KPIs

| Metric                           | Target           | Alert if                   |
| -------------------------------- | ---------------- | -------------------------- |
| MAU (Monthly Active Users)       | Growing 10%+ MoM | Flat or declining          |
| Free → Paid conversion           | >30%             | <20%                       |
| Meeting hours per paid user      | 11+ hrs/mo       | <8 hrs/mo (low engagement) |
| Skribby cost per paid user       | < $5/mo          | > $7/mo                    |
| Gross margin                     | >35%             | <25%                       |
| Churn rate                       | <5% monthly      | >10%                       |
| ARPU (Avg Revenue Per Paid User) | >$10/mo          | <$8/mo                     |

### Infrastructure KPIs

| Metric                    | Target              | Alert if                             |
| ------------------------- | ------------------- | ------------------------------------ |
| Skribby bot hours/mo      | < 80% of budget     | > 90%                                |
| Groq tokens/mo            | Track for anomalies | > 2x previous month                  |
| DynamoDB read/write ratio | 5:1 (healthy)       | < 2:1 (write-heavy)                  |
| S3 storage growth         | < 10% MoM           | > 20% MoM (check for orphaned audio) |
| Lambda cold starts        | < 5% of requests    | > 15%                                |

---

## 12. Competitive Positioning

| Competitor      | Entry paid price | Syntheon equivalent | Delta   |
| --------------- | ---------------- | ------------------- | ------- |
| Linear Standard | $8/user/mo       | Pro $8.50           | +$0.50  |
| Jira Standard   | $7.91/user/mo    | Pro $8.50           | +$0.59  |
| Jira Premium    | $14.54/user/mo   | Max $14.50          | -$0.04  |
| Asana Starter   | $10.99/user/mo   | Pro $8.50           | -$2.49  |
| Asana Advanced  | $24.99/user/mo   | Max $14.50          | -$10.49 |

**Syntheon is cheaper than Asana at every tier, cheaper than Jira Premium, and within $0.50 of Linear.** The AI meeting-to-ticket pipeline is the differentiator that justifies the price.

---

_This document should be updated quarterly as costs, pricing, and usage patterns evolve._
