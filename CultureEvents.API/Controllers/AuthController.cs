using CultureEvents.API.Data;
using CultureEvents.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace CultureEvents.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IRepository<User> _userRepository;
        private readonly IConfiguration _configuration;

        public AuthController(IRepository<User> userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<object>> Register([FromBody] RegisterModel model)
        {
            if (model == null)
                return BadRequest("Invalid request data");

            // Check if user with this email already exists
            var existingUsers = await _userRepository.FindAsync(u => u.Email == model.Email);
            if (existingUsers.Any())
                return BadRequest("User with this email already exists");

            // Hash the password
            string passwordHash = HashPassword(model.Password);

            // Create new user
            var user = new User
            {
                Email = model.Email,
                Username = model.Username,
                PasswordHash = passwordHash,
                FullName = model.FullName,
                ProfilePicture = "https://randomuser.me/api/portraits/lego/1.jpg", // Default profile picture
                Role = "User" // Default role
            };

            await _userRepository.CreateAsync(user);

            // Generate token
            var token = GenerateJwtToken(user);

            return Ok(new { token, user });
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginModel model)
        {
            if (model == null)
                return BadRequest("Invalid request data");

            // Find user by email
            var users = await _userRepository.FindAsync(u => u.Email == model.Email);
            var user = users.FirstOrDefault();

            if (user == null)
                return Unauthorized("Invalid email or password");

            // Verify password
            if (!VerifyPassword(model.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password");

            // Generate token
            var token = GenerateJwtToken(user);

            return Ok(new { token, user });
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"] ?? "DefaultSecretKeyForDevelopment12345"));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role ?? "User"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(Convert.ToDouble(_configuration["JwtSettings:ExpiryHours"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            // This is a simple implementation - in a production app, use a proper password hashing library
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            var computedHash = HashPassword(password);
            return computedHash == storedHash;
        }
    }

    public class RegisterModel
    {
        public required string Email { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string FullName { get; set; }
    }

    public class LoginModel
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
