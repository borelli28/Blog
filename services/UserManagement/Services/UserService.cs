using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserManagement.Models;
using UserManagement.Data;


namespace UserManagement.Services;

public interface IUserService
{
    Task<(User? user, string? errorMessage)> RegisterAsync(User user);
    Task<(User? user, string? errorMessage)> LoginAsync(string username, string password);
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByUsernameAsync(string username);
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(string id);
}

public class UserService : IUserService
{
    private readonly UserManagementContext _context;
    private readonly PasswordHasher<User> _passwordHasher;

    public UserService(UserManagementContext context)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<User>();
    }

    public async Task<(User? user, string? errorMessage)> RegisterAsync(User user)
    {
        if (await _context.Users.AnyAsync(u => u.Username == user.Username))
            return (null, "Username already exists");
    
        user.Password = _passwordHasher.HashPassword(user, user.Password);
    
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    
        return (user, null);
    }

    public async Task<(User? user, string? errorMessage)> LoginAsync(string username, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            return (null, "Invalid username or password.");

        var result = _passwordHasher.VerifyHashedPassword(user, user.Password, password);

        if (result == PasswordVerificationResult.Failed)
            return (null, "Invalid username or password.");

        return (user, null);
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User> UpdateAsync(User user)
    {
        user.Password = _passwordHasher.HashPassword(user, user.Password);
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task DeleteAsync(string id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}