using Microsoft.AspNetCore.Mvc;
using User.Services;
using User.Models;


namespace User.Controllers;

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

    [HttpGet("{username}", Name = "GetUserByUsername")]
    public ActionResult<User> GetByUsername(string username)
    {
        try
        {
            var user = _userService.GetByUsername(username);
            if (user == null)
            {
                return NotFound($"User with username {username} not found.");
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while fetching user with username {username}");
            return StatusCode(500, "An error occurred while processing your request.");
        }
    }

    [HttpGet("{id}", Name = "GetUserById")]
    public ActionResult<User> GetById(string id)
    {
        try
        {
            var user = _userService.GetById(id);
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
}