const fs = require('fs');
const readline = require('readline');

async function findStep299() {
  const fileStream = fs.createReadStream('C:/Users/USER/.gemini/antigravity/brain/c4118252-4ced-4b33-8439-266d16a1b9ac/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('"step_index":299') || line.includes('"step_index":264')) {
      const obj = JSON.parse(line);
      console.log('Step:', obj.step_index);
      fs.writeFileSync(`scratch/raw-data/log-step-${obj.step_index}.txt`, obj.content);
      console.log(`Saved scratch/raw-data/log-step-${obj.step_index}.txt`);
    }
  }
}

findStep299().catch(console.error);
