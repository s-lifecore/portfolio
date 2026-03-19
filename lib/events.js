import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'lib', 'events.json');

let events = [];
try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    events = JSON.parse(raw);
} catch (e) {
    events = [];
}

export default events;
