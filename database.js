import fs from 'fs';

export default class Database {
    saveUser(user) {
        fs.writeFileSync('user.data.json', JSON.stringify(user));
    }

    loadUser() {
        const data = fs.readFileSync('user.data.json', 'utf-8');
        return JSON.parse(data);
    }

    saveProduct(product) {
        fs.writeFileSync('product.data.json', JSON.stringify(product));
    }


    loadProduct() {
        const data = fs.readFileSync('product.data.json', 'utf-8');
        return JSON.parse(data);
    }

    saveCategory(category) {
        fs.writeFileSync('category.data.json', JSON.stringify(category));
    }

    loadCategory() {
        const data = fs.readFileSync('category.data.json', 'utf-8');
        return JSON.parse(data);
    }
}
