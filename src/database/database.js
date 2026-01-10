import fs from "fs";
import { generateId } from "./utils.js";

export default class Database {
    async write(file, data) {
        try {
            // Gelen veriyi array'e çevir (eğer değilse)
            const dataArray = Array.isArray(data) ? data : [data];
            
            let existingData = [];
            
            // Dosya varsa oku
            if (fs.existsSync(file)) {
                const fileContent = await fs.promises.readFile(file, 'utf-8');
                existingData = JSON.parse(fileContent);
            }
            
            // Mevcut ID'leri topla (collision kontrolü için)
            const existingIds = new Set(existingData.map(item => item.id));
            
            // Her item için ID kontrolü ve üretimi
            for (const item of dataArray) {
                // ID yoksa veya null/undefined ise üret
                if (item.id == null) {
                    // ID yoksa üret (collision-free)
                    let newId;
                    do {
                        newId = generateId();
                    } while (existingIds.has(newId));
                    
                    item.id = newId;
                    existingIds.add(newId);
                } else {
                    // Manuel ID verilmişse validation ve duplicate kontrolü
                    if (typeof item.id !== 'number' || item.id < 1000000000 || item.id > 9999999999) {
                        return { status: 400, message: `Invalid id: ${item.id}. ID must be a 10-digit number` };
                    }
                    if (existingIds.has(item.id)) {
                        return { status: 409, message: `Duplicate id: ${item.id} already exists` };
                    }
                    existingIds.add(item.id);
                }
            }
            
            // Mevcut veriyi de array olarak garanti et
            if (!Array.isArray(existingData)) {
                existingData = [];
            }
            
            // Yeni veriyi mevcut veriye ekle
            const updatedData = [...existingData, ...dataArray];
            
            // JSON dosyasına yaz
            await fs.promises.writeFile(file, JSON.stringify(updatedData, null, 2));
            
            return { status: 200, message: 'Data successfully written' };
        } catch (error) {
            return { status: 500, message: 'Error writing data', error: error.message };
        }
    }

    async read(file) {
        try {
            if (fs.existsSync(file)) {
                const data = await fs.promises.readFile(file, 'utf-8');
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            console.error('Error reading file:', error);
            return [];
        }
    }

    update(file, id, model, field, value) {
        // TODO: implement update method
    }

    async remove(file, id) {
        try {
            // Dosya yoksa hata döndür
            if (!fs.existsSync(file)) {
                return { status: 404, message: 'File not found' };
            }
            
            // Mevcut veriyi oku
            const existingData = await this.read(file);
            
            // ID'ye göre objeyi bul
            const itemIndex = existingData.findIndex(item => item.id === id);
            
            if (itemIndex === -1) {
                return { status: 404, message: `Item with id ${id} not found` };
            }
            
            // Objeyi çıkar
            const updatedData = existingData.filter(item => item.id !== id);
            
            // Güncellenmiş veriyi dosyaya yaz (doğrudan yaz, ekleme yapma)
            await fs.promises.writeFile(file, JSON.stringify(updatedData, null, 2));
            
            return { status: 200, message: `Item with id ${id} successfully removed` };
        } catch (error) {
            return { status: 500, message: 'Error removing data', error: error.message };
        }
    }
}