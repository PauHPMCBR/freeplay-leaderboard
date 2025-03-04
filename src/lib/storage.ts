interface StorageService {
    upload(file: Buffer, filename: string): Promise<string>
    delete(filename: string): Promise<void>
  }
  
  // Implement dummy methods or actual logic
  class LocalStorage implements StorageService {
    async upload(_file: Buffer, _filename: string) {
      return 'dummy-path'
    }
    
    async delete(_filename: string) {
      // Implementation
    }
  }
  
  export const storage = new LocalStorage()