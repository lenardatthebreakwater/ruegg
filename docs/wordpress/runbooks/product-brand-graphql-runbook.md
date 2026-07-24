# Product Brand GraphQL Runbook

This note explains why the previous brand snippet broke WooCommerce brand behavior and how to enable GraphQL safely.

## Why the old snippet breaks brands

The old approach called:

```php
register_taxonomy($slug, ['product'], [
  'show_in_graphql' => true,
  'graphql_single_name' => 'productBrand',
  'graphql_plural_name' => 'productBrands',
]);
```

on an already-registered brand taxonomy.

Re-registering can override or reset plugin-owned taxonomy configuration (rewrite/query/admin args), which can break brand archive pages and brand product relationships.

## Safe approach

Use the `register_taxonomy_args` filter to modify only GraphQL args during registration.

Snippet file:

- `docs/wordpress/snippets/wordpress-pb-product-brand-graphql.php`

## Install

Use one method:

- `wp-content/mu-plugins/pb-product-brand-graphql.php` (recommended), or
- Code Snippets plugin (run everywhere)

## Optional taxonomy override

If both `product_brand` and `pwb-brand` exist in your stack, define the expected one in `wp-config.php`:

```php
define('PB_BRAND_TAXONOMY', 'pwb-brand');
```

This avoids GraphQL naming collisions in mixed or legacy plugin setups.
