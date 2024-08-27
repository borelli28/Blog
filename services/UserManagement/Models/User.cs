using System.ComponentModel.DataAnnotations;


namespace UserManagement.Models;

public class User
{
    [Key]
    [StringLength(10)]
    public string Id { get; set; } = Guid.NewGuid().ToString().Substring(0, 10);

    [Required]
    [StringLength(16, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [StringLength(128, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 12)]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
}