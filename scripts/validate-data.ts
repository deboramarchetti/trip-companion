// Validates the itinerary before every build. Errors fail the build.
// Run: npm run validate
import { tripData } from '../src/data/trip';
import { sampleData } from '../src/data/sample';
import { validateTrip } from '../src/data/validate';

let failed = false;
for (const [name, data] of [['trip', tripData], ['sample (design preview)', sampleData]] as const) {
  const issues = validateTrip(data);
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  const missing = issues.filter((i) => i.level === 'missing');
  console.log(`\n▸ ${name}: ${data.days.length} days · ${errors.length} errors · ${warnings.length} warnings · ${missing.length} missing`);
  if (name !== 'trip') { if (errors.length) failed = true; errors.forEach((i) => console.log(`  ✖ ${i.where}: ${i.message}`)); continue; }
  for (const i of errors) console.log(`  ✖ ${i.where}: ${i.message}`);
  for (const i of warnings) console.log(`  ⚠ ${i.where}: ${i.message}`);
  for (const i of missing) console.log(`  · ${i.where}: ${i.message}`);
  if (errors.length) failed = true;
}
if (failed) { console.error('\nData validation failed.'); process.exit(1); }
console.log('\nData OK.');
