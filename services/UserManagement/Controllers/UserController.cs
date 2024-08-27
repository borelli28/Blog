using Microsoft.AspNetCore.Mvc;
using UserManagement.Services;
using UserManagement.Models;


namespace UserManagement.Controllers;

[ApiController]
[Route("User/[controller]")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly IUserService _userService;

    public UserController(ILogger<UserController> logger, IUserService userService)
    {
        _logger = logger;
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetById(string id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound($"User with id {id} not found.");
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while fetching user with id {id}");
            return StatusCode(500, "An error occurred while processing your request.");
        }
    }

    [HttpPut]
    public async Task<IActionResult> UpdateUser(string id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound($"User with id {id} not found.");
            }
            User updatedUser = await _userService.UpdateAsync(user);
            return Ok(updatedUser);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while updating user with id {id}.");
            return StatusCode(500, "An error occurred while processing your request.");
        }
    }
}