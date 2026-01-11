import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock Database ve ProductModel
const mockDatabase = {
    write: jest.fn(),
    read: jest.fn(),
    remove: jest.fn()
};

const mockProductModel = {
    create: jest.fn()
};

// Mock'ları module seviyesinde tanımla
jest.unstable_mockModule('../../database/database.js', () => ({
    default: jest.fn(() => mockDatabase)
}));

jest.unstable_mockModule('../../models/product.js', () => ({
    default: jest.fn(() => mockProductModel)
}));

// ProductService'i import et (mock'lardan sonra)
const { default: ProductService } = await import('../../services/product-service.js');

describe('ProductService', () => {
    let productService;
    const PRODUCT_DATABASE = join(__dirname, '../../database/data/product.data.json');

    beforeEach(() => {
        // Her test öncesi yeni bir instance oluştur ve mock'ları temizle
        productService = new ProductService();
        jest.clearAllMocks();
    });

    describe('createProduct', () => {
        it('should create a new product successfully', async () => {
            // Arrange
            const productData = {
                name: 'Laptop',
                description: 'High-performance laptop',
                price: 1500.00,
                stock: 50
            };

            const createdProduct = {
                id: 1234567890,
                ...productData,
                categories: []
            };

            mockProductModel.create.mockReturnValue(createdProduct);
            mockDatabase.write.mockResolvedValue({ 
                status: 200, 
                message: 'Data successfully written' 
            });

            // Act
            const result = await productService.createProduct(productData);

            // Assert
            expect(mockProductModel.create).toHaveBeenCalledWith(productData);
            expect(mockDatabase.write).toHaveBeenCalledWith(PRODUCT_DATABASE, createdProduct);
            expect(result).toEqual({ 
                status: 200, 
                message: 'Data successfully written' 
            });
        });

        it('should handle database write errors', async () => {
            // Arrange
            const productData = {
                name: 'Smartphone',
                description: 'Latest model smartphone',
                price: 899.99,
                stock: 100
            };

            const createdProduct = {
                id: 9876543210,
                ...productData,
                categories: []
            };

            mockProductModel.create.mockReturnValue(createdProduct);
            mockDatabase.write.mockResolvedValue({ 
                status: 500, 
                message: 'Error writing data',
                error: 'File system error'
            });

            // Act
            const result = await productService.createProduct(productData);

            // Assert
            expect(result.status).toBe(500);
            expect(result.message).toBe('Error writing data');
        });

        it('should handle duplicate id errors', async () => {
            // Arrange
            const productData = {
                name: 'Tablet',
                description: '10-inch tablet',
                price: 399.99,
                stock: 75
            };

            const createdProduct = {
                id: 1111111111,
                ...productData,
                categories: []
            };

            mockProductModel.create.mockReturnValue(createdProduct);
            mockDatabase.write.mockResolvedValue({ 
                status: 409, 
                message: 'Duplicate id: 1111111111 already exists' 
            });

            // Act
            const result = await productService.createProduct(productData);

            // Assert
            expect(result.status).toBe(409);
            expect(result.message).toContain('Duplicate id');
        });

        it('should create product with zero stock', async () => {
            // Arrange
            const productData = {
                name: 'Out of Stock Item',
                description: 'Currently unavailable',
                price: 99.99,
                stock: 0
            };

            const createdProduct = {
                id: 5555555555,
                ...productData,
                categories: []
            };

            mockProductModel.create.mockReturnValue(createdProduct);
            mockDatabase.write.mockResolvedValue({ 
                status: 200, 
                message: 'Data successfully written' 
            });

            // Act
            const result = await productService.createProduct(productData);

            // Assert
            expect(result.status).toBe(200);
            expect(mockDatabase.write).toHaveBeenCalledWith(PRODUCT_DATABASE, createdProduct);
        });

        it('should create product with very high price', async () => {
            // Arrange
            const productData = {
                name: 'Luxury Item',
                description: 'Premium product',
                price: 999999.99,
                stock: 1
            };

            const createdProduct = {
                id: 6666666666,
                ...productData,
                categories: []
            };

            mockProductModel.create.mockReturnValue(createdProduct);
            mockDatabase.write.mockResolvedValue({ 
                status: 200, 
                message: 'Data successfully written' 
            });

            // Act
            const result = await productService.createProduct(productData);

            // Assert
            expect(result.status).toBe(200);
        });
    });

    describe('getProducts', () => {
        it('should return all products successfully', async () => {
            // Arrange
            const mockProducts = [
                {
                    id: 1234567890,
                    name: 'Laptop',
                    description: 'High-performance laptop',
                    price: 1500.00,
                    stock: 50,
                    categories: []
                },
                {
                    id: 9876543210,
                    name: 'Smartphone',
                    description: 'Latest model',
                    price: 899.99,
                    stock: 100,
                    categories: []
                },
                {
                    id: 5555555555,
                    name: 'Tablet',
                    description: '10-inch display',
                    price: 399.99,
                    stock: 75,
                    categories: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockProducts);

            // Act
            const result = await productService.getProducts();

            // Assert
            expect(mockDatabase.read).toHaveBeenCalledWith(PRODUCT_DATABASE);
            expect(result).toEqual(mockProducts);
            expect(result).toHaveLength(3);
        });

        it('should return empty array when no products exist', async () => {
            // Arrange
            mockDatabase.read.mockResolvedValue([]);

            // Act
            const result = await productService.getProducts();

            // Assert
            expect(mockDatabase.read).toHaveBeenCalledWith(PRODUCT_DATABASE);
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should return products with different price ranges', async () => {
            // Arrange
            const mockProducts = [
                { id: 1111111111, name: 'Budget Item', description: 'Affordable', price: 9.99, stock: 200, categories: [] },
                { id: 2222222222, name: 'Mid-Range Item', description: 'Good value', price: 249.99, stock: 100, categories: [] },
                { id: 3333333333, name: 'Premium Item', description: 'High-end', price: 1999.99, stock: 10, categories: [] }
            ];

            mockDatabase.read.mockResolvedValue(mockProducts);

            // Act
            const result = await productService.getProducts();

            // Assert
            expect(result).toHaveLength(3);
            expect(result[0].price).toBe(9.99);
            expect(result[2].price).toBe(1999.99);
        });
    });

    describe('getProductById', () => {
        it('should return product when found by id', async () => {
            // Arrange
            const targetId = 1234567890;
            const mockProducts = [
                {
                    id: 1234567890,
                    name: 'Laptop',
                    description: 'High-performance laptop',
                    price: 1500.00,
                    stock: 50,
                    categories: []
                },
                {
                    id: 9876543210,
                    name: 'Smartphone',
                    description: 'Latest model',
                    price: 899.99,
                    stock: 100,
                    categories: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockProducts);

            // Act
            const result = await productService.getProductById(targetId);

            // Assert
            expect(mockDatabase.read).toHaveBeenCalledWith(PRODUCT_DATABASE);
            expect(result).toEqual(mockProducts[0]);
            expect(result.id).toBe(targetId);
            expect(result.name).toBe('Laptop');
        });

        it('should return undefined when product not found', async () => {
            // Arrange
            const nonExistentId = 9999999999;
            const mockProducts = [
                {
                    id: 1234567890,
                    name: 'Laptop',
                    description: 'High-performance laptop',
                    price: 1500.00,
                    stock: 50,
                    categories: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockProducts);

            // Act
            const result = await productService.getProductById(nonExistentId);

            // Assert
            expect(result).toBeUndefined();
        });

        it('should handle empty database', async () => {
            // Arrange
            mockDatabase.read.mockResolvedValue([]);

            // Act
            const result = await productService.getProductById(1234567890);

            // Assert
            expect(result).toBeUndefined();
        });

        it('should find product with zero stock', async () => {
            // Arrange
            const targetId = 5555555555;
            const mockProducts = [
                {
                    id: 5555555555,
                    name: 'Out of Stock',
                    description: 'Unavailable',
                    price: 99.99,
                    stock: 0,
                    categories: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockProducts);

            // Act
            const result = await productService.getProductById(targetId);

            // Assert
            expect(result).toBeDefined();
            expect(result.stock).toBe(0);
        });
    });

    describe('deleteProductById', () => {
        it('should delete product successfully', async () => {
            // Arrange
            const productId = 1234567890;
            mockDatabase.remove.mockResolvedValue({ 
                status: 200, 
                message: 'Item successfully removed' 
            });

            // Act
            const result = await productService.deleteProductById(productId);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledWith(PRODUCT_DATABASE, productId);
            expect(result.status).toBe(200);
            expect(result.message).toContain('successfully removed');
        });

        it('should handle product not found error', async () => {
            // Arrange
            const nonExistentId = 9999999999;
            mockDatabase.remove.mockResolvedValue({ 
                status: 404, 
                message: `Item with id ${nonExistentId} not found` 
            });

            // Act
            const result = await productService.deleteProductById(nonExistentId);

            // Assert
            expect(result.status).toBe(404);
            expect(result.message).toContain('not found');
        });

        it('should handle database file not found error', async () => {
            // Arrange
            const productId = 1234567890;
            mockDatabase.remove.mockResolvedValue({ 
                status: 404, 
                message: 'File not found' 
            });

            // Act
            const result = await productService.deleteProductById(productId);

            // Assert
            expect(result.status).toBe(404);
        });
    });

    describe('deleteProducts', () => {
        it('should delete multiple products successfully', async () => {
            // Arrange
            const productIds = [1234567890, 9876543210, 5555555555];
            mockDatabase.remove
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' })
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' })
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' });

            // Act
            const result = await productService.deleteProducts(productIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(3);
            expect(result.status).toBe(200);
            expect(result.message).toContain('Attempted to delete 3 products');
            expect(result.results).toHaveLength(3);
            expect(result.results[0].id).toBe(1234567890);
            expect(result.results[1].id).toBe(9876543210);
            expect(result.results[2].id).toBe(5555555555);
        });

        it('should handle mixed success and failure results', async () => {
            // Arrange
            const productIds = [1234567890, 9999999999, 5555555555];
            mockDatabase.remove
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' })
                .mockResolvedValueOnce({ status: 404, message: 'Item with id 9999999999 not found' })
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' });

            // Act
            const result = await productService.deleteProducts(productIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(3);
            expect(result.status).toBe(200);
            expect(result.results).toHaveLength(3);
            expect(result.results[0].result.status).toBe(200);
            expect(result.results[1].result.status).toBe(404);
            expect(result.results[2].result.status).toBe(200);
        });

        it('should return error when ids is not an array', async () => {
            // Act
            const result = await productService.deleteProducts('not-an-array');

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
            expect(mockDatabase.remove).not.toHaveBeenCalled();
        });

        it('should return error when ids array is empty', async () => {
            // Act
            const result = await productService.deleteProducts([]);

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
            expect(mockDatabase.remove).not.toHaveBeenCalled();
        });

        it('should return error when ids is null', async () => {
            // Act
            const result = await productService.deleteProducts(null);

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
        });

        it('should return error when ids is undefined', async () => {
            // Act
            const result = await productService.deleteProducts(undefined);

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
        });

        it('should handle single id in array', async () => {
            // Arrange
            const productIds = [1234567890];
            mockDatabase.remove.mockResolvedValue({ 
                status: 200, 
                message: 'Item successfully removed' 
            });

            // Act
            const result = await productService.deleteProducts(productIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(1);
            expect(result.status).toBe(200);
            expect(result.results).toHaveLength(1);
        });

        it('should handle all products not found', async () => {
            // Arrange
            const productIds = [9999999991, 9999999992, 9999999993];
            mockDatabase.remove
                .mockResolvedValueOnce({ status: 404, message: 'Item with id 9999999991 not found' })
                .mockResolvedValueOnce({ status: 404, message: 'Item with id 9999999992 not found' })
                .mockResolvedValueOnce({ status: 404, message: 'Item with id 9999999993 not found' });

            // Act
            const result = await productService.deleteProducts(productIds);

            // Assert
            expect(result.status).toBe(200);
            expect(result.results.every(r => r.result.status === 404)).toBe(true);
        });
    });

    describe('Edge Cases and Integration', () => {
        it('should handle concurrent product creation', async () => {
            // Arrange
            const product1 = {
                name: 'Product1',
                description: 'Test product 1',
                price: 100.00,
                stock: 50
            };

            const product2 = {
                name: 'Product2',
                description: 'Test product 2',
                price: 200.00,
                stock: 30
            };

            mockProductModel.create
                .mockReturnValueOnce({ id: 1111111111, ...product1, categories: [] })
                .mockReturnValueOnce({ id: 2222222222, ...product2, categories: [] });

            mockDatabase.write
                .mockResolvedValueOnce({ status: 200, message: 'Data successfully written' })
                .mockResolvedValueOnce({ status: 200, message: 'Data successfully written' });

            // Act
            const [result1, result2] = await Promise.all([
                productService.createProduct(product1),
                productService.createProduct(product2)
            ]);

            // Assert
            expect(result1.status).toBe(200);
            expect(result2.status).toBe(200);
            expect(mockDatabase.write).toHaveBeenCalledTimes(2);
        });

        it('should handle very large product catalog', async () => {
            // Arrange
            const largeProductList = Array.from({ length: 5000 }, (_, i) => ({
                id: 1000000000 + i,
                name: `Product${i}`,
                description: `Description for product ${i}`,
                price: 10.00 + (i * 0.5),
                stock: 10 + (i % 100),
                categories: []
            }));

            mockDatabase.read.mockResolvedValue(largeProductList);

            // Act
            const result = await productService.getProducts();

            // Assert
            expect(result).toHaveLength(5000);
            expect(result[0].name).toBe('Product0');
            expect(result[4999].name).toBe('Product4999');
        });

        it('should maintain data consistency after multiple operations', async () => {
            // Arrange - Create
            const productData = {
                name: 'Test Product',
                description: 'For testing',
                price: 99.99,
                stock: 25
            };
            
            const createdProduct = { id: 5555555555, ...productData, categories: [] };
            mockProductModel.create.mockReturnValue(createdProduct);
            mockDatabase.write.mockResolvedValue({ status: 200, message: 'Success' });
            
            // Act - Create
            await productService.createProduct(productData);
            
            // Arrange - Get
            mockDatabase.read.mockResolvedValue([createdProduct]);
            
            // Act - Get
            const products = await productService.getProducts();
            
            // Assert
            expect(products).toHaveLength(1);
            expect(products[0].id).toBe(5555555555);
            
            // Arrange - Delete
            mockDatabase.remove.mockResolvedValue({ status: 200, message: 'Removed' });
            
            // Act - Delete
            await productService.deleteProductById(5555555555);
            
            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledWith(PRODUCT_DATABASE, 5555555555);
        });

        it('should handle products with decimal prices', async () => {
            // Arrange
            const mockProducts = [
                { id: 1111111111, name: 'Item1', description: 'Desc1', price: 9.99, stock: 100, categories: [] },
                { id: 2222222222, name: 'Item2', description: 'Desc2', price: 19.95, stock: 50, categories: [] },
                { id: 3333333333, name: 'Item3', description: 'Desc3', price: 99.49, stock: 25, categories: [] }
            ];

            mockDatabase.read.mockResolvedValue(mockProducts);

            // Act
            const result = await productService.getProducts();

            // Assert
            expect(result.every(p => typeof p.price === 'number')).toBe(true);
            expect(result[0].price).toBe(9.99);
            expect(result[2].price).toBe(99.49);
        });

        it('should handle bulk deletion of 100 products', async () => {
            // Arrange
            const productIds = Array.from({ length: 100 }, (_, i) => 1000000000 + i);
            const mockRemoveResponses = productIds.map(id => ({
                status: 200,
                message: 'Item successfully removed'
            }));

            mockDatabase.remove.mockImplementation(() => 
                Promise.resolve(mockRemoveResponses.shift())
            );

            // Act
            const result = await productService.deleteProducts(productIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(100);
            expect(result.status).toBe(200);
            expect(result.message).toContain('Attempted to delete 100 products');
            expect(result.results).toHaveLength(100);
        });

        it('should handle product search by ID in large dataset', async () => {
            // Arrange
            const targetId = 1000002500;
            const largeProductList = Array.from({ length: 10000 }, (_, i) => ({
                id: 1000000000 + i,
                name: `Product${i}`,
                description: `Description ${i}`,
                price: 10.00 + i,
                stock: i % 100,
                categories: []
            }));

            mockDatabase.read.mockResolvedValue(largeProductList);

            // Act
            const result = await productService.getProductById(targetId);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(targetId);
            expect(result.name).toBe('Product2500');
        });
    });
});
