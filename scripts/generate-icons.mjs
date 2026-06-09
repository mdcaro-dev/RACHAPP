import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { mkdirSync } from 'fs'

mkdirSync('./public', { recursive: true })

const svgIcon = (size) => {
  const rx = Math.round(size * 0.22)
  const borderW = Math.round(size * 0.031)
  const inset = Math.round(size * 0.016)
  const innerRx = rx - inset
  const fontSize = Math.round(size * 0.172)
  const y1 = Math.round(size * 0.508)
  const y2 = Math.round(size * 0.703)

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="clip">
      <rect width="${size}" height="${size}" rx="${rx}" ry="${rx}"/>
    </clipPath>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;display=swap');
    </style>
  </defs>
  <g clip-path="url(#clip)">
    <rect width="${size}" height="${size}" fill="#F9D34C"/>
    <rect x="${inset}" y="${inset}" width="${size - inset * 2}" height="${size - inset * 2}" rx="${innerRx}" ry="${innerRx}" fill="none" stroke="#000000" stroke-width="${borderW}"/>
    <text x="${size / 2}" y="${y1}" font-family="monospace" font-weight="bold" font-size="${fontSize}" fill="#000000" text-anchor="middle" dominant-baseline="middle">RACH</text>
    <text x="${size / 2}" y="${y2}" font-family="monospace" font-weight="bold" font-size="${fontSize}" fill="#0A80FE" text-anchor="middle" dominant-baseline="middle">APP</text>
  </g>
</svg>`
}

const sizes = [
  { size: 512, name: 'icon-512.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 180, name: 'apple-touch-icon.png' },
]

for (const { size, name } of sizes) {
  const svg = Buffer.from(svgIcon(size))
  await sharp(svg).png().toFile(`./public/${name}`)
  console.log(`✓ public/${name}`)
}
