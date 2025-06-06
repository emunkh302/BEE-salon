// src/config/roles.ts

export enum UserRole {
    ADMIN = 'admin',
    CONTRACTOR = 'contractor',
    SUBCONTRACTOR = 'subcontractor',
    // Future roles can be added here easily:
    // SHOP_OWNER = 'shop_owner',
    // WAREHOUSE_OWNER = 'warehouse_owner',
}

// Optional: You can create an array of role values if needed elsewhere
export const ALL_ROLES: string[] = Object.values(UserRole);