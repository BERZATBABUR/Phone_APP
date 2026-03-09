using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TelefonRehberApi.Data;
using TelefonRehberApi.Models;
using TelefonRehberApi.Models.Dtos;

namespace TelefonRehberApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ApplicationDbContext db, IConfiguration config, ILogger<AuthController> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new ApiError { Message = "Email ve şifre gerekli." });

        var email = req.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email))
        {
            _logger.LogWarning("Register failed: email already exists {Email}", email);
            return BadRequest(new ApiError { Message = "Bu e-posta adresi zaten kayıtlı." });
        }

        try
        {
            var user = new User
            {
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                DisplayName = req.DisplayName?.Trim()?.Length > 0 ? req.DisplayName.Trim() : null,
                CreatedAt = DateTime.UtcNow
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            _logger.LogInformation("User registered: Id={Id}, Email={Email}", user.Id, user.Email);
            return Ok(CreateAuthResponse(user));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Register failed for {Email}", email);
            return StatusCode(500, new ApiError { Message = "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin." });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new ApiError { Message = "Email ve şifre gerekli." });

        var email = req.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed for email {Email}", email);
            return Unauthorized(new ApiError { Message = "E-posta veya şifre hatalı." });
        }

        _logger.LogInformation("User logged in: Id={Id}, Email={Email}", user.Id, user.Email);
        return Ok(CreateAuthResponse(user));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        return Ok(CreateAuthResponse(user));
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        var token = GenerateJwt(user);
        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName
        };
    }

    private string GenerateJwt(User user)
    {
        var key = _config["Jwt:Key"] ?? "TelefonRehberSecretKeyAtLeast32CharsLong!";
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var creds = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString())
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "TelefonRehberApi",
            audience: _config["Jwt:Audience"] ?? "TelefonRehberUi",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
