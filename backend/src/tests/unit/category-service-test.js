import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock Database ve CategoryModel
const mockDatabase = {
    write: jest.fn(),
    read: jest.fn(),
    remove: jest.fn()
};

const mockCategoryModel = {
    create: jest.fn()
};

// Mock'ları module seviyesinde tanımla
jest.unstable_mockModule('../../database/database.js', () => ({
    default: jest.fn(() => mockDatabase)
}));

jest.unstable_mockModule('../../models/category.js', () => ({
    default: jest.fn(() => mockCategoryModel)
}));

// CategoryService'i import et (mock'lardan sonra)
const { default: CategoryService } = await import('../../services/category-service.js');

describe('CategoryService', () => {
    let categoryService;
    const CATEGORY_DATABASE = join(__dirname, '../../database/data/category.data.json');

    beforeEach(() => {
        // Her test öncesi yeni bir instance oluştur ve mock'ları temizle
        categoryService = new CategoryService();
        jest.clearAllMocks();
    });

    describe('createCategory', () => {
        it('should create a new category successfully', async () => {
            // Arrange
            const categoryData = {
                name: 'Electronics',
                description: 'Electronic devices and accessories'
            };

            const createdCategory = {
                id: 1234567890,
                ...categoryData,
                products: []
            };

            mockCategoryModel.create.mockReturnValue(createdCategory);
            mockDatabase.write.mockResolvedValue({ 
                status: 200, 
                message: 'Data successfully written' 
            });

            // Act
            const result = await categoryService.createCategory(categoryData);

            // Assert
            expect(mockCategoryModel.create).toHaveBeenCalledWith(categoryData);
            expect(mockDatabase.write).toHaveBeenCalledWith(CATEGORY_DATABASE, createdCategory);
            expect(result).toEqual({ 
                status: 200, 
                message: 'Data successfully written' 
            });
        });

        it('should handle database write errors', async () => {
            // Arrange
            const categoryData = {
                name: 'Clothing',
                description: 'Fashion and apparel'
            };

            const createdCategory = {
                id: 9876543210,
                ...categoryData,
                products: []
            };

            mockCategoryModel.create.mockReturnValue(createdCategory);
            mockDatabase.write.mockResolvedValue({ 
                status: 500, 
                message: 'Error writing data',
                error: 'File system error'
            });

            // Act
            const result = await categoryService.createCategory(categoryData);

            // Assert
            expect(result.status).toBe(500);
            expect(result.message).toBe('Error writing data');
        });

        it('should handle duplicate id errors', async () => {
            // Arrange
            const categoryData = {
                name: 'Books',
                description: 'Books and magazines'
            };

            const createdCategory = {
                id: 1111111111,
                ...categoryData,
                products: []
            };

            mockCategoryModel.create.mockReturnValue(createdCategory);
            mockDatabase.write.mockResolvedValue({ 
                status: 409, 
                message: 'Duplicate id: 1111111111 already exists' 
            });

            // Act
            const result = await categoryService.createCategory(categoryData);

            // Assert
            expect(result.status).toBe(409);
            expect(result.message).toContain('Duplicate id');
        });

        it('should create category with empty description', async () => {
            // Arrange
            const categoryData = {
                name: 'Miscellaneous',
                description: ''
            };

            const createdCategory = {
                id: 5555555555,
                ...categoryData,
                products: []
            };

            mockCategoryModel.create.mockReturnValue(createdCategory);
            mockDatabase.write.mockResolvedValue({ 
                status: 200, 
                message: 'Data successfully written' 
            });

            // Act
            const result = await categoryService.createCategory(categoryData);

            // Assert
            expect(result.status).toBe(200);
            expect(mockDatabase.write).toHaveBeenCalledWith(CATEGORY_DATABASE, createdCategory);
        });

        it('should create category with long name', async () => {
            // Arrange
            const categoryData = {
                name: 'Home & Kitchen Appliances and Accessories for Modern Living',
                description: 'All home essentials'
            };

            const createdCategory = {
                id: 6666666666,
                ...categoryData,
                products: []
            };

            mockCategoryModel.create.mockReturnValue(createdCategory);
            mockDatabase.write.mockResolvedValue({ 
                status: 200, 
                message: 'Data successfully written' 
            });

            // Act
            const result = await categoryService.createCategory(categoryData);

            // Assert
            expect(result.status).toBe(200);
            expect(createdCategory.name.length).toBeGreaterThan(50);
        });
    });

    describe('getCategories', () => {
        it('should return all categories successfully', async () => {
            // Arrange
            const mockCategories = [
                {
                    id: 1234567890,
                    name: 'Electronics',
                    description: 'Electronic devices',
                    products: []
                },
                {
                    id: 9876543210,
                    name: 'Clothing',
                    description: 'Fashion items',
                    products: []
                },
                {
                    id: 5555555555,
                    name: 'Books',
                    description: 'Books and magazines',
                    products: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockCategories);

            // Act
            const result = await categoryService.getCategories();

            // Assert
            expect(mockDatabase.read).toHaveBeenCalledWith(CATEGORY_DATABASE);
            expect(result).toEqual(mockCategories);
            expect(result).toHaveLength(3);
        });

        it('should return empty array when no categories exist', async () => {
            // Arrange
            mockDatabase.read.mockResolvedValue([]);

            // Act
            const result = await categoryService.getCategories();

            // Assert
            expect(mockDatabase.read).toHaveBeenCalledWith(CATEGORY_DATABASE);
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should return categories with different structures', async () => {
            // Arrange
            const mockCategories = [
                { id: 1111111111, name: 'Cat1', description: 'Short', products: [] },
                { id: 2222222222, name: 'Category Two', description: 'Medium length description', products: [] },
                { id: 3333333333, name: 'Category Three', description: 'This is a very long description that contains a lot of information about the category', products: [] }
            ];

            mockDatabase.read.mockResolvedValue(mockCategories);

            // Act
            const result = await categoryService.getCategories();

            // Assert
            expect(result).toHaveLength(3);
            expect(result[0].description).toBe('Short');
            expect(result[2].description.length).toBeGreaterThan(50);
        });

        it('should return categories with products', async () => {
            // Arrange
            const mockCategories = [
                {
                    id: 1111111111,
                    name: 'Electronics',
                    description: 'Tech products',
                    products: [
                        { id: 1000000001, name: 'Laptop' },
                        { id: 1000000002, name: 'Phone' }
                    ]
                }
            ];

            mockDatabase.read.mockResolvedValue(mockCategories);

            // Act
            const result = await categoryService.getCategories();

            // Assert
            expect(result[0].products).toHaveLength(2);
        });
    });

    describe('getCategoryById', () => {
        it('should return category when found by id', async () => {
            // Arrange
            const targetId = 1234567890;
            const mockCategories = [
                {
                    id: 1234567890,
                    name: 'Electronics',
                    description: 'Electronic devices',
                    products: []
                },
                {
                    id: 9876543210,
                    name: 'Clothing',
                    description: 'Fashion items',
                    products: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockCategories);

            // Act
            const result = await categoryService.getCategoryById(targetId);

            // Assert
            expect(mockDatabase.read).toHaveBeenCalledWith(CATEGORY_DATABASE);
            expect(result).toEqual(mockCategories[0]);
            expect(result.id).toBe(targetId);
            expect(result.name).toBe('Electronics');
        });

        it('should return undefined when category not found', async () => {
            // Arrange
            const nonExistentId = 9999999999;
            const mockCategories = [
                {
                    id: 1234567890,
                    name: 'Electronics',
                    description: 'Electronic devices',
                    products: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockCategories);

            // Act
            const result = await categoryService.getCategoryById(nonExistentId);

            // Assert
            expect(result).toBeUndefined();
        });

        it('should handle empty database', async () => {
            // Arrange
            mockDatabase.read.mockResolvedValue([]);

            // Act
            const result = await categoryService.getCategoryById(1234567890);

            // Assert
            expect(result).toBeUndefined();
        });

        it('should find category with associated products', async () => {
            // Arrange
            const targetId = 5555555555;
            const mockCategories = [
                {
                    id: 5555555555,
                    name: 'Electronics',
                    description: 'Tech items',
                    products: [
                        { id: 1000000001, name: 'Laptop', price: 1500 },
                        { id: 1000000002, name: 'Mouse', price: 25 }
                    ]
                }
            ];

            mockDatabase.read.mockResolvedValue(mockCategories);

            // Act
            const result = await categoryService.getCategoryById(targetId);

            // Assert
            expect(result).toBeDefined();
            expect(result.products).toHaveLength(2);
            expect(result.products[0].name).toBe('Laptop');
        });
    });

    describe('deleteCategoryById', () => {
        it('should delete category successfully', async () => {
            // Arrange
            const categoryId = 1234567890;
            mockDatabase.remove.mockResolvedValue({ 
                status: 200, 
                message: 'Item successfully removed' 
            });

            // Act
            const result = await categoryService.deleteCategoryById(categoryId);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledWith(CATEGORY_DATABASE, categoryId);
            expect(result.status).toBe(200);
            expect(result.message).toContain('successfully removed');
        });

        it('should handle category not found error', async () => {
            // Arrange
            const nonExistentId = 9999999999;
            mockDatabase.remove.mockResolvedValue({ 
                status: 404, 
                message: `Item with id ${nonExistentId} not found` 
            });

            // Act
            const result = await categoryService.deleteCategoryById(nonExistentId);

            // Assert
            expect(result.status).toBe(404);
            expect(result.message).toContain('not found');
        });

        it('should handle database file not found error', async () => {
            // Arrange
            const categoryId = 1234567890;
            mockDatabase.remove.mockResolvedValue({ 
                status: 404, 
                message: 'File not found' 
            });

            // Act
            const result = await categoryService.deleteCategoryById(categoryId);

            // Assert
            expect(result.status).toBe(404);
        });
    });

    describe('deleteCategories', () => {
        it('should delete multiple categories successfully', async () => {
            // Arrange
            const categoryIds = [1234567890, 9876543210, 5555555555];
            mockDatabase.remove
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' })
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' })
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' });

            // Act
            const result = await categoryService.deleteCategories(categoryIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(3);
            expect(result.status).toBe(200);
            expect(result.message).toContain('Attempted to delete 3 categories');
            expect(result.results).toHaveLength(3);
            expect(result.results[0].id).toBe(1234567890);
            expect(result.results[1].id).toBe(9876543210);
            expect(result.results[2].id).toBe(5555555555);
        });

        it('should handle mixed success and failure results', async () => {
            // Arrange
            const categoryIds = [1234567890, 9999999999, 5555555555];
            mockDatabase.remove
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' })
                .mockResolvedValueOnce({ status: 404, message: 'Item with id 9999999999 not found' })
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' });

            // Act
            const result = await categoryService.deleteCategories(categoryIds);

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
            const result = await categoryService.deleteCategories('not-an-array');

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
            expect(mockDatabase.remove).not.toHaveBeenCalled();
        });

        it('should return error when ids array is empty', async () => {
            // Act
            const result = await categoryService.deleteCategories([]);

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
            expect(mockDatabase.remove).not.toHaveBeenCalled();
        });

        it('should return error when ids is null', async () => {
            // Act
            const result = await categoryService.deleteCategories(null);

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
        });

        it('should return error when ids is undefined', async () => {
            // Act
            const result = await categoryService.deleteCategories(undefined);

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
        });

        it('should handle single id in array', async () => {
            // Arrange
            const categoryIds = [1234567890];
            mockDatabase.remove.mockResolvedValue({ 
                status: 200, 
                message: 'Item successfully removed' 
            });

            // Act
            const result = await categoryService.deleteCategories(categoryIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(1);
            expect(result.status).toBe(200);
            expect(result.results).toHaveLength(1);
        });

        it('should handle all categories not found', async () => {
            // Arrange
            const categoryIds = [9999999991, 9999999992, 9999999993];
            mockDatabase.remove
                .mockResolvedValueOnce({ status: 404, message: 'Item with id 9999999991 not found' })
                .mockResolvedValueOnce({ status: 404, message: 'Item with id 9999999992 not found' })
                .mockResolvedValueOnce({ status: 404, message: 'Item with id 9999999993 not found' });

            // Act
            const result = await categoryService.deleteCategories(categoryIds);

            // Assert
            expect(result.status).toBe(200);
            expect(result.results.every(r => r.result.status === 404)).toBe(true);
        });

        it('should delete categories with large batch', async () => {
            // Arrange
            const categoryIds = Array.from({ length: 50 }, (_, i) => 1000000000 + i);
            const mockRemoveResponses = categoryIds.map(() => ({
                status: 200,
                message: 'Item successfully removed'
            }));

            mockDatabase.remove.mockImplementation(() => 
                Promise.resolve(mockRemoveResponses.shift())
            );

            // Act
            const result = await categoryService.deleteCategories(categoryIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(50);
            expect(result.status).toBe(200);
            expect(result.message).toContain('Attempted to delete 50 categories');
            expect(result.results).toHaveLength(50);
        });
    });

    describe('Edge Cases and Integration', () => {
        it('should handle concurrent category creation', async () => {
            // Arrange
            const category1 = {
                name: 'Category1',
                description: 'Test category 1'
            };

            const category2 = {
                name: 'Category2',
                description: 'Test category 2'
            };

            mockCategoryModel.create
                .mockReturnValueOnce({ id: 1111111111, ...category1, products: [] })
                .mockReturnValueOnce({ id: 2222222222, ...category2, products: [] });

            mockDatabase.write
                .mockResolvedValueOnce({ status: 200, message: 'Data successfully written' })
                .mockResolvedValueOnce({ status: 200, message: 'Data successfully written' });

            // Act
            const [result1, result2] = await Promise.all([
                categoryService.createCategory(category1),
                categoryService.createCategory(category2)
            ]);

            // Assert
            expect(result1.status).toBe(200);
            expect(result2.status).toBe(200);
            expect(mockDatabase.write).toHaveBeenCalledTimes(2);
        });

        it('should handle large category list', async () => {
            // Arrange
            const largeCategoryList = Array.from({ length: 1000 }, (_, i) => ({
                id: 1000000000 + i,
                name: `Category${i}`,
                description: `Description for category ${i}`,
                products: []
            }));

            mockDatabase.read.mockResolvedValue(largeCategoryList);

            // Act
            const result = await categoryService.getCategories();

            // Assert
            expect(result).toHaveLength(1000);
            expect(result[0].name).toBe('Category0');
            expect(result[999].name).toBe('Category999');
        });

        it('should maintain data consistency after multiple operations', async () => {
            // Arrange - Create
            const categoryData = {
                name: 'Test Category',
                description: 'For testing purposes'
            };
            
            const createdCategory = { id: 5555555555, ...categoryData, products: [] };
            mockCategoryModel.create.mockReturnValue(createdCategory);
            mockDatabase.write.mockResolvedValue({ status: 200, message: 'Success' });
            
            // Act - Create
            await categoryService.createCategory(categoryData);
            
            // Arrange - Get
            mockDatabase.read.mockResolvedValue([createdCategory]);
            
            // Act - Get
            const categories = await categoryService.getCategories();
            
            // Assert
            expect(categories).toHaveLength(1);
            expect(categories[0].id).toBe(5555555555);
            
            // Arrange - Delete
            mockDatabase.remove.mockResolvedValue({ status: 200, message: 'Removed' });
            
            // Act - Delete
            await categoryService.deleteCategoryById(5555555555);
            
            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledWith(CATEGORY_DATABASE, 5555555555);
        });

        it('should handle categories with special characters in name', async () => {
            // Arrange
            const categoryData = {
                name: 'Home & Garden - Indoor/Outdoor',
                description: 'Products for home & garden (50% off!)'
            };

            const createdCategory = {
                id: 7777777777,
                ...categoryData,
                products: []
            };

            mockCategoryModel.create.mockReturnValue(createdCategory);
            mockDatabase.write.mockResolvedValue({ 
                status: 200, 
                message: 'Data successfully written' 
            });

            // Act
            const result = await categoryService.createCategory(categoryData);

            // Assert
            expect(result.status).toBe(200);
            expect(createdCategory.name).toContain('&');
            expect(createdCategory.description).toContain('(50% off!)');
        });

        it('should handle category search by ID in large dataset', async () => {
            // Arrange
            const targetId = 1000000500;
            const largeCategoryList = Array.from({ length: 2000 }, (_, i) => ({
                id: 1000000000 + i,
                name: `Category${i}`,
                description: `Description ${i}`,
                products: []
            }));

            mockDatabase.read.mockResolvedValue(largeCategoryList);

            // Act
            const result = await categoryService.getCategoryById(targetId);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(targetId);
            expect(result.name).toBe('Category500');
        });

        it('should handle categories with nested product references', async () => {
            // Arrange
            const mockCategories = [
                {
                    id: 1111111111,
                    name: 'Electronics',
                    description: 'Tech products',
                    products: [
                        { id: 2000000001, name: 'Laptop', price: 1500, stock: 10 },
                        { id: 2000000002, name: 'Mouse', price: 25, stock: 100 },
                        { id: 2000000003, name: 'Keyboard', price: 75, stock: 50 }
                    ]
                }
            ];

            mockDatabase.read.mockResolvedValue(mockCategories);

            // Act
            const result = await categoryService.getCategories();

            // Assert
            expect(result[0].products).toHaveLength(3);
            expect(result[0].products.every(p => p.id && p.name && p.price !== undefined)).toBe(true);
        });

        it('should handle empty products array in categories', async () => {
            // Arrange
            const mockCategories = [
                { id: 1111111111, name: 'Empty Category 1', description: 'No products', products: [] },
                { id: 2222222222, name: 'Empty Category 2', description: 'Also empty', products: [] }
            ];

            mockDatabase.read.mockResolvedValue(mockCategories);

            // Act
            const result = await categoryService.getCategories();

            // Assert
            expect(result.every(c => c.products.length === 0)).toBe(true);
        });
    });
});
