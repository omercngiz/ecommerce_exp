import fs from "fs";

export default class Database {
    read(file) {
        
    }

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
}