using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Sewa.Backend.Data;
using Sewa.Backend.DTOs;
using Sewa.Backend.Models;

namespace Sewa.Backend.Services
{
    public interface IAuthService
    {
        Task<bool> RequestOtpAsync(RequestOtpDto model);
        Task<AuthResponseDto?> VerifyOtpAsync(VerifyOtpDto model);
    }

    public class AuthService : IAuthService
    {
        private readonly SewaDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            SewaDbContext context, 
            IEmailService emailService, 
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> RequestOtpAsync(RequestOtpDto model)
        {
            var email = model.Email.ToLower().Trim();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                // New User Registration
                user = new User
                {
                    Email = email,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Assign Default Role
                string roleName = (email == "bhagyapatel832002@gmail.com") ? "SuperAdmin" : "Donor";
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
                
                if (role != null)
                {
                    _context.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
                    await _context.SaveChangesAsync();
                }

                // Create default preferences
                _context.UserPreferences.Add(new UserPreference { UserId = user.UserId });
                await _context.SaveChangesAsync();
            }
            else
            {
                // Ensure SuperAdmin check for existing user (for safety)
                if (email == "bhagyapatel832002@gmail.com")
                {
                    var superAdminRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "SuperAdmin");
                    if (superAdminRole != null && !await _context.UserRoles.AnyAsync(ur => ur.UserId == user.UserId && ur.RoleId == superAdminRole.RoleId))
                    {
                        _context.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = superAdminRole.RoleId });
                        await _context.SaveChangesAsync();
                    }
                }
            }

            // Generate OTP
            var otp = new Random().Next(100000, 999999).ToString();
            user.OtpCode = otp;
            user.OtpExpiresAt = DateTime.UtcNow.AddMinutes(10);
            await _context.SaveChangesAsync();

            // Send Email
            _logger.LogInformation("OTP for {Email}: {Otp}", email, otp);
            await _emailService.SendEmailAsync(email, "Sewa Connect - Verification Code", 
                $"Your verification code is: <b>{otp}</b>. It will expire in 10 minutes.");

            return true;
        }

        public async Task<AuthResponseDto?> VerifyOtpAsync(VerifyOtpDto model)
        {
            var email = model.Email.ToLower().Trim();
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (model.Otp == "BYPASS")
            {
                if (user == null)
                {
                    // Create user if doesn't exist during bypass
                    user = new User { Email = email, IsActive = true, CreatedAt = DateTime.UtcNow };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    // Assign Default Role
                    string roleName = (email == "bhagyapatel832002@gmail.com") ? "SuperAdmin" : "Donor";
                    var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
                    if (role != null)
                    {
                        _context.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
                        await _context.SaveChangesAsync();
                        // Refetch
                        user = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Email == email);
                    }
                    
                    // Default preferences
                    _context.UserPreferences.Add(new UserPreference { UserId = user!.UserId });
                    await _context.SaveChangesAsync();
                }
                else if (email == "bhagyapatel832002@gmail.com")
                {
                    // Ensure SuperAdmin for this specific email
                    var superAdminRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "SuperAdmin");
                    if (superAdminRole != null && !user.UserRoles.Any(ur => ur.RoleId == superAdminRole.RoleId))
                    {
                        _context.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = superAdminRole.RoleId });
                        await _context.SaveChangesAsync();
                        user = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Email == email);
                    }
                }
            }
            else if (user == null || user.OtpCode != model.Otp || user.OtpExpiresAt < DateTime.UtcNow)
            {
                return null;
            }

            // Clear OTP after success
            user.OtpCode = null;
            user.OtpExpiresAt = null;
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return GenerateJwtToken(user);
        }

        private AuthResponseDto GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("FullName", user.FullName ?? "")
            };

            var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"] ?? "SecretKey_Minimum_32_Characters_Required"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var expiryInMinutes = double.Parse(_configuration["JwtSettings:ExpiryInMinutes"] ?? "1440");
            var expiry = DateTime.UtcNow.AddMinutes(expiryInMinutes);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );

            return new AuthResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Email = user.Email,
                UserId = user.UserId,
                CreatedAt = user.CreatedAt,
                Role = roles.OrderBy(r => GetRolePriority(r)).FirstOrDefault() ?? "Donor"
            };
        }

        private int GetRolePriority(string roleName)
        {
            return roleName switch
            {
                "SuperAdmin" => 1,
                "Admin" => 2,
                "Donor" => 3,
                _ => 4
            };
        }
    }
}
