-- ==============================================================================
-- KnowledgeOS Seed Data: Acme Corp Demonstration Environment
-- Realistic SOPs, Pricing, Refund Policies, and HR Guidelines
-- ==============================================================================

-- 1. Organization
INSERT INTO organizations (id, name, slug, is_demo)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Acme Technologies Inc.',
    'acme-corp',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

-- 2. Users (Admin and Employee)
INSERT INTO user_profiles (id, organization_id, email, full_name, role, department)
VALUES 
(
    'u0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'sarah.chen@acme.corp',
    'Sarah Chen',
    'admin',
    'Executive'
),
(
    'u0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'alex.rivera@acme.corp',
    'Alex Rivera',
    'employee',
    'Engineering'
) ON CONFLICT DO NOTHING;

-- 3. Document Categories
INSERT INTO document_categories (id, organization_id, name, slug, description, color)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Standard Operating Procedures',
    'sop',
    'Step-by-step instructions for company processes and workflows',
    '#365C49'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Services and Pricing',
    'services-pricing',
    'Approved commercial service packages, tiers, and pricing rules',
    '#3B6D55'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Company Policies',
    'policies',
    'Official corporate guidelines, security, and employee standards',
    '#4E7D68'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Frequently Asked Questions',
    'faq',
    'Common inquiries regarding internal and external operations',
    '#5C8C76'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'Human Resources',
    'hr',
    'Benefits, leave, compensation, and onboarding procedures',
    '#6A9B84'
) ON CONFLICT DO NOTHING;

-- 4. Sample Documents & Chunks are seeded in demo memory store and can be imported to postgres
