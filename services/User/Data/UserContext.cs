using Microsoft.EntityFrameworkCore;
using UserService.Models;


namespace User.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

	public DbSet<User> Users { get; set; }
}
