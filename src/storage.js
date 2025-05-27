const fs = require('fs').promises;
const path = require('path');

class TimezoneStorage {
  constructor(filePath = path.join(__dirname, '..', 'data', 'timezones.json')) {
    this.filePath = filePath;
    this.data = new Map();
    this.isLoaded = false;
  }

  async ensureDataDir() {
    const dataDir = path.dirname(this.filePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async load() {
    if (this.isLoaded) return;

    await this.ensureDataDir();
    
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      this.data = new Map(Object.entries(jsonData));
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, start with empty data
        this.data = new Map();
      } else {
        console.error('Error loading timezone data:', error);
        this.data = new Map();
      }
    }
    
    this.isLoaded = true;
  }

  async save() {
    await this.ensureDataDir();
    
    try {
      const jsonData = Object.fromEntries(this.data);
      await fs.writeFile(this.filePath, JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.error('Error saving timezone data:', error);
    }
  }

  async set(userId, timezoneData) {
    await this.load();
    this.data.set(userId, timezoneData);
    await this.save();
  }

  async get(userId) {
    await this.load();
    return this.data.get(userId);
  }

  async getAll() {
    await this.load();
    return new Map(this.data);
  }

  async has(userId) {
    await this.load();
    return this.data.has(userId);
  }

  async delete(userId) {
    await this.load();
    const deleted = this.data.delete(userId);
    if (deleted) {
      await this.save();
    }
    return deleted;
  }

  async size() {
    await this.load();
    return this.data.size;
  }

  async clear() {
    this.data.clear();
    await this.save();
  }
}

module.exports = TimezoneStorage;