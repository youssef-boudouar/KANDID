const COLORS = [
    '#6366f1', '#3b82f6', '#0ea5e9', '#10b981',
    '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6',
    '#f97316', '#06b6d4', '#84cc16', '#ef4444',
    '#a855f7', '#64748b', '#0891b2', '#16a34a',
];

function hashName(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return Math.abs(h);
}

function getInitials(name) {
    if (!name) return '?';
    const p = name.trim().split(/\s+/);
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function Avatar({ name = '', size = 40, rounded = 'rounded-xl', className = '', colors = null, textColor = 'white' }) {
    const hash     = hashName(name || 'unknown');
    const bg       = colors ? colors[0] : COLORS[hash % COLORS.length];
    const initials = getInitials(name);
    const fontSize = Math.round(size * 0.38);
    const id       = `s${hash}`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <text
    x="50%" y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="'Plus Jakarta Sans', system-ui, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    letter-spacing="-0.5"
    fill="${textColor}"
    opacity="0.95"
  >${initials}</text>
</svg>`;

    const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    return (
        <img
            src={src}
            alt={initials}
            width={size}
            height={size}
            className={`shrink-0 select-none ${rounded} ${className}`}
        />
    );
}

export default Avatar;
