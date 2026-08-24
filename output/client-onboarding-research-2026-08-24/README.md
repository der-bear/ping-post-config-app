# LeadExec client onboarding research

Captured in the LeadExec demo account on 2026-08-24.

## Created demo records

- Client UID: `29635`
- Client: `Codex UX Research Client 2026-08-24`
- Client status: `New`
- Delivery Account: `Codex UX Research DA`
- Lead type: `Short Mortgage Lead`
- Delivery method: `HTTP Webhook`
- Automated delivery: off
- Default lead price: `$0.00`
- Delivery criterion: `State` → `Is Any Of` → `AZ`
- Order UID: `4456838`
- Order: `Codex UX Research Order 2026-08-24`
- Order status: `On Hold`
- Order item: all delivery accounts, quantity changed from `1` to `2`, total `$0.00`

## Key product observations

1. Manual client creation is a dynamic wizard: Contact Information → Delivery Method → optional Portal Login Information → Delivery Account.
2. Delivery Account creation is part of client creation, not a separate required post-create step.
3. Portal Login Information appears for Lead Portal delivery and disappears for HTTP Webhook.
4. The post-create Next Steps modal offers Create Lead Order, Set Up Delivery Criteria, and Edit Delivery Account.
5. The modal recommends an Order even when Require Order is disabled, so it does not adapt to the actual configuration.
6. Order editing uses a slide-out editor with General, Items, and Payments panels. Item changes save automatically.
7. Delivery Account editing uses General, Quantity Limits, Delivery, Revenue, Criteria, Offer, and Advanced panels. Criteria changes save automatically.

## Screenshot map

### Client creation

- `01-client-create-contact-information.png`
- `02-client-create-delivery-method.png`
- `03-client-create-portal-login.png`
- `04-client-create-delivery-method-webhook.png`
- `05-client-create-delivery-account.png`
- `06-client-created-next-steps.png`

### Order creation and editing

- `07-order-create-empty.png`
- `08-order-create-filled.png`
- `09-order-created-editor.png`
- `10-order-editor-items.png`
- `23-order-editor-general.png`
- `24-order-editor-items.png`
- `25-order-editor-payments.png`
- `26-order-item-edit-before.png`
- `27-order-item-edit-filled.png`
- `28-order-item-edited.png`

`11-order-editor-payments.png` is an accidental capture of the global Payments page and should not be used as a reference.

### Client detail tabs

- `12-client-detail-delivery-settings.png`
- `13-client-detail-contact.png`
- `14-client-detail-client-portal.png`
- `15-client-detail-other-information.png`
- `16-client-detail-billing.png`
- `17-client-detail-notes.png`
- `18-client-detail-orders.png`

### Main delivery and order screens

- `19-main-delivery-accounts.png`
- `20-main-delivery-methods.png`
- `21-main-distribution-assignments.png`
- `22-main-orders-on-hold.png`

### Delivery Account editor and criteria

- `29-delivery-account-editor-general.png`
- `30-delivery-account-quantity-limits.png`
- `31-delivery-account-delivery.png`
- `32-delivery-account-revenue.png`
- `33-delivery-account-offer.png`
- `34-delivery-account-advanced.png`
- `35-delivery-account-criteria-empty.png`
- `36-delivery-criterion-create-empty.png`
- `37-delivery-criterion-create-filled.png`
- `38-delivery-criterion-created.png`
