import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock Database ve UserModel
const mockDatabase = {
    write: jest.fn(),
    read: jest.fn(),
    remove: jest.fn()
};

const mockUserModel = {
    create: jest.fn()
};

// Mock'ları module seviyesinde tanımla
jest.unstable_mockModule('../../database/database.js', () => ({
    default: jest.fn(() => mockDatabase)
}));

jest.unstable_mockModule('../../models/user.js', () => ({
    default: jest.fn(() => mockUserModel)
}));

// UserService'i import et (mock'lardan sonra)
const { default: UserService } = await import('../../services/user-service.js');

describe('UserService', () => {
    let userService;
    const USER_DATABASE = join(__dirname, '../../database/data/user.data.json');

    beforeEach(() => {
        // Her test öncesi yeni bir instance oluştur ve mock'ları temizle
        userService = new UserService();
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            // Arrange
            const userData = {
                name: 'John',
                surname: 'Doe',
                username: 'johndoe',
                email: 'john@example.com',
                passwordHash: 'hashedPassword123'
            };

            const createdUser = {
                id: 1234567890,
                ...userData,
                basket: []
            };

            mockUserModel.create.mockReturnValue(createdUser);
            mockDatabase.write.mockResolvedValue({ 
                status: 200, 
                message: 'Data successfully written' 
            });

            // Act
            const result = await userService.createUser(userData);

            // Assert
            expect(mockUserModel.create).toHaveBeenCalledWith(userData);
            expect(mockDatabase.write).toHaveBeenCalledWith(USER_DATABASE, createdUser);
            expect(result).toEqual({ 
                status: 200, 
                message: 'Data successfully written' 
            });
        });

        it('should handle database write errors', async () => {
            // Arrange
            const userData = {
                name: 'Jane',
                surname: 'Smith',
                username: 'janesmith',
                email: 'jane@example.com',
                passwordHash: 'hashedPassword456'
            };

            const createdUser = {
                id: 9876543210,
                ...userData,
                basket: []
            };

            mockUserModel.create.mockReturnValue(createdUser);
            mockDatabase.write.mockResolvedValue({ 
                status: 500, 
                message: 'Error writing data',
                error: 'File system error'
            });

            // Act
            const result = await userService.createUser(userData);

            // Assert
            expect(result.status).toBe(500);
            expect(result.message).toBe('Error writing data');
        });

        it('should handle duplicate id errors', async () => {
            // Arrange
            const userData = {
                name: 'Alice',
                surname: 'Johnson',
                username: 'alicejohnson',
                email: 'alice@example.com',
                passwordHash: 'hashedPassword789'
            };

            const createdUser = {
                id: 1111111111,
                ...userData,
                basket: []
            };

            mockUserModel.create.mockReturnValue(createdUser);
            mockDatabase.write.mockResolvedValue({ 
                status: 409, 
                message: 'Duplicate id: 1111111111 already exists' 
            });

            // Act
            const result = await userService.createUser(userData);

            // Assert
            expect(result.status).toBe(409);
            expect(result.message).toContain('Duplicate id');
        });
    });

    describe('getUsers', () => {
        it('should return all users successfully', async () => {
            // Arrange
            const mockUsers = [
                {
                    id: 1234567890,
                    name: 'John',
                    surname: 'Doe',
                    username: 'johndoe',
                    email: 'john@example.com',
                    passwordHash: 'hash1',
                    basket: []
                },
                {
                    id: 9876543210,
                    name: 'Jane',
                    surname: 'Smith',
                    username: 'janesmith',
                    email: 'jane@example.com',
                    passwordHash: 'hash2',
                    basket: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockUsers);

            // Act
            const result = await userService.getUsers();

            // Assert
            expect(mockDatabase.read).toHaveBeenCalledWith(USER_DATABASE);
            expect(result).toEqual(mockUsers);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no users exist', async () => {
            // Arrange
            mockDatabase.read.mockResolvedValue([]);

            // Act
            const result = await userService.getUsers();

            // Assert
            expect(mockDatabase.read).toHaveBeenCalledWith(USER_DATABASE);
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });

    describe('getUserById', () => {
        it('should return user when found by id', async () => {
            // Arrange
            const targetId = 1234567890;
            const mockUsers = [
                {
                    id: 1234567890,
                    name: 'John',
                    surname: 'Doe',
                    username: 'johndoe',
                    email: 'john@example.com',
                    passwordHash: 'hash1',
                    basket: []
                },
                {
                    id: 9876543210,
                    name: 'Jane',
                    surname: 'Smith',
                    username: 'janesmith',
                    email: 'jane@example.com',
                    passwordHash: 'hash2',
                    basket: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockUsers);

            // Act
            const result = await userService.getUserById(targetId);

            // Assert
            expect(mockDatabase.read).toHaveBeenCalledWith(USER_DATABASE);
            expect(result).toEqual(mockUsers[0]);
            expect(result.id).toBe(targetId);
        });

        it('should return undefined when user not found', async () => {
            // Arrange
            const nonExistentId = 9999999999;
            const mockUsers = [
                {
                    id: 1234567890,
                    name: 'John',
                    surname: 'Doe',
                    username: 'johndoe',
                    email: 'john@example.com',
                    passwordHash: 'hash1',
                    basket: []
                }
            ];

            mockDatabase.read.mockResolvedValue(mockUsers);

            // Act
            const result = await userService.getUserById(nonExistentId);

            // Assert
            expect(result).toBeUndefined();
        });

        it('should handle empty database', async () => {
            // Arrange
            mockDatabase.read.mockResolvedValue([]);

            // Act
            const result = await userService.getUserById(1234567890);

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('deleteUserById', () => {
        it('should delete user successfully', async () => {
            // Arrange
            const userId = 1234567890;
            mockDatabase.remove.mockResolvedValue({ 
                status: 200, 
                message: 'Item successfully removed' 
            });

            // Act
            const result = await userService.deleteUserById(userId);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledWith(USER_DATABASE, userId);
            expect(result.status).toBe(200);
        });

        it('should handle user not found error', async () => {
            // Arrange
            const nonExistentId = 9999999999;
            mockDatabase.remove.mockResolvedValue({ 
                status: 404, 
                message: `Item with id ${nonExistentId} not found` 
            });

            // Act
            const result = await userService.deleteUserById(nonExistentId);

            // Assert
            expect(result.status).toBe(404);
            expect(result.message).toContain('not found');
        });
    });

    describe('deleteUsers', () => {
        it('should delete multiple users successfully', async () => {
            // Arrange
            const userIds = [1234567890, 9876543210, 5555555555];
            mockDatabase.remove
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' })
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' })
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' });

            // Act
            const result = await userService.deleteUsers(userIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(3);
            expect(result.status).toBe(200);
            expect(result.message).toContain('Attempted to delete 3 users');
            expect(result.results).toHaveLength(3);
        });

        it('should handle mixed success and failure results', async () => {
            // Arrange
            const userIds = [1234567890, 9999999999];
            mockDatabase.remove
                .mockResolvedValueOnce({ status: 200, message: 'Item successfully removed' })
                .mockResolvedValueOnce({ status: 404, message: 'Item with id 9999999999 not found' });

            // Act
            const result = await userService.deleteUsers(userIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(2);
            expect(result.status).toBe(200);
            expect(result.results).toHaveLength(2);
            expect(result.results[0].result.status).toBe(200);
            expect(result.results[1].result.status).toBe(404);
        });

        it('should return error when ids is not an array', async () => {
            // Act
            const result = await userService.deleteUsers('not-an-array');

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
            expect(mockDatabase.remove).not.toHaveBeenCalled();
        });

        it('should return error when ids array is empty', async () => {
            // Act
            const result = await userService.deleteUsers([]);

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
            expect(mockDatabase.remove).not.toHaveBeenCalled();
        });

        it('should return error when ids is null', async () => {
            // Act
            const result = await userService.deleteUsers(null);

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
        });

        it('should return error when ids is undefined', async () => {
            // Act
            const result = await userService.deleteUsers(undefined);

            // Assert
            expect(result.status).toBe(400);
            expect(result.message).toBe('ids must be a non-empty array');
        });

        it('should handle single id in array', async () => {
            // Arrange
            const userIds = [1234567890];
            mockDatabase.remove.mockResolvedValue({ 
                status: 200, 
                message: 'Item successfully removed' 
            });

            // Act
            const result = await userService.deleteUsers(userIds);

            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledTimes(1);
            expect(result.status).toBe(200);
            expect(result.results).toHaveLength(1);
        });
    });

    describe('Edge Cases and Integration', () => {
        it('should handle concurrent user creation', async () => {
            // Arrange
            const user1 = {
                name: 'User1',
                surname: 'Test1',
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: 'hash1'
            };

            const user2 = {
                name: 'User2',
                surname: 'Test2',
                username: 'user2',
                email: 'user2@example.com',
                passwordHash: 'hash2'
            };

            mockUserModel.create
                .mockReturnValueOnce({ id: 1111111111, ...user1, basket: [] })
                .mockReturnValueOnce({ id: 2222222222, ...user2, basket: [] });

            mockDatabase.write
                .mockResolvedValueOnce({ status: 200, message: 'Data successfully written' })
                .mockResolvedValueOnce({ status: 200, message: 'Data successfully written' });

            // Act
            const [result1, result2] = await Promise.all([
                userService.createUser(user1),
                userService.createUser(user2)
            ]);

            // Assert
            expect(result1.status).toBe(200);
            expect(result2.status).toBe(200);
            expect(mockDatabase.write).toHaveBeenCalledTimes(2);
        });

        it('should handle very long user lists in getUsers', async () => {
            // Arrange
            const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
                id: 1000000000 + i,
                name: `User${i}`,
                surname: `Surname${i}`,
                username: `user${i}`,
                email: `user${i}@example.com`,
                passwordHash: `hash${i}`,
                basket: []
            }));

            mockDatabase.read.mockResolvedValue(largeUserList);

            // Act
            const result = await userService.getUsers();

            // Assert
            expect(result).toHaveLength(1000);
            expect(result[0].name).toBe('User0');
            expect(result[999].name).toBe('User999');
        });

        it('should maintain data consistency after multiple operations', async () => {
            // Arrange - Create
            const userData = {
                name: 'Test',
                surname: 'User',
                username: 'testuser',
                email: 'test@example.com',
                passwordHash: 'hash'
            };
            
            const createdUser = { id: 5555555555, ...userData, basket: [] };
            mockUserModel.create.mockReturnValue(createdUser);
            mockDatabase.write.mockResolvedValue({ status: 200, message: 'Success' });
            
            // Act - Create
            await userService.createUser(userData);
            
            // Arrange - Get
            mockDatabase.read.mockResolvedValue([createdUser]);
            
            // Act - Get
            const users = await userService.getUsers();
            
            // Assert
            expect(users).toHaveLength(1);
            expect(users[0].id).toBe(5555555555);
            
            // Arrange - Delete
            mockDatabase.remove.mockResolvedValue({ status: 200, message: 'Removed' });
            
            // Act - Delete
            await userService.deleteUserById(5555555555);
            
            // Assert
            expect(mockDatabase.remove).toHaveBeenCalledWith(USER_DATABASE, 5555555555);
        });
    });
});
