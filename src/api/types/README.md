# Database Types Structure

This directory contains the organized database types generated from Supabase.

## Structure

Each table in the database has its own `.db.ts` file with three type definitions:
- `Row`: Type for reading data from the database
- `Insert`: Type for inserting new records
- `Update`: Type for updating existing records

## Files

### Base Types
- `base.db.ts` - Contains the `Json` type used across tables

### Main Database Type
- `database.db.ts` - Combines all table types into the main `Database` type for Supabase client

### Table Types
- `user.db.ts` - User table types
- `role.db.ts` - Role table types
- `user-role.db.ts` - User-Role junction table
- `headquarters.db.ts` - Headquarters table types
- `project.db.ts` - Project table types
- `beneficiary.db.ts` - Beneficiary table types
- `donation.db.ts` - Donation table types
- `donation-report.db.ts` - Donation report types
- `testimonial.db.ts` - Testimonial table types
- `gallery-items.db.ts` - Gallery items types
- `bold-transactions.db.ts` - Bold payment transactions types
- `site-contents.db.ts` - Site content management types
- `headquarters-project.db.ts` - Headquarters-Project junction table

### Central Export
- `index.ts` - Central export point for all types. **Always import from here**.

## Usage

Import types from the central index:

```typescript
import type { Database, UserRow, ProjectInsert, DonationUpdate } from '@/api/types';
```

Or import specific types:

```typescript
import type { BeneficiaryRow } from '@/api/types';
```

## Legacy Types

The `index.ts` file also exports legacy application types for backward compatibility:
- `User`, `CreateUserData`, `UpdateUserData`
- `Player`, `CreatePlayerData`
- `Coach`, `CreateCoachData`
- `UserRole` (type alias)
- `SupabaseError`, `SupabaseResponse`

## Supabase Client

The Supabase client is typed with the `Database` type:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/api/types";

const client = createClient<Database>(url, key);
```

## Regenerating Types

If the database schema changes, regenerate types by updating the individual `.db.ts` files that correspond to the modified tables, then ensure `database.db.ts` includes those changes.
