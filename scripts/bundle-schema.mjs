import fs from 'node:fs'
import path from 'node:path'

const migrationsDir = path.resolve(import.meta.dirname, '../supabase/migrations')
const outputFile = path.resolve(import.meta.dirname, '../supabase/full_schema.sql')

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

let combined = '-- ========================================================\n'
combined += '-- SCRAP MITRA: COMPLETE DATABASE SCHEMA (ALL 12 MIGRATIONS)\n'
combined += '-- ========================================================\n\n'

for (const file of files) {
  combined += `-- >>>>> START MIGRATION: ${file} <<<<<\n`
  combined += fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
  combined += `\n-- >>>>> END MIGRATION: ${file} <<<<<\n\n`
}

fs.writeFileSync(outputFile, combined, 'utf-8')
console.log(`Generated ${outputFile} with ${files.length} migrations.`)

