import * as fs from 'fs';
import * as path from 'path';
import { ReferralData, UserData } from '../types';

// Интерфейс для структуры данных в файле
interface StoredData {
  referrals: ReferralData[];
  userReferrals: { [userId: number]: string };
  referredUsers: number[];
  users: { [userId: number]: UserData };
  lastUpdated: number;
}

// Сервис для сохранения и загрузки данных
export class DataStorageService {
  private readonly dataFilePath: string;
  private readonly backupDir: string;

  constructor() {
    this.dataFilePath = path.join(process.cwd(), 'data', 'bot_data.json');
    this.backupDir = path.join(process.cwd(), 'data', 'backups');
    this.ensureDirectoriesExist();
  }

  // Создание необходимых директорий
  private ensureDirectoriesExist(): void {
    const dataDir = path.dirname(this.dataFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Сохранение данных в файл
  saveData(data: StoredData): void {
    try {
      // Создаем резервную копию перед сохранением
      this.createBackup();
      
      // Обновляем время последнего обновления
      data.lastUpdated = Date.now();
      
      // Сохраняем данные в файл
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf8');
      
      // Убираем лишний лог
      // console.log('✅ Данные успешно сохранены в файл');
    } catch (error) {
      console.error('❌ Ошибка при сохранении данных:', error);
      throw error;
    }
  }

  // Загрузка данных из файла
  loadData(): StoredData {
    try {
      if (!fs.existsSync(this.dataFilePath)) {
        // console.log('📁 Файл данных не найден, создаю новый...');
        return this.getDefaultData();
      }

      const fileContent = fs.readFileSync(this.dataFilePath, 'utf8');
      const data: StoredData = JSON.parse(fileContent);
      
      // Убираем лишний лог
      // console.log('✅ Данные успешно загружены из файла');
      return data;
    } catch (error) {
      console.error('❌ Ошибка при загрузке данных:', error);
      // console.log('🔄 Создаю новые данные по умолчанию...');
      return this.getDefaultData();
    }
  }

  // Создание резервной копии
  private createBackup(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupDir, `backup_${timestamp}.json`);
        fs.copyFileSync(this.dataFilePath, backupPath);
        
        // Удаляем старые резервные копии (оставляем только последние 5)
        this.cleanOldBackups();
      }
    } catch (error) {
      console.error('⚠️ Не удалось создать резервную копию:', error);
    }
  }

  // Очистка старых резервных копий
  private cleanOldBackups(): void {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      // Удаляем все файлы кроме последних 5
      if (files.length > 5) {
        files.slice(5).forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('⚠️ Не удалось очистить старые резервные копии:', error);
    }
  }

  // Получение данных по умолчанию
  private getDefaultData(): StoredData {
    return {
      referrals: [],
      userReferrals: {},
      referredUsers: [],
      users: {},
      lastUpdated: Date.now()
    };
  }

  // Проверка целостности данных
  validateData(data: StoredData): boolean {
    try {
      // Проверяем наличие обязательных полей
      if (!data.referrals || !data.userReferrals || !data.referredUsers || !data.users) {
        return false;
      }

      // Проверяем типы данных
      if (!Array.isArray(data.referrals) || !Array.isArray(data.referredUsers)) {
        return false;
      }

      if (typeof data.userReferrals !== 'object' || typeof data.users !== 'object') {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  // Получение информации о файле данных
  getFileInfo(): { exists: boolean; size: number; lastModified: number } {
    try {
      if (!fs.existsSync(this.dataFilePath)) {
        return { exists: false, size: 0, lastModified: 0 };
      }

      const stats = fs.statSync(this.dataFilePath);
      return {
        exists: true,
        size: stats.size,
        lastModified: stats.mtime.getTime()
      };
    } catch (error) {
      console.error('❌ Ошибка при получении информации о файле:', error);
      return { exists: false, size: 0, lastModified: 0 };
    }
  }
}
