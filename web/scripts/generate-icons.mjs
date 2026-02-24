/**
 * Script para gerar os ícones do PWA.
 * Executar uma vez após configurar o ambiente:
 *   node scripts/generate-icons.mjs
 *
 * Requer: npm install sharp (apenas para geração dos ícones)
 */

import { createCanvas } from "canvas"
import { writeFileSync, mkdirSync } from "fs"
import path from "path"

const sizes = [192, 512]
const outputDir = path.join(process.cwd(), "public/icons")

mkdirSync(outputDir, { recursive: true })

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext("2d")

  // Background
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, "#4f46e5")
  gradient.addColorStop(1, "#7c3aed")

  const radius = size * 0.2
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.arcTo(size, 0, size, radius, radius)
  ctx.lineTo(size, size - radius)
  ctx.arcTo(size, size, size - radius, size, radius)
  ctx.lineTo(radius, size)
  ctx.arcTo(0, size, 0, size - radius, radius)
  ctx.lineTo(0, radius)
  ctx.arcTo(0, 0, radius, 0, radius)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  // Lightning bolt (⚡)
  ctx.fillStyle = "white"
  ctx.font = `bold ${size * 0.5}px serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("⚡", size / 2, size / 2)

  writeFileSync(path.join(outputDir, `icon-${size}.png`), canvas.toBuffer("image/png"))
  console.log(`✓ icon-${size}.png gerado`)
}
