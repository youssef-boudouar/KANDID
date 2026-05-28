/**
 * Returns a DiceBear avataaars URL.
 * sex: 'male' | 'female' | null (null = gender-neutral fallback style)
 * Same seed + sex always produces the same avatar.
 */
export function avatarUrl(seed, sex = null) {
    const clean = encodeURIComponent((seed || 'unknown').trim());
    // Boring Avatars "beam" — clean geometric abstract, used by real SaaS companies
    const colors = '0a0a0a,6366f1,8b5cf6,3b82f6,10b981';
    return `https://source.boringavatars.com/beam/80/${clean}?colors=${colors}&square=true`;
}
